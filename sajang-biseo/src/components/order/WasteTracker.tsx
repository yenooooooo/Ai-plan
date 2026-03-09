"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils/format";

interface WasteItem {
  name: string;
  wasteQty: number;
  unit: string;
  cost: number;
}

interface WasteTrackerProps {
  totalWasteCost: number;
  topWasteItems: WasteItem[];
  monthLabel: string;
}

export function WasteTracker({
  totalWasteCost,
  topWasteItems,
  monthLabel,
}: WasteTrackerProps) {
  const maxCost = Math.max(...topWasteItems.map((w) => w.cost), 1);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-md text-[var(--text-primary)]">
          폐기 현황
        </h3>
        <span className="text-caption text-[var(--text-tertiary)]">
          {monthLabel}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-caption text-[var(--text-tertiary)] mb-0.5">
          총 폐기 금액
        </p>
        <p className="text-heading-md font-display text-danger">
          {formatCurrency(totalWasteCost)}
        </p>
      </div>

      {topWasteItems.length > 0 && (
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-2">
            폐기 TOP {topWasteItems.length}
          </p>
          <div className="space-y-2">
            {topWasteItems.map((item, i) => {
              const ratio = maxCost > 0 ? (item.cost / maxCost) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-small text-[var(--text-primary)]">
                      {i + 1}. {item.name}
                    </span>
                    <span className="text-caption font-display text-danger">
                      {item.wasteQty}{item.unit} · {formatCurrency(item.cost)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full rounded-full bg-danger/60"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topWasteItems.length === 0 && (
        <p className="text-caption text-[var(--text-tertiary)] text-center py-4">
          폐기 데이터가 없습니다
        </p>
      )}
    </div>
  );
}
