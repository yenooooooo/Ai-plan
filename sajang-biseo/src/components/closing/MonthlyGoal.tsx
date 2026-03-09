"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Edit3, Check } from "lucide-react";
import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";

interface MonthlyGoalProps {
  currentSales: number;
  goal: number;
  onGoalChange: (goal: number) => void;
  daysRemaining: number;
  monthLabel: string;
}

export function MonthlyGoal({
  currentSales,
  goal,
  onGoalChange,
  daysRemaining,
  monthLabel,
}: MonthlyGoalProps) {
  const [editing, setEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  const progress = goal > 0 ? Math.min((currentSales / goal) * 100, 100) : 0;
  const animatedProgress = useCountUp(progress, { duration: 800, decimals: 1 });
  const remaining = Math.max(0, goal - currentSales);
  const dailyNeeded = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0;

  function handleSaveGoal() {
    const val = parseInt(tempGoal.replace(/,/g, ""), 10);
    if (val > 0) onGoalChange(val);
    setEditing(false);
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-md text-[var(--text-primary)]">
          {monthLabel} 매출 목표
        </h3>
        {editing ? (
          <button
            onClick={handleSaveGoal}
            className="p-2 rounded-lg bg-primary-500/10 text-primary-500 press-effect"
          >
            <Check size={16} />
          </button>
        ) : (
          <button
            onClick={() => { setTempGoal(goal.toString()); setEditing(true); }}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      {/* 목표 입력 */}
      {editing ? (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-body-small text-[var(--text-tertiary)]">₩</span>
            <input
              type="text"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value.replace(/[^0-9]/g, ""))}
              autoFocus
              className="flex-1 bg-transparent text-amount-card text-[var(--text-primary)] font-display outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-body-small text-[var(--text-tertiary)]">목표</span>
            <span className="text-body-small font-display text-[var(--text-secondary)]">
              {formatCurrency(goal)}
            </span>
          </div>
        </div>
      )}

      {/* 프로그레스 바 */}
      <div className="mb-3">
        <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full ${
              progress >= 100
                ? "bg-success"
                : progress >= 70
                ? "bg-primary-500"
                : progress >= 40
                ? "bg-warning"
                : "bg-danger"
            }`}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-caption font-display text-[var(--text-tertiary)]">
            {formatCompact(currentSales)}
          </span>
          <span className="text-caption font-display text-primary-500 font-semibold">
            {animatedProgress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 남은 정보 */}
      {remaining > 0 && daysRemaining > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Target size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-caption text-[var(--text-tertiary)]">
            남은 {daysRemaining}일, 일 평균{" "}
            <span className="font-display text-[var(--text-secondary)]">
              {formatCompact(dailyNeeded)}
            </span>{" "}
            필요
          </span>
        </div>
      )}

      {progress >= 100 && (
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-caption text-success font-medium">
            목표 달성 완료!
          </span>
        </div>
      )}
    </div>
  );
}
