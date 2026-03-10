"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { useFeeToggle } from "@/stores/useFeeToggle";
import { parseDate } from "@/lib/utils/date";
import type { FeeCalculationResult } from "@/lib/fees/calculator";

interface DailyReportCardProps {
  totalSales: number;
  feeResult: FeeCalculationResult;
  prevDaySales: number | null;
  weekdayAvg: number | null;
  date: string;
  channelRatios: { channel: string; ratio: number }[];
  totalExpenses?: number;
  totalCustomFees?: number;
}

function ChangeIndicator({ current, previous, label }: { current: number; previous: number | null; label: string }) {
  if (previous === null || previous === 0) return null;

  const diff = current - previous;
  const rate = (diff / previous) * 100;
  const isUp = diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex items-center justify-between">
      <span className="text-caption text-[var(--text-tertiary)]">{label}</span>
      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus size={14} className="text-[var(--text-tertiary)]" />
        ) : isUp ? (
          <TrendingUp size={14} className="text-success" />
        ) : (
          <TrendingDown size={14} className="text-danger" />
        )}
        <span className={`text-body-small font-display ${isNeutral ? "text-[var(--text-tertiary)]" : isUp ? "text-success" : "text-danger"}`}>
          {formatPercent(Math.abs(rate), { showSign: false })}
        </span>
        <span className={`text-caption font-display ${isUp ? "text-success" : "text-danger"}`}>
          ({formatCurrency(diff, { showSign: true })})
        </span>
      </div>
    </div>
  );
}

export function DailyReportCard({
  totalSales,
  feeResult,
  prevDaySales,
  weekdayAvg,
  date,
  channelRatios,
  totalExpenses = 0,
  totalCustomFees = 0,
}: DailyReportCardProps) {
  const { mode } = useFeeToggle();
  const displaySales = mode === "net" ? feeResult.netSales : totalSales;
  const animatedSales = useCountUp(displaySales);

  const dateObj = parseDate(date);
  const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      {/* 날짜 */}
      <p className="text-caption text-[var(--text-tertiary)] mb-1">
        {dateObj.getMonth() + 1}/{dateObj.getDate()} ({dayName}) 마감 리포트
      </p>

      {/* 매출 금액 */}
      <div className="mb-4">
        <p className="text-caption text-[var(--text-tertiary)] mb-0.5">
          {mode === "net" ? "실 수령액" : "총매출"}
        </p>
        <p className="amount-hero text-[var(--text-primary)]">
          <span className="won-symbol">₩</span>
          {animatedSales.toLocaleString("ko-KR")}
        </p>
      </div>

      {/* 수수료 정보 (총매출 모드일 때만 간단히) */}
      {mode === "gross" && feeResult.totalFees > 0 && (
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">수수료</p>
            <p className="text-body-small font-display text-[var(--fee-deducted)]">
              -{formatCurrency(feeResult.totalFees)}
            </p>
          </div>
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">실 수령</p>
            <p className="text-body-small font-display text-[var(--net-income)]">
              {formatCurrency(feeResult.netSales)}
            </p>
          </div>
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">수수료율</p>
            <p className="text-body-small font-display text-[var(--text-secondary)]">
              {formatPercent(feeResult.feeRatePercent)}
            </p>
          </div>
        </div>
      )}

      {/* 경비 & 순이익 */}
      {(totalExpenses > 0 || totalCustomFees > 0) && (() => {
        const allFees = feeResult.totalFees + totalCustomFees;
        const netProfit = totalSales - allFees - totalExpenses;
        return (
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
            {totalExpenses > 0 && (
              <div>
                <p className="text-caption text-[var(--text-tertiary)]">경비</p>
                <p className="text-body-small font-display text-[var(--fee-deducted)]">
                  -{formatCurrency(totalExpenses)}
                </p>
              </div>
            )}
            <div>
              <p className="text-caption text-[var(--text-tertiary)]">순이익</p>
              <p className={`text-body-small font-display font-semibold ${netProfit >= 0 ? "text-[var(--net-income)]" : "text-danger"}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            {totalSales > 0 && (
              <div>
                <p className="text-caption text-[var(--text-tertiary)]">수익률</p>
                <p className="text-body-small font-display text-[var(--text-secondary)]">
                  {formatPercent((netProfit / totalSales) * 100)}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* 비교 지표 */}
      <div className="space-y-2 mb-4">
        <ChangeIndicator current={totalSales} previous={prevDaySales} label="전일 대비" />
        <ChangeIndicator current={totalSales} previous={weekdayAvg} label={`${dayName}요일 4주 평균 대비`} />
      </div>

      {/* 채널 분배 바 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">채널 비율</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {channelRatios
            .filter((ch) => ch.ratio > 0)
            .map((ch, i) => {
              const colors = [
                "bg-primary-500",
                "bg-primary-300",
                "bg-secondary-400",
                "bg-success",
                "bg-warning",
                "bg-info",
              ];
              return (
                <motion.div
                  key={ch.channel}
                  initial={{ width: 0 }}
                  animate={{ width: `${ch.ratio}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`${colors[i % colors.length]} rounded-full`}
                />
              );
            })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {channelRatios
            .filter((ch) => ch.ratio > 0)
            .map((ch) => (
              <span key={ch.channel} className="text-caption text-[var(--text-tertiary)]">
                {ch.channel} {ch.ratio}%
              </span>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
