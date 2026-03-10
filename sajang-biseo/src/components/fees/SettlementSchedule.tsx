"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { ChannelProfitability } from "@/lib/fees/aggregateFeesData";

const SETTLEMENT_CYCLES: Record<string, { cycle: string; note: string; dayOfWeek?: number }> = {
  "배민": { cycle: "주 1회 (화요일)", note: "전주 월~일 매출 정산", dayOfWeek: 2 },
  "쿠팡이츠": { cycle: "주 1회 (수요일)", note: "전주 월~일 매출 정산", dayOfWeek: 3 },
  "요기요": { cycle: "주 1회 (목요일)", note: "전주 월~일 매출 정산", dayOfWeek: 4 },
  "땡겨요": { cycle: "월 2회", note: "1~15일분 → 25일, 16~말일분 → 익월 10일" },
};

function getDaysUntilNext(dayOfWeek: number): number {
  const today = new Date().getDay();
  const diff = (dayOfWeek - today + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function getNextSettlementLabel(channel: string): string | null {
  const info = SETTLEMENT_CYCLES[channel];
  if (!info) return null;
  if (info.dayOfWeek !== undefined) {
    const days = getDaysUntilNext(info.dayOfWeek);
    if (days === 1) return "내일 정산";
    if (days === 2) return "모레 정산";
    return `${days}일 후 정산`;
  }
  // 땡겨요: 25일 or 10일
  const today = new Date();
  const day = today.getDate();
  if (day <= 25) return `${25 - day}일 후 정산 (25일)`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return `${daysInMonth - day + 10}일 후 정산 (익월 10일)`;
}

interface SettlementScheduleProps {
  profitability: ChannelProfitability[];
}

export function SettlementSchedule({ profitability }: SettlementScheduleProps) {
  const deliveryChannels = useMemo(
    () => profitability.filter((p) => Object.keys(SETTLEMENT_CYCLES).includes(p.channel)),
    [profitability]
  );

  if (deliveryChannels.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-primary-500" />
          <h4 className="text-heading-md text-[var(--text-primary)]">정산일 관리</h4>
        </div>
        <p className="text-body-small text-[var(--text-tertiary)] text-center py-4">
          배달앱 매출 데이터가 있으면 정산 예정일을 표시합니다
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-primary-500" />
        <h4 className="text-heading-md text-[var(--text-primary)]">정산일 관리</h4>
      </div>

      <div className="space-y-2">
        {deliveryChannels.map((ch, i) => {
          const schedule = SETTLEMENT_CYCLES[ch.channel];
          const dDay = getNextSettlementLabel(ch.channel);
          const expectedAmount = ch.netSales;

          return (
            <motion.div key={ch.channel} initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[var(--bg-tertiary)] rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-small font-medium text-[var(--text-primary)]">{ch.channel}</p>
                  {schedule && (
                    <>
                      <p className="text-caption text-primary-500 mt-0.5">{schedule.cycle}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{schedule.note}</p>
                    </>
                  )}
                  {dDay && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} className="text-warning" />
                      <span className="text-[11px] font-medium text-warning">{dDay}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-caption text-[var(--text-tertiary)]">예상 정산액</p>
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-success" />
                    <p className="text-body-small font-display text-success">
                      {formatCurrency(expectedAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--text-tertiary)] text-center">
        * 정산 주기는 2025년 기준이며, 실제 정산일과 금액은 각 플랫폼 정책에 따라 다를 수 있습니다
      </p>
    </div>
  );
}
