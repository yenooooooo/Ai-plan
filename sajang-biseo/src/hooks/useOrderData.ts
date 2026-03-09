"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString, parseDate, addDays, formatDateShort, getDayNameFull } from "@/lib/utils/date";
import { getTemplateForBusiness, GROUP_ICONS } from "@/lib/order/templates";
import {
  generateRecommendations,
  type RecommendationInput,
  type RecommendationResult,
} from "@/lib/order/recommend";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";

export type { DBOrderItem, OrderItemGroup };

export function useOrderData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId, businessType } = useStoreSettings();

  const [groups, setGroups] = useState<OrderItemGroup[]>([]);
  const [items, setItems] = useState<DBOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 사용량 입력 상태
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [wasteMap, setWasteMap] = useState<Record<string, number>>({});
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [usageSaving, setUsageSaving] = useState(false);
  const [usageSaved, setUsageSaved] = useState(false);

  // 품목 편집 모달
  const [editModal, setEditModal] = useState<{
    open: boolean;
    item?: DBOrderItem | null;
    groupId: string;
  }>({ open: false, groupId: "" });

  // 발주 추천
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<Map<string, number>>(new Map());
  const [recLoading, setRecLoading] = useState(false);

  // ── 데이터 로드 ──
  const loadData = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    const [groupsRes, itemsRes] = await Promise.all([
      supabase
        .from("sb_order_item_groups")
        .select("*")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("sb_order_items")
        .select("*")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .order("sort_order"),
    ]);

    setGroups(groupsRes.data ?? []);
    setItems(itemsRes.data ?? []);
    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── 일일 사용량 로드 ──
  const loadUsageForDate = useCallback(async () => {
    if (!storeId) return;

    const { data } = await supabase
      .from("sb_daily_usage")
      .select("*")
      .eq("store_id", storeId)
      .eq("date", selectedDate);

    if (data && data.length > 0) {
      const uMap: Record<string, number> = {};
      const wMap: Record<string, number> = {};
      const sMap: Record<string, number> = {};
      for (const row of data) {
        uMap[row.item_id] = row.used_qty;
        wMap[row.item_id] = row.waste_qty;
        sMap[row.item_id] = row.remaining_stock;
      }
      setUsageMap(uMap);
      setWasteMap(wMap);
      setStockMap(sMap);
      setUsageSaved(true);
    } else {
      const yesterday = toDateString(addDays(parseDate(selectedDate), -1));
      const { data: prevData } = await supabase
        .from("sb_daily_usage")
        .select("item_id, remaining_stock")
        .eq("store_id", storeId)
        .eq("date", yesterday);

      const sMap: Record<string, number> = {};
      if (prevData) {
        for (const row of prevData) {
          sMap[row.item_id] = row.remaining_stock;
        }
      }
      setUsageMap({});
      setWasteMap({});
      setStockMap(sMap);
      setUsageSaved(false);
    }
  }, [storeId, selectedDate, supabase]);

  useEffect(() => { loadUsageForDate(); }, [loadUsageForDate]);

  // ── 초기 세팅: 템플릿 로드 ──
  const initializeFromTemplate = useCallback(async () => {
    if (!storeId) return;

    const template = getTemplateForBusiness(businessType || "한식");

    const groupInserts = template.map((g, i) => ({
      store_id: storeId,
      group_name: g.groupName,
      icon: g.icon,
      sort_order: i,
    }));

    const { data: newGroups, error: groupErr } = await supabase
      .from("sb_order_item_groups")
      .insert(groupInserts)
      .select();

    if (groupErr || !newGroups) { console.error("그룹 생성 실패:", groupErr); return; }

    const groupIdMap = new Map<string, string>();
    for (const g of newGroups) {
      groupIdMap.set(g.group_name, g.id);
    }

    const itemInserts = template.flatMap((g) =>
      g.items.map((item, i) => ({
        store_id: storeId,
        group_id: groupIdMap.get(g.groupName) ?? null,
        item_name: item.name,
        unit: item.unit,
        unit_price: item.unitPrice,
        default_order_qty: item.defaultOrderQty,
        shelf_life_days: item.shelfLifeDays,
        sort_order: i,
      }))
    );

    const { error: itemErr } = await supabase.from("sb_order_items").insert(itemInserts);
    if (itemErr) console.error("품목 생성 실패:", itemErr);
    await loadData();
  }, [storeId, businessType, supabase, loadData]);

  useEffect(() => {
    if (!loading && groups.length === 0 && storeId) {
      initializeFromTemplate();
    }
  }, [loading, groups.length, storeId, initializeFromTemplate]);

  // ── 사용량 핸들러 ──
  const handleUsageChange = (itemId: string, value: number) => {
    setUsageMap((prev) => ({ ...prev, [itemId]: value }));
    setUsageSaved(false);
  };

  const handleWasteChange = (itemId: string, value: number) => {
    setWasteMap((prev) => ({ ...prev, [itemId]: value }));
    setUsageSaved(false);
  };

  // 프리셋 적용
  const applyPreset = (type: "weekday" | "weekend") => {
    const map: Record<string, number> = {};
    const active = items.filter((i) => i.is_active);
    active.forEach((item) => {
      const base = item.default_order_qty ?? 1;
      map[item.id] = type === "weekend" ? Math.round(base * 1.3) : base;
    });
    setUsageMap(map);
    setUsageSaved(false);
  };

  // 사용량 저장
  const saveUsage = async () => {
    if (!storeId) return;
    setUsageSaving(true);

    const activeItems = items.filter((i) => i.is_active);

    const { error: delErr } = await supabase
      .from("sb_daily_usage")
      .delete()
      .eq("store_id", storeId)
      .eq("date", selectedDate);
    if (delErr) { console.error("사용량 삭제 실패:", delErr); setUsageSaving(false); return; }

    const inserts = activeItems
      .filter((item) => (usageMap[item.id] ?? 0) > 0 || (wasteMap[item.id] ?? 0) > 0)
      .map((item) => {
        const used = usageMap[item.id] ?? 0;
        const waste = wasteMap[item.id] ?? 0;
        const prevStock = stockMap[item.id] ?? 0;
        const remaining = Math.max(0, prevStock - used - waste);
        return {
          store_id: storeId,
          item_id: item.id,
          date: selectedDate,
          used_qty: used,
          waste_qty: waste,
          remaining_stock: remaining,
        };
      });

    if (inserts.length > 0) {
      const { error: usageErr } = await supabase.from("sb_daily_usage").insert(inserts);
      if (usageErr) { console.error("사용량 저장 실패:", usageErr); setUsageSaving(false); return; }
    }

    setUsageSaving(false);
    setUsageSaved(inserts.length > 0);
  };

  // ── 발주 추천 생성 ──
  const generateRecs = useCallback(async () => {
    if (!storeId) return;
    setRecLoading(true);

    const activeItems = items.filter((i) => i.is_active);

    const fourWeeksAgo = toDateString(addDays(new Date(), -28));
    const { data: usageData } = await supabase
      .from("sb_daily_usage")
      .select("item_id, date, used_qty")
      .eq("store_id", storeId)
      .gte("date", fourWeeksAgo);

    const { data: latestUsage } = await supabase
      .from("sb_daily_usage")
      .select("item_id, remaining_stock")
      .eq("store_id", storeId)
      .eq("date", toDateString(new Date()));

    const stockByItem = new Map<string, number>();
    if (latestUsage) {
      for (const row of latestUsage) {
        stockByItem.set(row.item_id, row.remaining_stock);
      }
    }

    const usageByItem = new Map<string, { date: string; usedQty: number }[]>();
    if (usageData) {
      for (const row of usageData) {
        const arr = usageByItem.get(row.item_id) ?? [];
        arr.push({ date: row.date, usedQty: row.used_qty });
        usageByItem.set(row.item_id, arr);
      }
    }

    const inputs: RecommendationInput[] = activeItems.map((item) => ({
      itemId: item.id,
      itemName: item.item_name,
      unit: item.unit,
      currentStock: stockByItem.get(item.id) ?? 0,
      defaultOrderQty: item.default_order_qty,
      usageHistory: usageByItem.get(item.id) ?? [],
    }));

    const recs = generateRecommendations(inputs);
    setRecommendations(recs);
    setConfirmedItems(new Map());
    setRecLoading(false);
  }, [storeId, items, supabase]);

  // 발주 확인
  const handleConfirm = (itemId: string, qty: number) => {
    setConfirmedItems((prev) => {
      const next = new Map(prev);
      if (next.has(itemId)) { next.delete(itemId); } else { next.set(itemId, qty); }
      return next;
    });
  };

  // ── 품목 관리 핸들러 ──
  const handleAddGroup = async (name: string): Promise<boolean> => {
    if (!storeId || !name.trim()) return false;

    const { error: addGroupErr } = await supabase.from("sb_order_item_groups").insert({
      store_id: storeId,
      group_name: name.trim(),
      icon: GROUP_ICONS[name.trim()] ?? "📦",
      sort_order: groups.length,
    });
    if (addGroupErr) { console.error("그룹 추가 실패:", addGroupErr); return false; }
    await loadData();
    return true;
  };

  const handleSaveItem = async (data: {
    item_name: string;
    unit: string;
    unit_price: number | null;
    default_order_qty: number;
    shelf_life_days: number | null;
    supplier_name: string | null;
    supplier_contact: string | null;
    group_id: string;
  }) => {
    if (!storeId) return;

    if (editModal.item) {
      const { error: updateErr } = await supabase
        .from("sb_order_items")
        .update(data)
        .eq("id", editModal.item.id);
      if (updateErr) { console.error("품목 수정 실패:", updateErr); return; }
    } else {
      const { error: createErr } = await supabase.from("sb_order_items").insert({
        ...data,
        store_id: storeId,
        sort_order: items.filter((i) => i.group_id === data.group_id).length,
      });
      if (createErr) { console.error("품목 생성 실패:", createErr); return; }
    }

    setEditModal({ open: false, groupId: "" });
    loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("이 품목을 삭제하시겠습니까?")) return;
    const { error: softDelErr } = await supabase
      .from("sb_order_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", itemId);
    if (softDelErr) { console.error("품목 삭제 실패:", softDelErr); return; }
    loadData();
  };

  const handleToggleItem = async (itemId: string, isActive: boolean) => {
    const { error: toggleErr } = await supabase
      .from("sb_order_items")
      .update({ is_active: isActive })
      .eq("id", itemId);
    if (toggleErr) { console.error("품목 토글 실패:", toggleErr); return; }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_active: isActive } : i))
    );
  };

  // ── 파생 데이터 ──
  const activeItems = useMemo(() => items.filter((i) => i.is_active), [items]);

  const itemsMap = useMemo(() => {
    const map = new Map<string, DBOrderItem>();
    for (const item of items) { map.set(item.id, item); }
    return map;
  }, [items]);

  const confirmedList = useMemo(
    () => Array.from(confirmedItems.entries()).map(([itemId, qty]) => ({ itemId, qty })),
    [confirmedItems]
  );

  const hasUsageData = useMemo(
    () => Object.values(usageMap).some((v) => v > 0) || Object.values(wasteMap).some((v) => v > 0),
    [usageMap, wasteMap]
  );

  const needOrderRecs = recommendations.filter((r) => r.recommendedQty > 0);
  const sufficientRecs = recommendations.filter((r) => r.recommendedQty === 0);

  const tomorrow = addDays(new Date(), 1);
  const orderDateLabel = `${formatDateShort(tomorrow)} ${getDayNameFull(tomorrow).slice(-3)}`;

  return {
    groups, items, loading, activeItems, itemsMap,
    selectedDate, setSelectedDate,
    usageMap, setUsageMap, wasteMap, stockMap,
    usageSaving, usageSaved,
    editModal, setEditModal,
    recommendations, confirmedItems, confirmedList, recLoading,
    needOrderRecs, sufficientRecs, orderDateLabel,
    hasUsageData,
    handleUsageChange, handleWasteChange, applyPreset, saveUsage,
    generateRecs, initializeFromTemplate,
    handleConfirm, handleAddGroup, handleSaveItem, handleDeleteItem, handleToggleItem,
  };
}
