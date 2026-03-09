"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString, addDays, formatDateShort } from "@/lib/utils/date";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

export interface UsageChartPoint { label: string; usage: number; waste: number; }
export interface WasteItem { name: string; wasteQty: number; unit: string; cost: number; }

export function useOrderAnalytics(items: DBOrderItem[], activeItemId?: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();

  const now = new Date();
  const monthLabel = `${now.getMonth() + 1}월`;
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = toDateString(now);

  const [loading, setLoading] = useState(false);
  const [usageRows, setUsageRows] = useState<{ item_id: string; date: string; used_qty: number; waste_qty: number }[]>([]);
  const [grossSales, setGrossSales] = useState(0);
  const [netSales, setNetSales] = useState(0);

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    const [usageRes, salesRes] = await Promise.all([
      supabase
        .from("sb_daily_usage")
        .select("item_id, date, used_qty, waste_qty")
        .eq("store_id", storeId)
        .gte("date", monthStart)
        .lte("date", monthEnd),
      supabase
        .from("sb_daily_closing")
        .select("total_sales, net_sales")
        .eq("store_id", storeId)
        .gte("date", monthStart)
        .lte("date", monthEnd),
    ]);

    if (usageRes.data) setUsageRows(usageRes.data);
    if (salesRes.data) {
      setGrossSales(salesRes.data.reduce((s, r) => s + r.total_sales, 0));
      setNetSales(salesRes.data.reduce((s, r) => s + r.net_sales, 0));
    }
    setLoading(false);
  }, [storeId, monthStart, monthEnd]);

  useEffect(() => { load(); }, [load]);

  const itemsMap = useMemo(() => {
    const map = new Map<string, DBOrderItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  // 선택된 품목 14일 사용량 차트
  const usageChartData = useMemo((): UsageChartPoint[] => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(new Date(), -(13 - i));
      const dateStr = toDateString(d);
      const row = activeItemId
        ? usageRows.find((r) => r.item_id === activeItemId && r.date === dateStr)
        : null;
      return { label: formatDateShort(d), usage: row?.used_qty ?? 0, waste: row?.waste_qty ?? 0 };
    });
  }, [usageRows, activeItemId]);

  // 이번 달 식자재비 합계 (사용량 × 단가)
  const totalCost = useMemo(() => {
    return Math.round(
      usageRows.reduce((sum, row) => {
        const item = itemsMap.get(row.item_id);
        return sum + row.used_qty * (item?.unit_price ?? 0);
      }, 0)
    );
  }, [usageRows, itemsMap]);

  // 폐기 통계
  const { totalWasteCost, topWasteItems } = useMemo(() => {
    const byItem = new Map<string, { qty: number; cost: number }>();
    for (const row of usageRows) {
      if (row.waste_qty <= 0) continue;
      const unitPrice = itemsMap.get(row.item_id)?.unit_price ?? 0;
      const prev = byItem.get(row.item_id) ?? { qty: 0, cost: 0 };
      byItem.set(row.item_id, { qty: prev.qty + row.waste_qty, cost: prev.cost + row.waste_qty * unitPrice });
    }

    let totalWasteCost = 0;
    const topWasteItems: WasteItem[] = [];
    Array.from(byItem.entries()).forEach(([itemId, { qty, cost }]) => {
      const item = itemsMap.get(itemId);
      if (!item) return;
      totalWasteCost += cost;
      topWasteItems.push({ name: item.item_name, wasteQty: qty, unit: item.unit, cost: Math.round(cost) });
    });

    return {
      totalWasteCost: Math.round(totalWasteCost),
      topWasteItems: topWasteItems.sort((a, b) => b.cost - a.cost).slice(0, 5),
    };
  }, [usageRows, itemsMap]);

  return { usageChartData, totalCost, totalWasteCost, topWasteItems, grossSales, netSales, monthLabel, loading };
}
