"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import type { RecommendationResult } from "@/lib/order/recommend";

interface RecommendationCardProps {
  rec: RecommendationResult;
  onConfirm: (itemId: string, qty: number) => void;
  confirmed?: boolean;
  readOnly?: boolean;
}

const URGENCY_CONFIG = {
  high: {
    dot: "bg-danger",
    badge: "bg-danger/10 text-danger",
    label: "부족 예상",
    border: "border-danger/20",
  },
  medium: {
    dot: "bg-warning",
    badge: "bg-warning/10 text-warning",
    label: "주의",
    border: "border-warning/20",
  },
  low: {
    dot: "bg-success",
    badge: "bg-success/10 text-success",
    label: "충분",
    border: "border-success/20",
  },
};

export function RecommendationCard({
  rec,
  onConfirm,
  confirmed = false,
  readOnly = false,
}: RecommendationCardProps) {
  const [qty, setQty] = useState(rec.recommendedQty);
  const config = URGENCY_CONFIG[rec.urgency];
  const shortage = Math.max(0, rec.expectedUsage - rec.currentStock);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 border ${config.border} ${
        confirmed ? "bg-success/5" : ""
      }`}
    >
      {/* 상단: 품목명 + 긴급도 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-body-small font-semibold text-[var(--text-primary)]">
          {rec.itemName}
        </span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
          {config.label}
        </span>
      </div>

      {/* 재고 → 예상 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-caption text-[var(--text-tertiary)]">
          재고 {rec.currentStock}{rec.unit}
        </span>
        <span className="text-caption text-[var(--text-tertiary)]">→</span>
        <span className="text-caption text-[var(--text-tertiary)]">
          내일 예상 {rec.expectedUsage}{rec.unit} 필요
        </span>
      </div>

      {/* 부족량 */}
      {shortage > 0 && (
        <p className="text-caption font-medium mb-2" style={{ color: rec.urgency === "high" ? "var(--danger)" : "var(--warning)" }}>
          {shortage.toFixed(1)}{rec.unit} 부족
        </p>
      )}

      {/* 추천 사유 */}
      <p className="text-caption text-[var(--text-tertiary)] mb-3">
        {rec.reason}
      </p>

      {/* 수량 조절 + 확정 */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-caption text-[var(--text-secondary)]">발주:</span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setQty(Math.max(0, +(qty - 0.5).toFixed(1)))}
              disabled={confirmed}
              className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-30"
            >
              <Minus size={14} />
            </motion.button>
            <span className="w-16 text-center text-body-small font-display font-semibold text-[var(--text-primary)]">
              {qty}{rec.unit}
            </span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setQty(+(qty + 0.5).toFixed(1))}
              disabled={confirmed}
              className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 disabled:opacity-30"
            >
              <Plus size={14} />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onConfirm(rec.itemId, qty)}
            disabled={!confirmed && qty === 0}
            className={`px-4 py-2 rounded-xl text-body-small font-medium press-effect ${
              confirmed
                ? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-danger"
                : "bg-primary-500 text-white"
            } disabled:opacity-40`}
          >
            {confirmed ? (
              <span className="flex items-center gap-1">
                <X size={14} /> 취소
              </span>
            ) : (
              "확정"
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
