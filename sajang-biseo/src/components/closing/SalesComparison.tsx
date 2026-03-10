"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

interface ComparisonData {
  label: string;
  current: number;
  previous: number | null;
}

interface SalesComparisonProps {
  /** 이번 주 매출 */
  thisWeekSales: number;
  /** 지난 주 매출 */
  lastWeekSales: number | null;
  /** 이번 달 매출 */
  thisMonthSales: number;
  /** 지난 달 동일 시점 매출 */
  lastMonthSales: number | null;
  /** 오늘 매출 */
  todaySales: number;
  /** 전일 매출 */
  prevDaySales: number | null;
}

export function SalesComparison({
  thisWeekSales, lastWeekSales,
  thisMonthSales, lastMonthSales,
  todaySales, prevDaySales,
}: SalesComparisonProps) {
  const comparisons: ComparisonData[] = useMemo(() => [
    { label: "전일 대비", current: todaySales, previous: prevDaySales },
    { label: "전주 대비", current: thisWeekSales, previous: lastWeekSales },
    { label: "전월 동기 대비", current: thisMonthSales, previous: lastMonthSales },
  ], [todaySales, prevDaySales, thisWeekSales, lastWeekSales, thisMonthSales, lastMonthSales]);

  const validComparisons = comparisons.filter((c) => c.previous !== null && c.previous > 0);
  if (validComparisons.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-primary-500" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">매출 비교</h3>
      </div>

      <div className="space-y-2.5">
        {validComparisons.map((comp, idx) => {
          const diff = comp.current - comp.previous!;
          const rate = (diff / comp.previous!) * 100;
          const isUp = diff > 0;
          const isNeutral = diff === 0;

          return (
            <motion.div key={comp.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                {isNeutral ? <Minus size={14} className="text-[var(--text-tertiary)]" />
                  : isUp ? <TrendingUp size={14} className="text-success" />
                  : <TrendingDown size={14} className="text-danger" />}
                <span className="text-body-small text-[var(--text-secondary)]">{comp.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-body-small font-display font-semibold ${
                  isNeutral ? "text-[var(--text-tertiary)]" : isUp ? "text-success" : "text-danger"
                }`}>
                  {isUp ? "+" : ""}{formatPercent(rate, { showSign: false })}
                </span>
                <span className={`text-caption font-display ${isUp ? "text-success" : "text-danger"}`}>
                  ({formatCurrency(diff, { showSign: true })})
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
