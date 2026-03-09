"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ExpenseSummaryData } from "@/lib/briefing/types";

interface ExpenseCardProps {
  data: ExpenseSummaryData;
}

export function ExpenseCard({ data }: ExpenseCardProps) {
  const totalAnimated = useCountUp(data.totalExpense);
  const rateAnimated = useCountUp(data.costRate, { decimals: 1 });

  // 원가율 게이지 (0~100%)
  const gaugePercent = Math.min(data.costRate, 100);
  const gaugeColor =
    data.costRate > 40 ? "bg-danger" :
    data.costRate > 30 ? "bg-warning" :
    "bg-success";

  return (
    <div className="space-y-4">
      {/* 메인 수치 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-1">총 경비</p>
          <p className="text-[28px] font-display font-bold text-[var(--text-primary)]">
            {formatCurrency(totalAnimated)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">원가율</p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {rateAnimated.toFixed(1)}%
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            순매출 기준 {formatPercent(data.costRateNet)}
          </p>
        </div>
      </div>

      {/* 원가율 게이지 */}
      <div>
        <div className="h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gaugePercent}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${gaugeColor}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">0%</span>
          <span className="text-[11px] text-[var(--text-tertiary)]">50%</span>
          <span className="text-[11px] text-[var(--text-tertiary)]">100%</span>
        </div>
      </div>

      {/* 카테고리별 파이차트 대체 (가로 바) */}
      {data.categories.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption text-[var(--text-tertiary)]">카테고리별 비용</p>

          {/* 비율 바 */}
          <div className="flex h-3 rounded-full overflow-hidden">
            {data.categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ width: 0 }}
                animate={{ width: `${cat.ratio}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ backgroundColor: cat.color }}
              />
            ))}
          </div>

          {/* 범례 */}
          <div className="space-y-1.5">
            {data.categories.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                  <span className="text-caption text-[var(--text-primary)]">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-caption font-display text-[var(--text-primary)]">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {Math.round(cat.ratio)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전주 대비 */}
      {data.prevComparison.length > 0 && (
        <div className="space-y-1">
          <p className="text-caption text-[var(--text-tertiary)]">전주 대비</p>
          {data.prevComparison.map((p) => (
            <div key={p.label} className="flex items-center justify-between text-caption">
              <span className="text-[var(--text-secondary)]">{p.label}</span>
              <span className={p.diff > 0 ? "text-danger" : "text-success"}>
                {p.diff > 0 ? "+" : ""}{formatCurrency(p.diff)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 경고 */}
      {data.warning && (
        <div className="flex items-start gap-2 bg-warning/10 rounded-xl p-3">
          <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
          <p className="text-caption text-warning leading-relaxed">{data.warning}</p>
        </div>
      )}
    </div>
  );
}
