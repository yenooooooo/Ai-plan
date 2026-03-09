"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { useFeeToggle } from "@/stores/useFeeToggle";

interface CostRatioCardProps {
  totalCost: number;
  grossSales: number;
  netSales: number;
  monthLabel: string;
}

export function CostRatioCard({
  totalCost,
  grossSales,
  netSales,
  monthLabel,
}: CostRatioCardProps) {
  const { mode } = useFeeToggle();
  const baseSales = mode === "gross" ? grossSales : netSales;
  const ratio = baseSales > 0 ? (totalCost / baseSales) * 100 : 0;
  const animatedRatio = useCountUp(ratio, { duration: 600, decimals: 1 });

  // 원가율 색상
  const ratioColor =
    ratio > 40 ? "text-danger" : ratio > 35 ? "text-warning" : "text-success";

  return (
    <div className="glass-card p-5">
      <h3 className="text-heading-md text-[var(--text-primary)] mb-1">
        식자재 원가율
      </h3>
      <p className="text-caption text-[var(--text-tertiary)] mb-4">{monthLabel}</p>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">
            식자재비
          </p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption text-[var(--text-tertiary)] mb-0.5">
            원가율
          </p>
          <p className={`text-amount-card font-display ${ratioColor}`}>
            {animatedRatio.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${
            ratio > 40 ? "bg-danger" : ratio > 35 ? "bg-warning" : "bg-success"
          }`}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-caption text-[var(--text-tertiary)]">
          {mode === "gross" ? "총매출" : "순매출"}: {formatCurrency(baseSales)}
        </span>
        <span className="text-caption text-[var(--text-tertiary)]">
          권장: 30~35%
        </span>
      </div>
    </div>
  );
}
