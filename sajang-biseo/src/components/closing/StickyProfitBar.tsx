"use client";

import { formatCurrency } from "@/lib/utils/format";

interface StickyProfitBarProps {
  totalSales: number;
  totalFees: number;
  totalExpenses: number;
}

function compactAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)}천만`;
  if (abs >= 10_000) return `${Math.round(amount / 10_000)}만`;
  return amount.toLocaleString("ko-KR");
}

export function StickyProfitBar({ totalSales, totalFees, totalExpenses }: StickyProfitBarProps) {
  if (totalSales === 0) return null;

  const profit = totalSales - totalFees - totalExpenses;
  const profitRate = Math.round((profit / totalSales) * 1000) / 10;

  return (
    <div className="lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-30 lg:pointer-events-none">
      <div className="lg:max-w-screen-lg lg:mx-auto lg:px-4 lg:pb-2 lg:pointer-events-auto">
        <div className="bg-[var(--bg-elevated)] backdrop-blur-md border border-[var(--border-default)] rounded-2xl px-4 py-2.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">매출</p>
              <p className="text-caption font-display text-[var(--text-primary)]">{compactAmount(totalSales)}</p>
            </div>
            <span className="text-[var(--text-tertiary)]">-</span>
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">수수료</p>
              <p className="text-caption font-display text-[var(--fee-deducted)]">{compactAmount(totalFees)}</p>
            </div>
            {totalExpenses > 0 && (
              <>
                <span className="text-[var(--text-tertiary)]">-</span>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)]">지출</p>
                  <p className="text-caption font-display text-[var(--fee-deducted)]">{compactAmount(totalExpenses)}</p>
                </div>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--text-tertiary)]">순이익 ({profitRate}%)</p>
            <p className={`text-body-small font-display font-bold ${profit >= 0 ? "text-[var(--net-income)]" : "text-danger"}`}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
