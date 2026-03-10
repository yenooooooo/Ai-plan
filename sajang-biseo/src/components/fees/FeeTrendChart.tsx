"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCompact, formatPercent } from "@/lib/utils/format";
import type { MonthlyFeeReport } from "@/lib/fees/aggregateFeesData";

interface FeeTrendChartProps {
  data: MonthlyFeeReport[];
}

export function FeeTrendChart({ data }: FeeTrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-body-small text-[var(--text-tertiary)]">
          2개월 이상의 데이터가 쌓이면 추이 차트를 표시합니다
        </p>
      </div>
    );
  }

  const maxFee = Math.max(...data.map((d) => d.totalFees), 1);
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const rateChange = latest.feeRate - prev.feeRate;
  const isDown = rateChange <= 0;

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-heading-md text-[var(--text-primary)]">수수료율 추이</h4>
        <div className={`flex items-center gap-1 text-caption ${isDown ? "text-success" : "text-danger"}`}>
          {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          전월 대비 {formatPercent(Math.abs(rateChange), { showSign: false })}
        </div>
      </div>

      {/* 바 차트 */}
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const height = (d.totalFees / maxFee) * 100;
          const monthLabel = d.month.split("-")[1] + "월";
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {d.feeRate.toFixed(1)}%
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 6)}%` }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`w-full rounded-t-md ${
                  i === data.length - 1 ? "bg-danger" : "bg-danger/30"
                }`}
              />
              <span className="text-[11px] text-[var(--text-tertiary)]">{monthLabel}</span>
            </div>
          );
        })}
      </div>

      {/* 요약 */}
      <div className="flex justify-between text-caption text-[var(--text-secondary)]">
        <span>평균 수수료율: {formatPercent(data.reduce((s, d) => s + d.feeRate, 0) / data.length)}</span>
        <span>총 수수료: {formatCompact(data.reduce((s, d) => s + d.totalFees, 0))}</span>
      </div>
    </div>
  );
}
