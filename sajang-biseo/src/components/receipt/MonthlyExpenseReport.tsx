"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface MonthlyExpenseReportProps {
  receipts: Receipt[];
  categories: ReceiptCategory[];
}

export function MonthlyExpenseReport({ receipts, categories }: MonthlyExpenseReportProps) {
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const { total, top3, currentMonth } = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${yyyy}-${mm}`;

    const monthly = receipts.filter((r) => r.date.startsWith(prefix) && !r.deleted_at);
    const sum = monthly.reduce((s, r) => s + r.total_amount, 0);

    // Category aggregation
    const catTotals = new Map<string, number>();
    for (const r of monthly) {
      const key = r.category_id ?? "none";
      catTotals.set(key, (catTotals.get(key) ?? 0) + r.total_amount);
    }

    const sorted = Array.from(catTotals.entries())
      .map(([catId, amount]) => {
        const cat = catId !== "none" ? catMap.get(catId) : null;
        return {
          catId,
          label: cat?.label ?? "미분류",
          icon: cat?.icon ?? "📋",
          code: cat?.code ?? "F99",
          amount,
          ratio: sum > 0 ? (amount / sum) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return { total: sum, top3: sorted, currentMonth: `${yyyy}.${mm}` };
  }, [receipts, catMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
          {currentMonth} 경비 리포트
        </h4>
        <span className="text-caption text-[var(--text-tertiary)]">이번 달</span>
      </div>

      {/* Total */}
      <p className="text-amount-card font-display text-[var(--text-primary)]">
        {formatCurrency(total)}
      </p>

      {/* Top 3 categories */}
      {top3.length > 0 && (
        <div className="space-y-2">
          {top3.map((entry, i) => (
            <motion.div
              key={entry.catId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.code] ?? "#6B7280" }}
                />
                <span className="text-caption text-[var(--text-primary)]">
                  {entry.icon} {entry.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-caption font-display text-[var(--text-primary)]">
                  {formatCurrency(entry.amount)}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] w-10 text-right">
                  {formatPercent(entry.ratio)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Month-over-month hint */}
      <p className="text-caption text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-default)]">
        지난달 대비 경비 추이는 다음 달 초에 비교 리포트로 제공됩니다.
      </p>
    </motion.div>
  );
}
