"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { FeeSummaryData } from "@/lib/briefing/types";

const FEE_COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];

interface FeeCardProps {
  data: FeeSummaryData;
}

export function FeeCard({ data }: FeeCardProps) {
  const totalAnimated = useCountUp(data.totalFees);
  const maxFee = Math.max(...data.channelFees.map((c) => c.amount), 1);

  return (
    <div className="space-y-4">
      {/* 메인 수치 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-1">총 수수료</p>
        <p className="text-[28px] font-display font-bold text-[var(--text-primary)]">
          {formatCurrency(totalAnimated)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-body-small text-[var(--text-secondary)]">
            매출 대비 {formatPercent(data.feeRate)}
          </span>
          <span className="text-caption text-[var(--text-tertiary)]">
            (전주 {formatPercent(data.prevFeeRate)})
          </span>
        </div>
      </div>

      {/* 채널별 수수료 */}
      <div className="space-y-2.5">
        <p className="text-caption text-[var(--text-tertiary)]">채널별 수수료</p>
        {data.channelFees.map((ch, i) => (
          <div key={ch.channel} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-body-small text-[var(--text-primary)]">{ch.channel}</span>
              <div className="flex items-center gap-2">
                <span className="text-body-small font-display text-[var(--text-primary)]">
                  {formatCurrency(ch.amount)}
                </span>
                <span className="text-caption text-[var(--text-tertiary)]">
                  ({formatPercent(ch.ratio, { decimals: 1 })})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(ch.amount / maxFee) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full rounded-full"
                style={{ backgroundColor: FEE_COLORS[i % FEE_COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 인사이트 */}
      <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
        <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
          {data.insight}
        </p>
      </div>
    </div>
  );
}
