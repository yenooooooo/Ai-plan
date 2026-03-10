"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { formatCompact, formatPercent } from "@/lib/utils/format";

interface GoalAlertBannerProps {
  currentSales: number;
  goal: number;
  daysRemaining: number;
  monthLabel: string;
}

export function GoalAlertBanner({ currentSales, goal, daysRemaining, monthLabel }: GoalAlertBannerProps) {
  if (goal <= 0) return null;

  const progress = (currentSales / goal) * 100;
  const remaining = Math.max(0, goal - currentSales);
  const dailyNeeded = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0;

  // 달성 완료
  if (progress >= 100) {
    const overAmount = currentSales - goal;
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border border-success/20 bg-success/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-success" />
          </div>
          <div>
            <p className="text-body-small font-semibold text-success">
              {monthLabel} 목표 달성!
            </p>
            <p className="text-caption text-[var(--text-secondary)]">
              목표 대비 <span className="font-display text-success">+{formatCompact(overAmount)}</span> 초과 달성
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 90% 이상 — 거의 다 왔어요
  if (progress >= 90) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border border-primary-500/20 bg-primary-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
            <Flame size={16} className="text-primary-500" />
          </div>
          <div>
            <p className="text-body-small font-semibold text-primary-500">
              목표까지 {formatCompact(remaining)} 남았어요!
            </p>
            <p className="text-caption text-[var(--text-secondary)]">
              달성률 {formatPercent(progress)} · 남은 {daysRemaining}일간 일 {formatCompact(dailyNeeded)} 필요
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 70% 이상 — 순항 중
  if (progress >= 70) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border border-info/20 bg-info/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-info" />
          </div>
          <div>
            <p className="text-body-small font-semibold text-info">
              {monthLabel} 목표 순항 중 ({formatPercent(progress)})
            </p>
            <p className="text-caption text-[var(--text-secondary)]">
              남은 {daysRemaining}일, 일 평균 <span className="font-display">{formatCompact(dailyNeeded)}</span> 유지하면 달성
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 70% 미만일 때는 배너 표시 안 함 (MonthlyGoal 컴포넌트에서 충분)
  return null;
}
