"use client";

import { motion } from "framer-motion";
import { TrendingUp, Trophy } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ChannelProfitability } from "@/hooks/useFeesData";

interface ProfitabilityTableProps {
  data: ChannelProfitability[];
}

export function ProfitabilityTable({ data }: ProfitabilityTableProps) {
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

  // 수수료율 낮은 순(수익성 높은 순) 정렬
  const sorted = [...data].sort((a, b) => a.feeRate - b.feeRate);
  const bestChannel = sorted[0];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-heading-md text-[var(--text-primary)]">채널별 수익성 비교</h4>
        <div className="flex items-center gap-1 text-caption text-[var(--text-tertiary)]">
          <TrendingUp size={12} />
          수익성 높은 순
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-5 gap-1 text-[11px] text-[var(--text-tertiary)] font-medium px-1">
        <span>채널</span>
        <span className="text-right">매출</span>
        <span className="text-right">수수료</span>
        <span className="text-right">순매출</span>
        <span className="text-right">수수료율</span>
      </div>

      {/* 테이블 바디 */}
      <div className="space-y-1.5">
        {sorted.map((ch, i) => {
          const isBest = ch.channel === bestChannel.channel;
          return (
            <motion.div
              key={ch.channel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-5 gap-1 items-center px-2 py-2.5 rounded-xl ${
                isBest
                  ? "bg-success/10 border border-success/20"
                  : "bg-[var(--bg-tertiary)]"
              }`}
            >
              <div className="flex items-center gap-1">
                {isBest && <Trophy size={11} className="text-success flex-shrink-0" />}
                <span className={`text-caption font-medium ${
                  isBest ? "text-success" : "text-[var(--text-primary)]"
                }`}>
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
