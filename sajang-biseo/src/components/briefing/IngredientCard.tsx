"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Lightbulb } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { IngredientEfficiencyData } from "@/lib/briefing/types";

interface IngredientCardProps {
  data: IngredientEfficiencyData;
}

export function IngredientCard({ data }: IngredientCardProps) {
  const wasteAnimated = useCountUp(data.wasteAmount);
  const wasteRateAnimated = useCountUp(data.wasteRate, { decimals: 1 });

  const wasteImproved = data.wasteRate <= data.prevWasteRate;

  return (
    <div className="space-y-4">
      {/* 메인 수치 */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">주간 폐기 금액</p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {formatCurrency(wasteAnimated)}
          </p>
        </div>
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">폐기율</p>
          <div className="flex items-center gap-1">
            <p className="text-heading-md font-display text-[var(--text-primary)]">
              {wasteRateAnimated.toFixed(1)}%
            </p>
            {data.prevWasteRate > 0 && (
              wasteImproved
                ? <TrendingDown size={14} className="text-success" />
                : <TrendingUp size={14} className="text-danger" />
            )}
          </div>
          {data.prevWasteRate > 0 && (
            <p className="text-[11px] text-[var(--text-tertiary)]">
              전주 {formatPercent(data.prevWasteRate)}
            </p>
          )}
        </div>
      </div>

      {/* 발주 적중률 */}
      {data.accuracyRate > 0 && (
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-caption text-[var(--text-tertiary)]">발주 적중률</p>
            <p className="text-body-small font-display text-primary-500">
              {formatPercent(data.accuracyRate, { decimals: 0 })}
            </p>
          </div>
          <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.accuracyRate}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-primary-500"
            />
          </div>
        </div>
      )}

      {/* 폐기 TOP 3 */}
      {data.wasteTop3.length > 0 && (
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-2">폐기 TOP 3</p>
          <div className="space-y-2">
            {data.wasteTop3.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-body-small font-display text-[var(--text-tertiary)] w-5">
                  {i + 1}.
                </span>
                <span className="text-body-small text-[var(--text-primary)] flex-1">{item.name}</span>
                <span className="text-body-small font-display text-[var(--text-primary)]">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] w-10 text-right">
                  {Math.round(item.ratio)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 팁 */}
      {data.tip && (
        <div className="flex items-start gap-2 bg-primary-500/5 rounded-xl p-3">
          <Lightbulb size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
          <p className="text-caption text-[var(--text-secondary)] leading-relaxed">{data.tip}</p>
        </div>
      )}
    </div>
  );
}
