"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCompact, formatPercent } from "@/lib/utils/format";

interface ProfitTrendData {
  date: string;
  sales: number;
  fees: number;
  expenses: number;
}

interface ProfitTrendProps {
  data: ProfitTrendData[];
  monthLabel: string;
  daysRemaining: number;
}

export function ProfitTrend({ data, monthLabel, daysRemaining }: ProfitTrendProps) {
  const { avgDailyProfit, projectedMonthlyProfit, trend } = useMemo(() => {
    if (data.length < 3) return { avgDailyProfit: 0, projectedMonthlyProfit: 0, trend: 0 };

    const profits = data.map((d) => d.sales - d.fees - d.expenses);
    const totalProfit = profits.reduce((s, p) => s + p, 0);
    const avg = Math.round(totalProfit / profits.length);

    // 최근 7일 vs 이전 7일 비교로 트렌드 계산
    const recentSlice = profits.slice(-7);
    const earlierSlice = profits.slice(-14, -7);

    const recentAvg = recentSlice.length > 0
      ? Math.round(recentSlice.reduce((s, p) => s + p, 0) / recentSlice.length) : 0;
    const earlierAvg = earlierSlice.length > 0
      ? Math.round(earlierSlice.reduce((s, p) => s + p, 0) / earlierSlice.length) : 0;

    const trendPct = earlierAvg !== 0 ? ((recentAvg - earlierAvg) / Math.abs(earlierAvg)) * 100 : 0;

    // 이번 달 예상: 현재까지 실적 + 남은 일수 × 최근 일평균
    const projected = totalProfit + (daysRemaining * recentAvg);

    return { avgDailyProfit: avg, projectedMonthlyProfit: projected, trend: trendPct };
  }, [data, daysRemaining]);

  const isUp = trend > 2;
  const isDown = trend < -2;

  // 미니 스파크라인 (최근 14일 수익)
  const sparkData = useMemo(() => {
    const profits = data.slice(-14).map((d) => d.sales - d.fees - d.expenses);
    if (profits.length < 2) return "";
    const max = Math.max(...profits);
    const min = Math.min(...profits);
    const range = max - min || 1;
    const h = 32;
    const w = 120;
    const step = w / (profits.length - 1);
    return profits.map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [data]);

  if (data.length < 3) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDown ? <TrendingDown size={16} className="text-danger" />
            : isUp ? <TrendingUp size={16} className="text-success" />
            : <Minus size={16} className="text-[var(--text-tertiary)]" />}
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">수익 트렌드</h3>
        </div>
        {sparkData && (
          <svg width={120} height={32} className="overflow-visible">
            <path d={sparkData} fill="none"
              stroke={isDown ? "var(--color-danger)" : isUp ? "var(--color-success)" : "var(--color-primary-400)"}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">일 평균 수익</p>
          <p className={`text-body-small font-display font-semibold ${avgDailyProfit >= 0 ? "text-[var(--text-primary)]" : "text-danger"}`}>
            {formatCompact(avgDailyProfit)}
          </p>
        </div>
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">{monthLabel} 예상 수익</p>
          <p className={`text-body-small font-display font-semibold ${projectedMonthlyProfit >= 0 ? "text-[var(--text-primary)]" : "text-danger"}`}>
            {formatCompact(projectedMonthlyProfit)}
          </p>
        </div>
      </div>

      {/* 트렌드 표시 */}
      <div className={`flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]`}>
        <span className={`text-caption font-medium ${isDown ? "text-danger" : isUp ? "text-success" : "text-[var(--text-tertiary)]"}`}>
          {isUp ? "상승세" : isDown ? "하락세" : "횡보"}
          {Math.abs(trend) > 2 && ` ${formatPercent(Math.abs(trend))}`}
        </span>
        <span className="text-caption text-[var(--text-tertiary)]">
          (최근 7일 vs 이전 7일)
        </span>
      </div>
    </motion.div>
  );
}
