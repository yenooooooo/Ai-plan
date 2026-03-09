"use client";

import { useState } from "react";
import { Target, Check } from "lucide-react";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { formatCurrency } from "@/lib/utils/format";

const QUICK_GOALS = [20_000_000, 30_000_000, 40_000_000, 50_000_000, 70_000_000, 100_000_000];

export function MonthlyGoalSection() {
  const { monthlyGoal, setMonthlyGoal } = useStoreSettings();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saved, setSaved] = useState(false);

  function handleQuickSelect(goal: number) {
    setMonthlyGoal(goal);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleCustomSave() {
    const val = parseInt(inputValue.replace(/[^0-9]/g, ""), 10) || 0;
    if (val > 0) {
      setMonthlyGoal(val);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setEditing(false);
    setInputValue("");
  }

  return (
    <section className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Target size={18} className="text-primary-500" />
        <h2 className="text-body-small font-semibold text-[var(--text-primary)]">월 매출 목표</h2>
        {saved && <Check size={16} className="text-success" />}
      </div>

      <p className="text-caption text-[var(--text-tertiary)]">
        현재 목표: <span className="font-display font-medium text-[var(--text-primary)]">{formatCurrency(monthlyGoal)}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {QUICK_GOALS.map((goal) => (
          <button
            key={goal}
            onClick={() => handleQuickSelect(goal)}
            className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all press-effect ${
              monthlyGoal === goal
                ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
            }`}
          >
            {goal >= 100_000_000 ? `${goal / 100_000_000}억` : `${goal / 10_000}만`}
          </button>
        ))}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter") handleCustomSave(); }}
            placeholder="직접 입력 (원)"
            autoFocus
            className="flex-1 h-9 px-3 rounded-lg text-body-small
              bg-[var(--bg-tertiary)] border border-[var(--border-default)]
              text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
              focus:outline-none focus:border-primary-500 transition-colors"
          />
          <button onClick={handleCustomSave} className="h-9 px-4 rounded-lg text-caption font-medium bg-primary-500 text-white press-effect">
            저장
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-caption text-primary-500 font-medium press-effect"
        >
          직접 입력
        </button>
      )}
    </section>
  );
}
