"use client";

import { Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BUSINESS_TYPES } from "@/lib/constants";

interface StepStoreInfoProps {
  direction: number;
  storeName: string;
  businessType: string;
  onStoreNameChange: (v: string) => void;
  onBusinessTypeChange: (v: string) => void;
  onNext: () => void;
  slideVariants: import("framer-motion").Variants;
}

export function StepStoreInfo({
  direction, storeName, businessType,
  onStoreNameChange, onBusinessTypeChange, onNext, slideVariants,
}: StepStoreInfoProps) {
  return (
    <motion.div
      key="step1"
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
          <Store size={24} className="text-primary-500" />
        </div>
        <h2 className="text-heading-lg text-[var(--text-primary)] mb-2">매장 정보를 알려주세요</h2>
        <p className="text-body-small text-[var(--text-secondary)]">사장님의 매장에 맞는 맞춤 서비스를 준비할게요</p>
      </div>

      <div className="mb-6">
        <label className="block text-body-small text-[var(--text-secondary)] mb-2">매장명</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => onStoreNameChange(e.target.value)}
          placeholder="예: 맛있는 한식당"
          className="w-full h-[52px] px-4 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors duration-200 text-body-default"
        />
      </div>

      <div className="flex-1">
        <label className="block text-body-small text-[var(--text-secondary)] mb-3">업종</label>
        <div className="grid grid-cols-2 gap-2.5">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onBusinessTypeChange(type)}
              className={`h-12 rounded-xl text-body-default font-medium border transition-all duration-200 press-effect ${
                businessType === type
                  ? "bg-primary-500/10 border-primary-500 text-primary-500"
                  : "bg-[var(--bg-tertiary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!storeName.trim() || !businessType}
        className="w-full h-14 rounded-[14px] mt-6 bg-primary-500 text-white font-body font-semibold text-[1rem] press-effect transition-all duration-200 ease-smooth hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        다음 <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}
