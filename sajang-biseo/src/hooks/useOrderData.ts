"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { toDateString, parseDate, addDays, formatDateShort, getDayNameFull } from "@/lib/utils/date";
import { getTemplateForBusiness, GROUP_ICONS, type TemplateGroup } from "@/lib/order/templates";
import {
  generateRecommendations,
  type RecommendationInput,
  type RecommendationResult,
} from "@/lib/order/recommend";
import type { OrderItem as DBOrderItem, OrderItemGroup, DailyOrder } from "@/lib/supabase/types";

export type { DBOrderItem, OrderItemGroup, DailyOrder };

export function useOrderData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId, businessType } = useStoreSettings();
  const toast = useToast((s) => s.show);

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
  const [prevUsageMap, setPrevUsageMap] = useState<Record<string, number>>({});

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

  // 발주 입력 (오늘 발주 → 내일 재고 반영)
  const [orderMap, setOrderMap] = useState<Record<string, number>>({});
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);

  // ── 데이터 로드 ──
  const loadData = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    try {
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

      if (groupsRes.error) throw groupsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setGroups(groupsRes.data ?? []);
      setItems(itemsRes.data ?? []);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      toast("품목 데이터를 불러오지 못했습니다", "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── 일일 사용량 로드 ──
  const loadUsageForDate = useCallback(async () => {
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from("sb_daily_usage")
        .select("*")
        .eq("store_id", storeId)
        .eq("date", selectedDate);

      if (error) throw error;

      // 어제 사용량 로드 (참고값)
      const yesterday = toDateString(addDays(parseDate(selectedDate), -1));
      const { data: prevData, error: prevErr } = await supabase
        .from("sb_daily_usage")
        .select("item_id, used_qty, remaining_stock")
        .eq("store_id", storeId)
        .eq("date", yesterday);

      if (prevErr) throw prevErr;

      const prevUMap: Record<string, number> = {};
      if (prevData) {
        for (const row of prevData) {
          prevUMap[row.item_id] = row.used_qty;
        }
      }
      setPrevUsageMap(prevUMap);

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
    } catch (err) {
      console.error("사용량 로드 실패:", err);
      toast("사용량 데이터를 불러오지 못했습니다", "error");
    }
  }, [storeId, selectedDate, supabase, toast]);

  useEffect(() => { loadUsageForDate(); }, [loadUsageForDate]);

  // ── 초기 세팅: 템플릿 로드 (수동 호출 전용) ──
  const initializeFromTemplate = useCallback(async () => {
    if (!storeId) return;

    try {
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

      if (groupErr || !newGroups) throw groupErr ?? new Error("그룹 생성 실패");

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
      if (itemErr) throw itemErr;

      toast("기본 품목을 불러왔습니다", "success");
      await loadData();
    } catch (err) {
      console.error("템플릿 초기화 실패:", err);
      toast("기본 품목 불러오기에 실패했습니다", "error");
    }
  }, [storeId, businessType, supabase, loadData, toast]);

  // 자동 초기화 제거 — 사용자가 "기본 품목 불러오기" 버튼을 눌러야만 실행

  // ── 같은 요일 평균 사용량 (자동 학습) ──
  const [avgUsageMap, setAvgUsageMap] = useState<Record<string, number>>({});

  const loadWeekdayAverage = useCallback(async () => {
    if (!storeId) return;
    try {
      const fourWeeksAgo = toDateString(addDays(new Date(), -28));
      const todayDow = parseDate(selectedDate).getDay();

      const { data, error } = await supabase
        .from("sb_daily_usage")
        .select("item_id, date, used_qty")
        .eq("store_id", storeId)
        .gte("date", fourWeeksAgo);

      if (error) throw error;
      if (!data) return;

      // 같은 요일만 필터링
      const sameDayData = data.filter((d) => {
        const dow = new Date(d.date + "T00:00:00").getDay();
        return dow === todayDow;
      });

      const byItem = new Map<string, number[]>();
      for (const row of sameDayData) {
        const arr = byItem.get(row.item_id) ?? [];
        arr.push(row.used_qty);
        byItem.set(row.item_id, arr);
      }

      const avgMap: Record<string, number> = {};
      Array.from(byItem.entries()).forEach(([itemId, values]) => {
        avgMap[itemId] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
      });
      setAvgUsageMap(avgMap);
    } catch (err) {
      console.error("요일별 평균 로드 실패:", err);
    }
  }, [storeId, selectedDate, supabase]);

  useEffect(() => { loadWeekdayAverage(); }, [loadWeekdayAverage]);

  // 자동 채우기: 같은 요일 평균으로 사용량 세팅
  const autoFillUsage = useCallback(() => {
    if (Object.keys(avgUsageMap).length === 0) return;
    setUsageMap(avgUsageMap);
    setUsageSaved(false);
    toast("요일 평균 사용량으로 채워졌습니다", "info");
  }, [avgUsageMap, toast]);

  // ── 입고 처리 ──
  const [stockReceiving, setStockReceiving] = useState(false);

  const receiveStock = useCallback(async (entries: { itemId: string; qty: number }[]) => {
    if (!storeId) return;
    setStockReceiving(true);

    try {
      // 현재 재고에 입고량 추가
      for (const entry of entries) {
        const currentStock = stockMap[entry.itemId] ?? 0;
        const newStock = currentStock + entry.qty;

        // 오늘자 사용량 데이터가 있으면 remaining_stock 업데이트
        const { error } = await supabase
          .from("sb_daily_usage")
          .upsert({
            store_id: storeId,
            item_id: entry.itemId,
            date: selectedDate,
            used_qty: usageMap[entry.itemId] ?? 0,
            waste_qty: wasteMap[entry.itemId] ?? 0,
            remaining_stock: newStock,
          }, { onConflict: "store_id,item_id,date" });

        if (error) throw error;
        setStockMap((prev) => ({ ...prev, [entry.itemId]: newStock }));
      }

      toast("입고가 처리되었습니다", "success");
    } catch (err) {
      console.error("입고 처리 실패:", err);
      toast("입고 처리에 실패했습니다", "error");
    } finally {
      setStockReceiving(false);
    }
  }, [storeId, selectedDate, stockMap, usageMap, wasteMap, supabase, toast]);

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

    try {
      const activeItems = items.filter((i) => i.is_active);

      const { error: delErr } = await supabase
        .from("sb_daily_usage")
        .delete()
        .eq("store_id", storeId)
        .eq("date", selectedDate);
      if (delErr) throw delErr;

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
        if (usageErr) throw usageErr;
      }

      setUsageSaved(true);
      toast("사용량이 저장되었습니다", "success");
    } catch (err) {
      console.error("사용량 저장 실패:", err);
      toast("사용량 저장에 실패했습니다", "error");
    } finally {
      setUsageSaving(false);
    }
  };

  // ── 발주 추천 생성 ──
  const generateRecs = useCallback(async () => {
    if (!storeId) return;
    setRecLoading(true);

    try {
      const activeItems = items.filter((i) => i.is_active);

      const fourWeeksAgo = toDateString(addDays(new Date(), -28));
      const { data: usageData, error: usageErr } = await supabase
        .from("sb_daily_usage")
        .select("item_id, date, used_qty")
        .eq("store_id", storeId)
        .gte("date", fourWeeksAgo);

      if (usageErr) throw usageErr;

      const { data: latestUsage, error: latestErr } = await supabase
        .from("sb_daily_usage")
        .select("item_id, remaining_stock")
        .eq("store_id", storeId)
        .eq("date", toDateString(new Date()));

      if (latestErr) throw latestErr;

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
    } catch (err) {
      console.error("발주 추천 생성 실패:", err);
      toast("발주 추천을 생성하지 못했습니다", "error");
    } finally {
      setRecLoading(false);
    }
  }, [storeId, items, supabase, toast]);

  // 발주 확인
  const handleConfirm = (itemId: string, qty: number) => {
    setConfirmedItems((prev) => {
      const next = new Map(prev);
      if (next.has(itemId)) { next.delete(itemId); } else { next.set(itemId, qty); }
      return next;
    });
  };

  // ── 발주 입력 핸들러 ──
  const handleOrderChange = (itemId: string, value: number) => {
    setOrderMap((prev) => ({ ...prev, [itemId]: value }));
    setOrderSaved(false);
  };

  // 확정된 발주를 orderMap에 반영 (기존 수동 편집 보존)
  const applyConfirmedToOrders = useCallback(() => {
    setOrderMap((prev) => {
      const next = { ...prev };
      Array.from(confirmedItems.entries()).forEach(([itemId, qty]) => {
        next[itemId] = qty;
      });
      // 확정 해제된 항목은 제거
      Object.keys(next).forEach((id) => {
        if (!confirmedItems.has(id) && next[id] > 0) {
          // 수동 편집된 항목은 유지
        }
      });
      return next;
    });
    setOrderSaved(false);
  }, [confirmedItems]);

  // 발주 저장 (DB + 가격 이력 기록)
  const saveOrders = useCallback(async () => {
    if (!storeId) return;
    setOrderSaving(true);

    try {
      const orderDate = toDateString(addDays(new Date(), 1)); // 내일 날짜

      // 기존 발주 삭제 후 재입력
      const { error: delErr } = await supabase.from("sb_daily_orders").delete()
        .eq("store_id", storeId).eq("date", orderDate);
      if (delErr) throw delErr;

      const inserts = Object.entries(orderMap)
        .filter(([, qty]) => qty > 0)
        .map(([itemId, qty]) => {
          const item = items.find((i) => i.id === itemId);
          return {
            store_id: storeId,
            item_id: itemId,
            date: orderDate,
            order_qty: qty,
            unit_price_at_order: item?.unit_price ?? null,
            supplier_name: item?.supplier_name ?? null,
          };
        });

      if (inserts.length > 0) {
        const { error: orderErr } = await supabase.from("sb_daily_orders").insert(inserts);
        if (orderErr) throw orderErr;

        // 가격 이력 기록 (단가가 있는 품목만)
        const priceInserts = inserts
          .filter((ins) => ins.unit_price_at_order != null)
          .map((ins) => ({
            store_id: storeId,
            item_id: ins.item_id,
            date: orderDate,
            unit_price: ins.unit_price_at_order!,
          }));

        if (priceInserts.length > 0) {
          await supabase.from("sb_item_price_history")
            .upsert(priceInserts, { onConflict: "store_id,item_id,date" });
        }
      }

      setOrderSaved(true);
      toast("발주가 저장되었습니다", "success");
    } catch (err) {
      console.error("발주 저장 실패:", err);
      toast("발주 저장에 실패했습니다", "error");
    } finally {
      setOrderSaving(false);
    }
  }, [storeId, orderMap, items, supabase, toast]);

  // 발주 이력 로드 (특정 날짜)
  const loadOrdersForDate = useCallback(async (date: string) => {
    if (!storeId) return;
    try {
      const { data, error } = await supabase.from("sb_daily_orders").select("*")
        .eq("store_id", storeId).eq("date", date);
      if (error) throw error;
      if (data && data.length > 0) {
        const map: Record<string, number> = {};
        for (const row of data) { map[row.item_id] = row.order_qty; }
        setOrderMap(map);
        setOrderSaved(true);
      } else {
        setOrderMap({});
        setOrderSaved(false);
      }
    } catch (err) {
      console.error("발주 이력 로드 실패:", err);
      toast("발주 이력을 불러오지 못했습니다", "error");
    }
  }, [storeId, supabase, toast]);

  // ── 품목 관리 핸들러 ──
  const handleAddGroup = async (name: string): Promise<boolean> => {
    if (!storeId || !name.trim()) return false;

    try {
      const { error: addGroupErr } = await supabase.from("sb_order_item_groups").insert({
        store_id: storeId,
        group_name: name.trim(),
        icon: GROUP_ICONS[name.trim()] ?? "📦",
        sort_order: groups.length,
      });
      if (addGroupErr) throw addGroupErr;
      await loadData();
      return true;
    } catch (err) {
      console.error("그룹 추가 실패:", err);
      toast("카테고리 추가에 실패했습니다", "error");
      return false;
    }
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
    if (!storeId || itemSaving) return;
    setItemSaving(true);

    try {
      if (editModal.item) {
        const { error: updateErr } = await supabase
          .from("sb_order_items")
          .update(data)
          .eq("id", editModal.item.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: createErr } = await supabase.from("sb_order_items").insert({
          ...data,
          store_id: storeId,
          sort_order: items.filter((i) => i.group_id === data.group_id).length,
        });
        if (createErr) throw createErr;
      }

      setEditModal({ open: false, groupId: "" });
      await loadData();
      toast(editModal.item ? "품목이 수정되었습니다" : "품목이 추가되었습니다", "success");
    } catch (err) {
      console.error("품목 저장 실패:", err);
      toast("품목 저장에 실패했습니다", "error");
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error: softDelErr } = await supabase
        .from("sb_order_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", itemId);
      if (softDelErr) throw softDelErr;
      await loadData();
    } catch (err) {
      console.error("품목 삭제 실패:", err);
      toast("품목 삭제에 실패했습니다", "error");
    }
  };

  const handleToggleItem = async (itemId: string, isActive: boolean) => {
    try {
      const { error: toggleErr } = await supabase
        .from("sb_order_items")
        .update({ is_active: isActive })
        .eq("id", itemId);
      if (toggleErr) throw toggleErr;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_active: isActive } : i))
      );
    } catch (err) {
      console.error("품목 토글 실패:", err);
      toast("품목 상태 변경에 실패했습니다", "error");
    }
  };

  // ── 카테고리 이름 변경 ──
  const handleRenameGroup = async (groupId: string, newName: string): Promise<boolean> => {
    if (!storeId || !newName.trim()) return false;
    try {
      const updateData: { group_name: string; icon?: string } = { group_name: newName.trim() };
      if (GROUP_ICONS[newName.trim()]) updateData.icon = GROUP_ICONS[newName.trim()];
      const { error } = await supabase.from("sb_order_item_groups").update(updateData).eq("id", groupId);
      if (error) throw error;
      await loadData();
      toast("카테고리 이름이 변경되었습니다", "success");
      return true;
    } catch (err) {
      console.error("그룹 이름 변경 실패:", err);
      toast("카테고리 이름 변경에 실패했습니다", "error");
      return false;
    }
  };

  // ── 카테고리 삭제 ──
  const handleDeleteGroup = async (groupId: string): Promise<boolean> => {
    if (!storeId) return false;
    try {
      const now = new Date().toISOString();
      await supabase.from("sb_order_items").update({ deleted_at: now }).eq("group_id", groupId);
      const { error } = await supabase.from("sb_order_item_groups").update({ deleted_at: now }).eq("id", groupId);
      if (error) throw error;
      await loadData();
      toast("카테고리가 삭제되었습니다", "success");
      return true;
    } catch (err) {
      console.error("그룹 삭제 실패:", err);
      toast("카테고리 삭제에 실패했습니다", "error");
      return false;
    }
  };

  // ── 카테고리 순서 변경 ──
  const handleReorderGroup = async (groupId: string, direction: "up" | "down"): Promise<void> => {
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= groups.length) return;
    try {
      const a = groups[idx];
      const b = groups[swapIdx];
      await Promise.all([
        supabase.from("sb_order_item_groups").update({ sort_order: b.sort_order }).eq("id", a.id),
        supabase.from("sb_order_item_groups").update({ sort_order: a.sort_order }).eq("id", b.id),
      ]);
      await loadData();
    } catch (err) {
      console.error("그룹 순서 변경 실패:", err);
      toast("순서 변경에 실패했습니다", "error");
    }
  };

  // ── 품목 카테고리 이동 ──
  const handleMoveItem = async (itemId: string, targetGroupId: string): Promise<void> => {
    try {
      const targetItems = items.filter((i) => i.group_id === targetGroupId);
      const { error } = await supabase.from("sb_order_items")
        .update({ group_id: targetGroupId, sort_order: targetItems.length })
        .eq("id", itemId);
      if (error) throw error;
      await loadData();
      toast("품목이 이동되었습니다", "success");
    } catch (err) {
      console.error("품목 이동 실패:", err);
      toast("품목 이동에 실패했습니다", "error");
    }
  };

  // ── 일괄 삭제/비활성화 ──
  const handleBulkAction = async (itemIds: string[], action: "delete" | "activate" | "deactivate"): Promise<void> => {
    if (itemIds.length === 0) return;
    try {
      if (action === "delete") {
        const { error } = await supabase.from("sb_order_items")
          .update({ deleted_at: new Date().toISOString() }).in("id", itemIds);
        if (error) throw error;
        toast(`${itemIds.length}개 품목이 삭제되었습니다`, "success");
      } else {
        const isActive = action === "activate";
        const { error } = await supabase.from("sb_order_items")
          .update({ is_active: isActive }).in("id", itemIds);
        if (error) throw error;
        toast(`${itemIds.length}개 품목이 ${isActive ? "활성화" : "비활성화"}되었습니다`, "success");
      }
      await loadData();
    } catch (err) {
      console.error("일괄 작업 실패:", err);
      toast("일괄 작업에 실패했습니다", "error");
    }
  };

  // ── 선택적 템플릿 가져오기 ──
  const initializeFromSelected = async (selectedGroups: TemplateGroup[]): Promise<void> => {
    if (!storeId || selectedGroups.length === 0) return;
    try {
      const nonEmpty = selectedGroups.filter((g) => g.items.length > 0);
      if (nonEmpty.length === 0) return;

      const existingNames = new Set(groups.map((g) => g.group_name));
      const newGroupInserts = nonEmpty
        .filter((g) => !existingNames.has(g.groupName))
        .map((g, i) => ({
          store_id: storeId,
          group_name: g.groupName,
          icon: g.icon,
          sort_order: groups.length + i,
        }));

      const groupIdMap = new Map<string, string>();
      for (const g of groups) groupIdMap.set(g.group_name, g.id);

      if (newGroupInserts.length > 0) {
        const { data: newGroups, error: groupErr } = await supabase
          .from("sb_order_item_groups").insert(newGroupInserts).select();
        if (groupErr || !newGroups) throw groupErr ?? new Error("그룹 생성 실패");
        for (const g of newGroups) groupIdMap.set(g.group_name, g.id);
      }

      const itemInserts = nonEmpty.flatMap((g) =>
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
      if (itemErr) throw itemErr;

      toast(`${itemInserts.length}개 품목을 추가했습니다`, "success");
      await loadData();
    } catch (err) {
      console.error("선택 품목 추가 실패:", err);
      toast("품목 추가에 실패했습니다", "error");
    }
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
    usageMap, setUsageMap, wasteMap, stockMap, prevUsageMap,
    usageSaving, usageSaved,
    editModal, setEditModal,
    recommendations, confirmedItems, confirmedList, recLoading,
    needOrderRecs, sufficientRecs, orderDateLabel,
    hasUsageData,
    orderMap, setOrderMap, orderSaving, orderSaved, itemSaving,
    handleUsageChange, handleWasteChange, applyPreset, saveUsage,
    generateRecs, initializeFromTemplate,
    handleConfirm, handleAddGroup, handleSaveItem, handleDeleteItem, handleToggleItem,
    handleOrderChange, applyConfirmedToOrders, saveOrders, loadOrdersForDate,
    handleRenameGroup, handleDeleteGroup, handleReorderGroup, handleMoveItem, handleBulkAction,
    initializeFromSelected,
    avgUsageMap, autoFillUsage,
    stockReceiving, receiveStock,
  };
}
