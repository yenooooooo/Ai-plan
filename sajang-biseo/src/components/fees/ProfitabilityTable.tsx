"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ChannelProfitability } from "@/lib/fees/aggregateFeesData";

interface ProfitabilityTableProps {
  data: ChannelProfitability[];
  prevData?: ChannelProfitability[];
}

export function ProfitabilityTable({ data, prevData = [] }: ProfitabilityTableProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h4 className="text-heading-md text-[var(--text-primary)] mb-3">채널별 수익성 비교</h4>
        <p className="text-body-small text-[var(--text-tertiary)] text-center py-4">
          마감 데이터가 있으면 채널별 수익성을 비교합니다
        </p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.feeRate - b.feeRate);
  const bestChannel = sorted[0];
  const prevMap = new Map(prevData.map((p) => [p.channel, p]));

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-heading-md text-[var(--text-primary)]">채널별 수익성 비교</h4>
        <div className="flex items-center gap-1 text-caption text-[var(--text-tertiary)]">
          <TrendingUp size={12} />
          수익성 높은 순
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
      <div className="grid grid-cols-5 gap-1 text-[11px] text-[var(--text-tertiary)] font-medium px-1 min-w-[340px]">
        <span>채널</span>
        <span className="text-right">매출</span>
        <span className="text-right">수수료</span>
        <span className="text-right">순매출</span>
        <span className="text-right">수수료율</span>
      </div>

      <div className="space-y-1.5">
        {sorted.map((ch, i) => {
          const isBest = ch.channel === bestChannel.channel;
          const prev = prevMap.get(ch.channel);
          const rateDiff = prev ? ch.feeRate - prev.feeRate : null;

          return (
            <motion.div key={ch.channel} initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`px-2 py-2.5 rounded-xl min-w-[340px] ${
                isBest ? "bg-success/10 border border-success/20" : "bg-[var(--bg-tertiary)]"
              }`}
            >
              <div className="grid grid-cols-5 gap-1 items-center">
                <div className="flex items-center gap-1 min-w-0">
                  {isBest && <Trophy size={11} className="text-success flex-shrink-0" />}
                  <span className={`text-caption font-medium truncate ${isBest ? "text-success" : "text-[var(--text-primary)]"}`}>
                    {ch.channel}
                  </span>
                </div>
                <span className="text-caption font-display text-[var(--text-primary)] text-right">
                  {formatCurrency(ch.totalSales, { showSymbol: false })}
                </span>
                <span className="text-caption font-display text-danger text-right">
                  -{formatCurrency(ch.totalFees, { showSymbol: false })}
                </span>
                <span className="text-caption font-display text-[var(--text-primary)] text-right">
                  {formatCurrency(ch.netSales, { showSymbol: false })}
                </span>
                <span className={`text-caption font-display text-right ${
                  ch.feeRate <= 5 ? "text-success" : ch.feeRate <= 10 ? "text-warning" : "text-danger"
                }`}>
                  {formatPercent(ch.feeRate)}
                </span>
              </div>
              {/* 전월 대비 변화 */}
              {rateDiff !== null && rateDiff !== 0 && (
                <div className="flex justify-end mt-1">
                  <div className={`flex items-center gap-0.5 text-[10px] ${rateDiff < 0 ? "text-success" : "text-danger"}`}>
                    {rateDiff < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                    전월 대비 {formatPercent(Math.abs(rateDiff), { showSign: false })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
