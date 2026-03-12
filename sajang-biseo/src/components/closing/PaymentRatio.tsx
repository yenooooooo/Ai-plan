"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Banknote, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentRatioProps {
  cardRatio: number;
  totalSales: number;
  onChange: (cardRatio: number) => void;
  readOnly?: boolean;
}

const QUICK_OPTIONS = [
  { label: "거의 카드", ratio: 95 },
  { label: "대부분 카드", ratio: 85 },
  { label: "반반", ratio: 50 },
];

export function PaymentRatio({ cardRatio, totalSales, onChange, readOnly = false }: PaymentRatioProps) {
  const [showDetail, setShowDetail] = useState(false);
  const cashRatio = 100 - cardRatio;
  const cardAmount = Math.round((totalSales * cardRatio) / 100);
  const cashAmount = totalSales - cardAmount;

  // 금액 직접 입력 시 비율 역산
  function handleCardAmountChange(value: string) {
    const amt = parseInt(value, 10) || 0;
    if (totalSales === 0) return;
    const ratio = Math.min(100, Math.max(0, Math.round((amt / totalSales) * 100)));
    onChange(ratio);
  }

  function handleCashAmountChange(value: string) {
    const amt = parseInt(value, 10) || 0;
    if (totalSales === 0) return;
    const cashR = Math.min(100, Math.max(0, Math.round((amt / totalSales) * 100)));
    onChange(100 - cashR);
  }

  const isCustom = !QUICK_OPTIONS.some((o) => o.ratio === cardRatio);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-body-small text-[var(--text-secondary)]">결제수단</label>
        <span className="text-caption text-[var(--text-tertiary)]">
          카드 {cardRatio}% / 현금 {cashRatio}%
        </span>
      </div>

      {/* 간편 버튼 */}
      <div className="flex gap-2">
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.ratio}
            onClick={() => onChange(opt.ratio)}
            disabled={readOnly}
            className={`flex-1 py-2 rounded-xl text-caption font-medium transition-all press-effect ${
              cardRatio === opt.ratio
                ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setShowDetail((v) => !v)}
          disabled={readOnly}
          className={`flex-1 py-2 rounded-xl text-caption font-medium transition-all press-effect flex items-center justify-center gap-1 ${
            isCustom || showDetail
              ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
              : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
          } disabled:opacity-50`}
        >
          직접 입력
          <motion.div animate={{ rotate: showDetail ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} />
          </motion.div>
        </button>
      </div>

      {/* 비율 바 */}
      <div className="flex h-2 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${cardRatio}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-primary-500 rounded-l-full"
        />
        <motion.div
          animate={{ width: `${cashRatio}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-success rounded-r-full"
        />
      </div>

      {/* 직접 입력 (펼침) */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              {/* 카드 금액 */}
              <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] rounded-xl p-3">
                <CreditCard size={16} className="text-primary-500 shrink-0" />
                <span className="text-body-small text-[var(--text-secondary)] w-8">카드</span>
                <input
                  type="number"
                  value={cardAmount || ""}
                  onChange={(e) => handleCardAmountChange(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-right text-body-small font-display text-[var(--text-primary)] outline-none"
                />
                <span className="text-caption text-[var(--text-tertiary)]">원</span>
              </div>

              {/* 현금 금액 */}
              <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] rounded-xl p-3">
                <Banknote size={16} className="text-success shrink-0" />
                <span className="text-body-small text-[var(--text-secondary)] w-8">현금</span>
                <input
                  type="number"
                  value={cashAmount || ""}
                  onChange={(e) => handleCashAmountChange(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-right text-body-small font-display text-[var(--text-primary)] outline-none"
                />
                <span className="text-caption text-[var(--text-tertiary)]">원</span>
              </div>

              {/* 합계 검증 */}
              {totalSales > 0 && (
                <p className="text-[10px] text-[var(--text-tertiary)] text-center">
                  합계: {formatCurrency(cardAmount + cashAmount)} / 총매출: {formatCurrency(totalSales)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
