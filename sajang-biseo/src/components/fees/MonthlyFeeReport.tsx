"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { MonthlyFeeReport as ReportType } from "@/lib/fees/aggregateFeesData";
import type { FeeMode } from "@/stores/useFeeToggle";

const CHANNEL_COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#EF4444"];

interface MonthlyFeeReportProps {
  report: ReportType;
  mode: FeeMode;
}

export function MonthlyFeeReport({ report, mode }: MonthlyFeeReportProps) {
  const totalFeesAnimated = useCountUp(report.totalFees);
  const feeRateAnimated = useCountUp(report.feeRate, { decimals: 1 });
  const netSales = report.totalSales - report.totalFees;
  const mainAmount = mode === "net" ? netSales : report.totalSales;

  return (
    <div className="glass-card p-5 space-y-4">
      <h4 className="text-heading-md text-[var(--text-primary)]">월간 수수료 리포트</h4>

      {/* 메인 수치 */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">
            {mode === "net" ? "순매출" : "총매출"}
          </p>
          <p className={`text-heading-md font-display ${mode === "net" ? "text-success" : "text-[var(--text-primary)]"}`}>
            {formatCurrency(mainAmount)}
          </p>
        </div>
        <div className="flex-1 bg-danger/10 rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">총 수수료</p>
          <p className="text-heading-md font-display text-danger">
            {formatCurrency(totalFeesAnimated)}
          </p>
        </div>
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">수수료율</p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {feeRateAnimated.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 채널별 수수료 비중 */}
      {report.channelFees.length > 0 && (
        <div className="space-y-3">
          <p className="text-caption text-[var(--text-tertiary)]">채널별 수수료 합산</p>
          <div className="flex h-3 rounded-full overflow-hidden">
            {report.channelFees.map((ch, i) => (
              <motion.div key={ch.channel} initial={{ width: 0 }}
                animate={{ width: `${ch.ratio}%` }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
            ))}
          </div>
          <div className="space-y-2">
            {report.channelFees.map((ch, i) => (
              <div key={ch.channel} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                <span className="text-body-small text-[var(--text-primary)] flex-1">{ch.channel}</span>
                <span className="text-body-small font-display text-[var(--text-primary)]">
                  {formatCurrency(ch.amount)}
                </span>
                <span className="text-caption text-[var(--text-tertiary)] w-12 text-right">
                  {formatPercent(ch.ratio, { decimals: 1 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.channelFees.length === 0 && (
        <p className="text-center text-body-small text-[var(--text-tertiary)] py-4">
          해당 월의 마감 데이터가 없습니다
        </p>
      )}
    </div>
  );
}
