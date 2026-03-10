"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ChannelProfitability } from "@/lib/fees/aggregateFeesData";

const DELIVERY_CHANNELS = ["배민", "쿠팡이츠", "요기요", "땡겨요"];

interface FeeSimulatorProps {
  profitability: ChannelProfitability[];
}

export function FeeSimulator({ profitability }: FeeSimulatorProps) {
  const totalSales = profitability.reduce((s, d) => s + d.totalSales, 0);
  const totalFees = profitability.reduce((s, d) => s + d.totalFees, 0);

  const currentDeliverySales = profitability
    .filter((p) => DELIVERY_CHANNELS.includes(p.channel))
    .reduce((s, d) => s + d.totalSales, 0);
  const currentDeliveryRatio = totalSales > 0 ? Math.round((currentDeliverySales / totalSales) * 100) : 0;

  const [targetRatio, setTargetRatio] = useState(Math.max(currentDeliveryRatio - 10, 0));

  const simulation = useMemo(() => {
    if (totalSales === 0) return null;

    // 현재 배달 평균 수수료율
    const deliveryData = profitability.filter((p) => DELIVERY_CHANNELS.includes(p.channel));
    const hallData = profitability.filter((p) => !DELIVERY_CHANNELS.includes(p.channel));

    const deliveryAvgFeeRate = deliveryData.length > 0
      ? deliveryData.reduce((s, d) => s + d.totalFees, 0) / deliveryData.reduce((s, d) => s + d.totalSales, 0) * 100
      : 8;
    const hallAvgFeeRate = hallData.length > 0
      ? hallData.reduce((s, d) => s + d.totalFees, 0) / hallData.reduce((s, d) => s + d.totalSales, 0) * 100
      : 1;

    const newDeliverySales = totalSales * targetRatio / 100;
    const newHallSales = totalSales - newDeliverySales;
    const newFees = Math.round(
      (newDeliverySales * deliveryAvgFeeRate / 100) +
      (newHallSales * hallAvgFeeRate / 100)
    );
    const saving = totalFees - newFees;

    return {
      newFees,
      newFeeRate: totalSales > 0 ? Math.round((newFees / totalSales) * 1000) / 10 : 0,
      saving,
      currentFeeRate: totalSales > 0 ? Math.round((totalFees / totalSales) * 1000) / 10 : 0,
    };
  }, [totalSales, totalFees, targetRatio, profitability]);

  if (profitability.length === 0 || totalSales === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-body-small text-[var(--text-tertiary)]">
          마감 데이터가 쌓이면 수수료 시뮬레이션을 제공합니다
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <Calculator size={16} className="text-primary-500" />
        </div>
        <h4 className="text-heading-md text-[var(--text-primary)]">수수료 절감 시뮬레이터</h4>
      </div>

      {/* 배달 비중 슬라이더 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-caption text-[var(--text-secondary)]">배달 비중 조절</span>
          <span className="text-body-small font-display text-primary-500">{targetRatio}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={targetRatio}
          onChange={(e) => setTargetRatio(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
          <span>홀/포장 100%</span>
          <span>현재 {currentDeliveryRatio}%</span>
          <span>배달 100%</span>
        </div>
      </div>

      {/* 비교 결과 */}
      {simulation && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">현재 수수료</p>
            <p className="text-body-small font-display text-[var(--text-primary)]">
              {formatPercent(simulation.currentFeeRate)}
            </p>
            <p className="text-[11px] text-danger">{formatCurrency(totalFees)}</p>
          </div>
          <ArrowRight size={16} className="text-[var(--text-tertiary)] shrink-0" />
          <div className="flex-1 bg-success/10 rounded-xl p-3 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">변경 후 예상</p>
            <p className="text-body-small font-display text-success">
              {formatPercent(simulation.newFeeRate)}
            </p>
            <p className="text-[11px] text-success">{formatCurrency(simulation.newFees)}</p>
          </div>
        </div>
      )}

      {/* 절감액 */}
      {simulation && simulation.saving > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success/10 border border-success/20 rounded-xl p-3 text-center"
        >
          <p className="text-caption text-success font-semibold">
            월 {formatCurrency(simulation.saving)} 절감 가능!
          </p>
        </motion.div>
      )}
    </div>
  );
}
