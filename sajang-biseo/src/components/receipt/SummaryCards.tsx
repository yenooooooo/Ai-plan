"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface SummaryCardsProps {
  receipts: Receipt[];
  categories: ReceiptCategory[];
}

export function SummaryCards({ receipts, categories }: SummaryCardsProps) {
  const total = receipts.reduce((s, r) => s + r.total_amount, 0);
  const animatedTotal = useCountUp(total, { duration: 600 });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // 카테고리별 합산
  const catTotals = new Map<string, number>();
  for (const r of receipts) {
    const key = r.category_id ?? "none";
    catTotals.set(key, (catTotals.get(key) ?? 0) + r.total_amount);
  }

  const catEntries = Array.from(catTotals.entries())
    .map(([catId, amount]) => {
      const cat = catId !== "none" ? catMap.get(catId) : null;
      return {
        catId,
        label: cat?.label ?? "미분류",
        icon: cat?.icon ?? "📋",
        code: cat?.code ?? "F99",
        amount,
        ratio: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-3">
      {/* 총 합계 카드 */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-[var(--text-tertiary)] mb-0.5">
              총 {receipts.length}건
            </p>
            <p className="text-amount-card font-display text-[var(--text-primary)]">
              {formatCurrency(animatedTotal)}
            </p>
          </div>
        </div>

        {/* 카테고리 분포 바 */}
        {catEntries.length > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full overflow-hidden flex">
              {catEntries.map((entry, i) => (
                <motion.div
                  key={entry.catId}
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.ratio}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.code] ?? "#6B7280" }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 카테고리별 합산표 */}
      {catEntries.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">
            카테고리별 합산
          </h4>
          <div className="space-y-2">
            {catEntries.map((entry) => (
              <div key={entry.catId} className="flex items-center justify-between">
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
                    {entry.ratio.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
