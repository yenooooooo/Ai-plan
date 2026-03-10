/**
 * 비용 분석 집계
 * - 영수증 category_id로 카테고리별 분류
 */

import type { ExpenseSummaryData } from "./types";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

const EXPENSE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#F97316", "#EC4899"];

export function aggregateExpenses(
  receipts: Receipt[],
  categories: ReceiptCategory[],
  totalSales: number,
  netSales: number
): ExpenseSummaryData {
  const totalExpense = receipts.reduce((s, r) => s + r.total_amount, 0);
  const costRate = totalSales > 0 ? (totalExpense / totalSales) * 100 : 0;
  const costRateNet = netSales > 0 ? (totalExpense / netSales) * 100 : 0;

  // 카테고리별 금액 합산
  const catMap = new Map<string, number>();
  receipts.forEach((r) => {
    const label = categories.find((c) => c.id === r.category_id)?.label ?? "기타";
    catMap.set(label, (catMap.get(label) ?? 0) + r.total_amount);
  });

  const expenseCategories: ExpenseSummaryData["categories"] = [];
  let idx = 0;
  Array.from(catMap.entries()).forEach(([label, amount]) => {
    expenseCategories.push({
      label,
      amount,
      ratio: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
    });
    idx++;
  });

  return {
    totalExpense,
    costRate,
    costRateNet,
    categories: expenseCategories,
    prevComparison: [],
    warning: null,
  };
}
