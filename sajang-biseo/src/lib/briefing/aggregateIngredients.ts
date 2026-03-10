/**
 * 식자재 효율 집계
 */

import type { IngredientEfficiencyData } from "./types";
import type { DailyUsage, OrderItem } from "@/lib/supabase/types";

export function aggregateIngredients(
  usages: DailyUsage[],
  items: OrderItem[]
): IngredientEfficiencyData {
  const totalUsed = usages.reduce((s, u) => s + u.used_qty, 0);
  const totalWaste = usages.reduce((s, u) => s + u.waste_qty, 0);
  const wasteRate = totalUsed + totalWaste > 0
    ? (totalWaste / (totalUsed + totalWaste)) * 100 : 0;

  // 폐기 금액 계산 (품목별 단가 적용)
  const priceMap = new Map<string, number>();
  items.forEach((item) => {
    priceMap.set(item.id, item.unit_price ?? 0);
  });

  const wasteByItem = new Map<string, { name: string; amount: number }>();
  usages.forEach((u) => {
    if (u.waste_qty > 0) {
      const price = priceMap.get(u.item_id) ?? 0;
      const item = items.find((i) => i.id === u.item_id);
      const name = item?.item_name ?? "기타";
      const existing = wasteByItem.get(u.item_id) ?? { name, amount: 0 };
      existing.amount += u.waste_qty * price;
      wasteByItem.set(u.item_id, existing);
    }
  });

  const wasteList = Array.from(wasteByItem.values()).sort((a, b) => b.amount - a.amount);
  const wasteAmount = wasteList.reduce((s, w) => s + w.amount, 0);

  const wasteTop3 = wasteList.slice(0, 3).map((w) => ({
    name: w.name,
    amount: w.amount,
    ratio: wasteAmount > 0 ? (w.amount / wasteAmount) * 100 : 0,
  }));

  return {
    wasteAmount, wasteRate, prevWasteRate: 0,
    accuracyRate: 0, prevAccuracyRate: 0,
    wasteTop3, tip: null,
  };
}
