"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export interface Expense {
  name: string;
  amount: number;
}

const EXPENSE_PRESETS = ["식재료", "포장재", "광고", "인건비", "수선/수리", "기타"] as const;

interface TodayExpensesProps {
  expenses: Expense[];
  onChange: (expenses: Expense[]) => void;
}

export function TodayExpenses({ expenses, onChange }: TodayExpensesProps) {
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [shake, setShake] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const handleAdd = () => {
    const amount = parseInt(newAmount, 10);
    const isNameEmpty = !newName.trim();
    const isAmountInvalid = isNaN(amount) || amount <= 0;

    if (isNameEmpty || isAmountInvalid) {
      setNameError(isNameEmpty);
      setAmountError(isAmountInvalid);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    onChange([...expenses, { name: newName.trim(), amount }]);
    setNewName("");
    setNewAmount("");
    setNameError(false);
    setAmountError(false);
  };

  const handleRemove = (idx: number) => {
    onChange(expenses.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* 지출 목록 */}
      {expenses.length > 0 && (
        <div className="space-y-1.5">
          {expenses.map((expense, idx) => (
            <div key={idx} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => handleRemove(idx)}
                  className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                >
                  <X size={13} />
                </button>
                <span className="text-body-small text-[var(--text-primary)] truncate">{expense.name}</span>
              </div>
              <span className="text-body-small font-display text-[var(--fee-deducted)] tabular-nums shrink-0 ml-3">
                -{formatCurrency(expense.amount, { showSymbol: false })}
              </span>
            </div>
          ))}
          <div className="h-px bg-[var(--border-subtle)] mt-1" />
        </div>
      )}

      {/* 카테고리 프리셋 */}
      <div className="flex gap-1.5 flex-wrap">
        {EXPENSE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => { setNewName(preset); setNameError(false); }}
            className={`px-2.5 h-7 rounded-lg text-[12px] font-medium transition-all
              ${newName === preset
                ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"
              }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* 추가 입력 폼 — 모바일에서 세로 배치 */}
      <div
        className={shake ? "animate-shake" : ""}
        style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="지출 항목 (예: 삼겹살 추가구매)"
            className={`w-full h-9 px-3 rounded-xl transition-colors
              bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
              focus:outline-none
              ${nameError
                ? "border-2 border-[var(--danger)]"
                : "border border-[var(--border-default)] focus:border-primary-500"
              }`}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className="text-caption text-[var(--text-tertiary)]">₩</span>
              <input
                type="text"
                inputMode="numeric"
                value={newAmount}
                onChange={(e) => { setNewAmount(e.target.value.replace(/[^0-9]/g, "")); setAmountError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="금액"
                className={`w-full sm:w-24 h-9 px-2 rounded-xl text-right transition-colors
                  bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
                  focus:outline-none
                  ${amountError
                    ? "border-2 border-[var(--danger)]"
                    : "border border-[var(--border-default)] focus:border-primary-500"
                  }`}
              />
            </div>
            <button
              onClick={handleAdd}
              className="h-9 w-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0
                hover:bg-primary-600 active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {(nameError || amountError) && (
        <p className="text-caption text-[var(--danger)]">
          {nameError && amountError ? "항목명과 금액을 모두 입력해주세요" :
           nameError ? "항목명을 입력해주세요" : "금액을 입력해주세요"}
        </p>
      )}

      {expenses.length === 0 && !nameError && !amountError && (
        <p className="text-caption text-[var(--text-tertiary)] text-center py-1">
          오늘 별도로 지출한 항목을 입력하세요
        </p>
      )}
    </div>
  );
}
