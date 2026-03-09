"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Crown, ArrowDown } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency, formatPercent, formatCompact } from "@/lib/utils/format";
import type { SalesSummaryData } from "@/lib/briefing/types";

interface SalesCardProps {
  data: SalesSummaryData;
}

export function SalesCard({ data }: SalesCardProps) {
  const totalAnimated = useCountUp(data.totalSales);
  const netAnimated = useCountUp(data.netSales);
  const avgAnimated = useCountUp(data.dailyAvg);

  const maxDaily = Math.max(...data.dailySales.map((d) => d.amount), 1);
  const isUp = data.changeRate >= 0;

  return (
    <div className="space-y-4">
      {/* 메인 수치 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-1">총매출</p>
        <p className="text-[28px] font-display font-bold text-[var(--text-primary)]">
          {formatCurrency(totalAnimated)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-body-small text-[var(--text-secondary)]">
            순매출 {formatCurrency(netAnimated)}
          </span>
          <span className="text-caption text-[var(--text-tertiary)]">
            (수수료 {formatPercent(data.feeRate)})
          </span>
        </div>
      </div>

      {/* 일평균 + 전주 대비 */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3">
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">일평균</p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {formatCompact(avgAnimated)}
          </p>
        </div>
        <div className={`flex-1 rounded-xl p-3 ${isUp ? "bg-success/10" : "bg-danger/10"}`}>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">전주 대비</p>
          <div className="flex items-center gap-1">
            {isUp ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-danger" />}
            <p className={`text-heading-md font-display ${isUp ? "text-success" : "text-danger"}`}>
              {formatPercent(Math.abs(data.changeRate), { showSign: false })}
            </p>
          </div>
          <p className={`text-[11px] ${isUp ? "text-success/70" : "text-danger/70"}`}>
            {isUp ? "+" : ""}{formatCompact(data.changeAmount)}
          </p>
        </div>
      </div>

      {/* 요일별 막대그래프 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">요일별 매출</p>
        <div className="flex items-end gap-1.5 h-20">
          {data.dailySales.map((d, i) => {
            const height = (d.amount / maxDaily) * 100;
            const isBest = d.amount === data.bestDay.amount && d.amount > 0;
            const isWorst = d.amount === data.worstDay.amount && d.amount > 0 && data.dailySales.length > 1;
            return (
              <div key={d.date || i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full rounded-t-md ${
                    isBest ? "bg-primary-500" : isWorst ? "bg-danger/60" : "bg-primary-500/30"
                  }`}
                />
                <span className="text-[11px] text-[var(--text-tertiary)]">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 최고/최저 */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 text-caption text-primary-500">
          <Crown size={12} /> 최고: {data.bestDay.day} {formatCompact(data.bestDay.amount)}
        </div>
        <div className="flex items-center gap-1.5 text-caption text-danger">
          <ArrowDown size={12} /> 최저: {data.worstDay.day} {formatCompact(data.worstDay.amount)}
        </div>
      </div>

      {/* 채널별 비율 */}
      {data.channelRatio.length > 0 && (
        <div className="text-caption text-[var(--text-secondary)]">
          채널별: {data.channelRatio.map((c) => `${c.channel} ${Math.round(c.ratio)}%`).join(" | ")}
        </div>
      )}
    </div>
  );
}
