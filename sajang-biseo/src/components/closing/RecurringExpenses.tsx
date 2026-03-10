"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export interface RecurringExpense {
  name: string;
  amount: number;
}

interface RecurringExpensesProps {
  recurring: RecurringExpense[];
  onRecurringChange: (expenses: RecurringExpense[]) => void;
  onApplyToday: (expenses: RecurringExpense[]) => void;
  /** 이번 달 며칠째인지 (1일이면 자동 적용 알림) */
  dayOfMonth: number;
}

const RECURRING_PRESETS = ["임대료", "보험료", "대출이자", "관리비", "통신비", "리스료"] as const;

export function RecurringExpenses({ recurring, onRecurringChange, onApplyToday, dayOfMonth }: RecurringExpensesProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const handleAdd = () => {
    const amount = parseInt(newAmount, 10);
    if (!newName.trim() || isNaN(amount) || amount <= 0) return;
    onRecurringChange([...recurring, { name: newName.trim(), amount }]);
    setNewName("");
    setNewAmount("");
    setAdding(false);
  };

  const handleRemove = (idx: number) => {
    onRecurringChange(recurring.filter((_, i) => i !== idx));
  };

  const totalMonthly = recurring.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RotateCcw size={15} className="text-primary-500" />
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">고정 경비</h3>
          {totalMonthly > 0 && (
            <span className="text-caption text-[var(--text-tertiary)]">
              월 {formatCurrency(totalMonthly)}
            </span>
          )}
        </div>
        {recurring.length > 0 && (
          <button
            onClick={() => onApplyToday(recurring)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/10 text-caption text-primary-500 font-medium
              hover:bg-primary-500/20 transition-colors press-effect"
          >
            <Check size={12} />오늘 지출에 추가
          </button>
        )}
      </div>

      {/* 1일 알림 */}
      {dayOfMonth === 1 && recurring.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-info/5 border border-info/15">
          <p className="text-caption text-info font-medium">
            매월 1일입니다. 고정 경비를 오늘 지출에 추가하세요!
          </p>
        </div>
      )}

      {/* 목록 */}
      {recurring.length > 0 && (
        <div className="space-y-1 mb-3">
          {recurring.map((exp, idx) => (
            <div key={idx} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <button onClick={() => handleRemove(idx)}
                  className="text-[var(--text-tertiary)] hover:text-danger transition-colors">
                  <X size={12} />
                </button>
                <span className="text-body-small text-[var(--text-primary)]">{exp.name}</span>
              </div>
              <span className="text-body-small font-display text-[var(--text-secondary)] tabular-nums">
                {formatCurrency(exp.amount, { showSymbol: false })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 프리셋 */}
      {adding && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {RECURRING_PRESETS.map((p) => (
            <button key={p} onClick={() => setNewName(p)}
              className={`px-2.5 h-7 rounded-lg text-[12px] font-medium transition-all ${
                newName === p ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
              }`}>{p}</button>
          ))}
        </div>
      )}

      {/* 추가 폼 */}
      <AnimatePresence>
        {adding ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="항목명" autoFocus
                className="flex-1 h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
              <div className="flex items-center gap-1">
                <span className="text-caption text-[var(--text-tertiary)]">₩</span>
                <input type="text" inputMode="numeric" value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="금액" className="w-24 h-9 px-2 rounded-xl text-right bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
              </div>
              <button onClick={handleAdd} className="h-9 w-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={() => setAdding(false)} className="w-full mt-2 text-caption text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">취소</button>
          </motion.div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2 rounded-xl border border-dashed border-[var(--border-default)] text-caption text-[var(--text-tertiary)] hover:text-primary-500 hover:border-primary-500/30 flex items-center justify-center gap-1 transition-colors">
            <Plus size={13} />고정 경비 추가
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
