"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { FeeItem } from "./FeeItem";
import type { FeeCalculationResult } from "@/lib/fees/calculator";

export interface CustomFee {
  name: string;
  amount: number;
}

interface FeeBreakdownProps {
  result: FeeCalculationResult;
  onPlatformRateChange: (channel: string, rate: number) => void;
  onDeliveryFeeChange: (amount: number) => void;
  onCardRateChange: (rate: number) => void;
  customFees: CustomFee[];
  onCustomFeeAdd: (fee: CustomFee) => void;
  onCustomFeeRemove: (idx: number) => void;
  readOnly?: boolean;
}

export function FeeBreakdownView({
  result, onPlatformRateChange, onDeliveryFeeChange, onCardRateChange,
  customFees, onCustomFeeAdd, onCustomFeeRemove, readOnly = false,
}: FeeBreakdownProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeeName, setNewFeeName] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");

  const totalCustomFees = customFees.reduce((s, f) => s + f.amount, 0);
  const totalFees = result.totalFees + totalCustomFees;
  const netSales = result.netSales - totalCustomFees;
  const feeRatePercent = result.grossSales > 0
    ? Math.round((totalFees / result.grossSales) * 1000) / 10
    : 0;

  const animatedFees = useCountUp(totalFees);
  const animatedNet = useCountUp(netSales);

  const handleAddFee = () => {
    const amount = parseInt(newFeeAmount, 10);
    if (!newFeeName.trim() || isNaN(amount) || amount <= 0) return;
    onCustomFeeAdd({ name: newFeeName.trim(), amount });
    setNewFeeName("");
    setNewFeeAmount("");
    setShowAddForm(false);
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-body-small font-medium text-[var(--text-secondary)]">수수료 내역</h3>
        {!readOnly && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-1 text-caption transition-colors ${showAddForm ? "text-primary-500" : "text-[var(--text-tertiary)] hover:text-primary-500"}`}
          >
            <Plus size={13} />항목 추가
          </button>
        )}
      </div>

      {/* 자동 계산 항목 */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {result.breakdown.map((item) => (
          <FeeItem
            key={item.channel}
            item={item}
            onPlatformRateChange={onPlatformRateChange}
            onDeliveryFeeChange={onDeliveryFeeChange}
            onCardRateChange={onCardRateChange}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* 수기 추가 항목 */}
      {customFees.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
          {customFees.map((fee, idx) => (
            <div key={idx} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                {!readOnly && (
                <button onClick={() => onCustomFeeRemove(idx)} className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                  <X size={13} />
                </button>
              )}
                <span className="text-body-small text-[var(--text-primary)]">{fee.name}</span>
              </div>
              <span className="text-body-small font-display text-[var(--fee-deducted)] tabular-nums">
                -{formatCurrency(fee.amount, { showSymbol: false })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 항목 추가 폼 */}
      {showAddForm && !readOnly && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
          <input
            type="text"
            value={newFeeName}
            onChange={(e) => setNewFeeName(e.target.value)}
            placeholder="항목명 (예: 광고비)"
            className="flex-1 h-8 px-2 rounded-lg
              bg-[var(--bg-tertiary)] border border-[var(--border-default)]
              text-body-small text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
              focus:outline-none focus:border-primary-500 transition-colors"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-caption text-[var(--text-tertiary)]">₩</span>
            <input
              type="text"
              inputMode="numeric"
              value={newFeeAmount}
              onChange={(e) => setNewFeeAmount(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleAddFee()}
              placeholder="0"
              className="w-20 h-8 px-2 rounded-lg text-right
                bg-[var(--bg-tertiary)] border border-[var(--border-default)]
                text-body-small font-display text-[var(--text-primary)]
                focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <button onClick={handleAddFee} className="h-8 px-3 rounded-lg bg-primary-500 text-white text-caption font-medium shrink-0">
            추가
          </button>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-body-small text-[var(--text-secondary)]">총 수수료</span>
          <span className="font-display text-amount-inline text-[var(--fee-deducted)]">
            -{formatCurrency(animatedFees, { showSymbol: false })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-small text-[var(--text-secondary)]">실 수령액</span>
          <span className="font-display text-amount-inline text-[var(--net-income)]">
            {formatCurrency(animatedNet)}
          </span>
        </div>
        <div className="flex justify-end">
          <span className="text-caption text-[var(--text-tertiary)] font-display">
            수수료율 {formatPercent(feeRatePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}
