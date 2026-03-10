"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { formatCurrency, formatCompact } from "@/lib/utils/format";

interface ExpenseTrendProps {
  data: { date: string; expenses: number }[];
  monthLabel: string;
}

/** 날짜를 주차(1~5)로 그룹핑 */
function groupByWeek(data: { date: string; expenses: number }[]) {
  const weeks: { label: string; total: number }[] = [];
  const map = new Map<number, number>();

  for (const d of data) {
    const day = new Date(d.date).getDate();
    const week = Math.ceil(day / 7);
    map.set(week, (map.get(week) ?? 0) + d.expenses);
  }

  Array.from(map.entries()).forEach(([week, total]) => {
    weeks.push({ label: `${week}주차`, total });
  });

  return weeks;
}

export function ExpenseTrend({ data, monthLabel }: ExpenseTrendProps) {
  const { total, average, weeks, maxWeek } = useMemo(() => {
    const t = data.reduce((s, d) => s + d.expenses, 0);
    const avg = data.length > 0 ? Math.round(t / data.length) : 0;
    const w = groupByWeek(data);
    const mx = Math.max(...w.map((wk) => wk.total), 1);
    return { total: t, average: avg, weeks: w, maxWeek: mx };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <Wallet size={16} className="text-danger" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">
          {monthLabel} 지출 추이
        </h3>
      </div>

      {/* 합계 / 일평균 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">총 지출</p>
          <p className="text-body-small font-display font-semibold text-danger">
            {formatCompact(total)}
          </p>
        </div>
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">일 평균</p>
          <p className="text-body-small font-display font-semibold text-[var(--text-primary)]">
            {formatCompact(average)}
          </p>
        </div>
      </div>

      {/* 주차별 가로 바 */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
        {weeks.map((wk, i) => {
          const pct = Math.max((wk.total / maxWeek) * 100, 4);
          return (
            <div key={wk.label} className="flex items-center gap-2">
              <span className="text-caption text-[var(--text-tertiary)] w-10 shrink-0">
                {wk.label}
              </span>
              <div className="flex-1 h-5 bg-[var(--bg-tertiary)] rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-md bg-danger/70"
                />
              </div>
              <span className="text-caption font-display text-[var(--text-secondary)] w-16 text-right shrink-0">
                {formatCurrency(wk.total, { showSymbol: false })}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
