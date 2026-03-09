"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency } from "@/lib/utils/format";

const CHANNELS = [
  { name: "홀", ratio: 60, feeRate: 0 },
  { name: "배민", ratio: 25, feeRate: 6.8 },
  { name: "쿠팡이츠", ratio: 10, feeRate: 9.8 },
  { name: "포장", ratio: 5, feeRate: 0 },
];

const PRESETS = [
  { label: "150만", value: 1500000 },
  { label: "200만", value: 2000000 },
  { label: "300만", value: 3000000 },
  { label: "500만", value: 5000000 },
];

export function FeeCalculatorDemo() {
  const [sales, setSales] = useState(2000000);

  const result = useMemo(() => {
    const cardRate = 1.3;
    const deliveryFeePerOrder = 3300;
    let totalFees = 0;
    const breakdown = CHANNELS.map((ch) => {
      const amount = Math.round((sales * ch.ratio) / 100);
      const platformFee = ch.feeRate > 0 ? Math.round((amount * ch.feeRate) / 100) : 0;
      const deliveryFee = ch.feeRate > 0 ? Math.round(amount / 15000) * deliveryFeePerOrder : 0;
      const cardFee = ch.feeRate === 0 ? Math.round((amount * 0.92 * cardRate) / 100) : 0;
      const fee = platformFee + deliveryFee + cardFee;
      totalFees += fee;
      return { ...ch, amount, fee };
    });
    return { totalFees, netSales: sales - totalFees, feeRate: Math.round((totalFees / sales) * 1000) / 10, breakdown };
  }, [sales]);

  const totalFeesAnimated = useCountUp(result.totalFees);
  const netSalesAnimated = useCountUp(result.netSales);
  const feeRateAnimated = useCountUp(result.feeRate, { decimals: 1 });

  return (
    <div className="glass-card p-6 max-w-md mx-auto">
      <h3 className="text-heading-md text-[var(--text-primary)] mb-4 text-center">
        우리 가게 수수료는 얼마?
      </h3>

      {/* 프리셋 */}
      <div className="flex gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setSales(p.value)}
            className={`flex-1 py-2 rounded-xl text-caption font-medium transition-colors ${
              sales === p.value
                ? "bg-primary-500/15 text-primary-500 border border-primary-500/30"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 슬라이더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-caption text-[var(--text-tertiary)]">일 매출</span>
          <span className="text-heading-md font-display text-primary-500">
            {formatCurrency(sales)}
          </span>
        </div>
        <input
          type="range"
          min={500000}
          max={10000000}
          step={100000}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--bg-tertiary)]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* 결과 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-body-small text-[var(--text-secondary)]">총 수수료</span>
          <span className="text-heading-md font-display text-danger">
            -{formatCurrency(totalFeesAnimated)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-small text-[var(--text-secondary)]">수수료율</span>
          <span className="text-body-small font-display text-[var(--text-tertiary)]">
            {feeRateAnimated.toFixed(1)}%
          </span>
        </div>
        <div className="h-px bg-[var(--border-subtle)]" />
        <div className="flex justify-between items-center">
          <span className="text-body-small font-semibold text-[var(--text-primary)]">실 수령액</span>
          <span className="text-heading-md font-display text-success">
            {formatCurrency(netSalesAnimated)}
          </span>
        </div>

        {/* 채널별 */}
        <div className="mt-3 space-y-1.5">
          {result.breakdown.map((ch) => (
            <div key={ch.name} className="flex items-center text-caption">
              <span className="text-[var(--text-tertiary)] w-16">{ch.name}</span>
              <div className="flex-1 h-1 bg-[var(--bg-tertiary)] rounded-full mx-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ch.ratio}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary-500/40 rounded-full"
                />
              </div>
              <span className="text-[var(--text-tertiary)] w-16 text-right">
                -{formatCurrency(ch.fee, { showSymbol: false })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
