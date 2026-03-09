"use client";

import { motion } from "framer-motion";
import { Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { ChannelProfitability } from "@/hooks/useFeesData";

// 배달앱별 일반적인 정산 주기
const SETTLEMENT_CYCLES: Record<string, { cycle: string; note: string }> = {
  "배민": { cycle: "주 1회 (화요일)", note: "전주 월~일 매출 정산" },
  "쿠팡이츠": { cycle: "주 1회 (수요일)", note: "전주 월~일 매출 정산" },
  "요기요": { cycle: "주 1회 (목요일)", note: "전주 월~일 매출 정산" },
  "땡겨요": { cycle: "월 2회", note: "1~15일분 → 25일, 16~말일분 → 익월 10일" },
};

interface SettlementScheduleProps {
  profitability: ChannelProfitability[];
}

export function SettlementSchedule({ profitability }: SettlementScheduleProps) {
  const deliveryChannels = profitability.filter((p) =>
    ["배민", "쿠팡이츠", "요기요", "땡겨요"].includes(p.channel)
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
          // 예상 정산액 = 순매출 (수수료 차감 후)
          const expectedAmount = ch.netSales;

          return (
            <motion.div
              key={ch.channel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--bg-tertiary)] rounded-xl p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-small font-medium text-[var(--text-primary)]">
                    {ch.channel}
                  </p>
                  {schedule && (
                    <>
                      <p className="text-caption text-primary-500 mt-0.5">
                        {schedule.cycle}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        {schedule.note}
                      </p>
                    </>
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
        * 실제 정산일과 금액은 각 플랫폼 정책에 따라 다를 수 있습니다
      </p>
    </div>
  );
}
