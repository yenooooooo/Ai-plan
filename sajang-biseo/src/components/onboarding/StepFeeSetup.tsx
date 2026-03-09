"use client";

import { Truck, CreditCard, Check } from "lucide-react";
import { motion } from "framer-motion";
import { CARD_FEE_TIERS } from "@/lib/fees/presets";

const DELIVERY_CHANNELS = [
  { key: "배민_중개", label: "배민 중개", rate: 6.8 },
  { key: "배민_배달", label: "배민 배달", rate: 12.5 },
  { key: "쿠팡이츠", label: "쿠팡이츠", rate: 9.8 },
  { key: "요기요", label: "요기요", rate: 12.5 },
  { key: "땡겨요", label: "땡겨요", rate: 2.0 },
] as const;

interface StepFeeSetupProps {
  direction: number;
  selectedChannels: string[];
  cardTierIndex: number;
  loading: boolean;
  onToggleChannel: (key: string) => void;
  onCardTierChange: (idx: number) => void;
  onComplete: () => void;
  slideVariants: import("framer-motion").Variants;
}

export { DELIVERY_CHANNELS };

export function StepFeeSetup({
  direction, selectedChannels, cardTierIndex, loading,
  onToggleChannel, onCardTierChange, onComplete, slideVariants,
}: StepFeeSetupProps) {
  return (
    <motion.div
      key="step2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col"
    >
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
          <Truck size={24} className="text-primary-500" />
        </div>
        <h2 className="text-heading-lg text-[var(--text-primary)] mb-2">수수료를 설정해주세요</h2>
        <p className="text-body-small text-[var(--text-secondary)]">나중에 설정에서 언제든 변경할 수 있어요</p>
      </div>

      {/* 배달앱 선택 */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-body-small text-[var(--text-secondary)] mb-3">
          <Truck size={16} />사용 중인 배달앱
        </label>
        <div className="space-y-2">
          {DELIVERY_CHANNELS.map(({ key, label, rate }) => (
            <button
              key={key}
              onClick={() => onToggleChannel(key)}
              className={`w-full h-[52px] px-4 rounded-xl flex items-center justify-between border transition-all duration-200 press-effect ${
                selectedChannels.includes(key)
                  ? "bg-primary-500/10 border-primary-500"
                  : "bg-[var(--bg-tertiary)] border-[var(--border-default)] hover:border-[var(--text-tertiary)]"
              }`}
            >
              <span className={`text-body-default font-medium ${selectedChannels.includes(key) ? "text-primary-500" : "text-[var(--text-secondary)]"}`}>
                {label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-body-small text-[var(--text-tertiary)] font-display">{rate}%</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${
                  selectedChannels.includes(key)
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                }`}>
                  {selectedChannels.includes(key) && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 카드 수수료 구간 */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-body-small text-[var(--text-secondary)] mb-3">
          <CreditCard size={16} />카드 수수료 구간 (연매출 기준)
        </label>
        <div className="space-y-2">
          {CARD_FEE_TIERS.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => onCardTierChange(idx)}
              className={`w-full h-[48px] px-4 rounded-xl flex items-center justify-between border transition-all duration-200 press-effect ${
                cardTierIndex === idx
                  ? "bg-primary-500/10 border-primary-500"
                  : "bg-[var(--bg-tertiary)] border-[var(--border-default)] hover:border-[var(--text-tertiary)]"
              }`}
            >
              <span className={`text-body-small font-medium ${cardTierIndex === idx ? "text-primary-500" : "text-[var(--text-secondary)]"}`}>
                {tier.label}
              </span>
              <span className={`text-body-small font-display ${cardTierIndex === idx ? "text-primary-500" : "text-[var(--text-tertiary)]"}`}>
                {tier.rate}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="mt-auto pt-4">
        <button
          onClick={onComplete}
          disabled={loading}
          className="w-full h-14 rounded-[14px] bg-primary-500 text-white font-body font-semibold text-[1rem] press-effect transition-all duration-200 ease-smooth hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>시작하기 <Check size={18} /></>
          )}
        </button>
        <p className="text-center text-caption text-[var(--text-tertiary)] mt-3">
          수수료 설정은 나중에 변경할 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
