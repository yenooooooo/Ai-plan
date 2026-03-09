"use client";

import { formatCurrency } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";

interface ProfitSummaryProps {
  totalSales: number;
  totalFees: number;
  totalExpenses: number;
}

export function ProfitSummary({ totalSales, totalFees, totalExpenses }: ProfitSummaryProps) {
  const netProfit = totalSales - totalFees - totalExpenses;
  const animatedProfit = useCountUp(netProfit);
  const profitRate = totalSales > 0 ? Math.round((netProfit / totalSales) * 1000) / 10 : 0;

  return (
    <div className="glass-card p-5 border border-[var(--border-accent)]/20">
      <p className="text-caption text-[var(--text-tertiary)] mb-3">💰 오늘 실제 남긴 돈</p>

      {/* 계산 내역 */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-body-small">
          <span className="text-[var(--text-secondary)]">총매출</span>
          <span className="font-display text-[var(--text-primary)] tabular-nums">
            {formatCurrency(totalSales, { showSymbol: false })}
          </span>
        </div>
        <div className="flex justify-between text-body-small">
          <span className="text-[var(--text-secondary)]">수수료</span>
          <span className="font-display text-[var(--fee-deducted)] tabular-nums">
            -{formatCurrency(totalFees, { showSymbol: false })}
          </span>
        </div>
        {totalExpenses > 0 && (
          <div className="flex justify-between text-body-small">
            <span className="text-[var(--text-secondary)]">오늘 지출</span>
            <span className="font-display text-[var(--fee-deducted)] tabular-nums">
              -{formatCurrency(totalExpenses, { showSymbol: false })}
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-accent)]/30 to-transparent mb-3" />

      {/* 최종 순이익 */}
      <div className="flex items-end justify-between">
        <span className="text-body-small font-medium text-[var(--text-secondary)]">실제 순이익</span>
        <div className="text-right">
          <p className={`font-display text-[1.75rem] font-bold leading-none tabular-nums ${netProfit >= 0 ? "text-[var(--net-income)]" : "text-[var(--danger)]"}`}>
            <span className="text-[1rem] mr-0.5">₩</span>
            {Math.abs(animatedProfit).toLocaleString("ko-KR")}
          </p>
          <p className="text-caption text-[var(--text-tertiary)] mt-1 tabular-nums">
            매출 대비 {profitRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
