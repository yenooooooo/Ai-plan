"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Sparkles, CheckCircle2, Circle, ChevronDown, History, Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useBriefingGoals } from "@/stores/useBriefingGoals";
import type { AiCoachingData } from "@/lib/briefing/types";

interface CoachingCardProps {
  data: AiCoachingData;
  generating: boolean;
  onGenerate: () => void;
  weekStart: string;
  prevCoaching?: AiCoachingData | null;
}

export function CoachingCard({ data, generating, onGenerate, weekStart, prevCoaching }: CoachingCardProps) {
  const hasContent = data.actions.length > 0;
  const { limits } = usePlan();
  const { completed, toggle, getProgress } = useBriefingGoals();
  const [showPrev, setShowPrev] = useState(false);

  const progress = getProgress(weekStart, data.goals.length);
  const progressPercent = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 핵심 인사이트 */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-amber-500" />
          <span className="text-body-small font-semibold text-amber-500">핵심 인사이트</span>
        </div>
        <p className="text-body-small text-[var(--text-primary)] leading-relaxed">
          {data.insight}
        </p>
      </div>

      {/* 실행 제안 */}
      {hasContent && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Target size={14} className="text-amber-500" />
            <span className="text-caption font-semibold text-[var(--text-primary)]">이번 주 실행 제안</span>
          </div>
          {data.actions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--bg-tertiary)] rounded-xl p-3"
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-body-small font-medium text-[var(--text-primary)] mb-0.5">
                    {action.title}
                  </p>
                  <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 목표 달성률 트래킹 */}
      {data.goals.length > 0 && (
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lightbulb size={13} className="text-amber-500" />
              <span className="text-caption font-semibold text-[var(--text-primary)]">이번 주 목표</span>
            </div>
            <span className="text-[11px] font-medium text-amber-500">
              {progress.done}/{progress.total} 완료
            </span>
          </div>

          {/* 진행률 바 */}
          <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${progressPercent >= 100 ? "bg-success" : "bg-amber-500"}`}
            />
          </div>

          {/* 체크 가능한 목표 리스트 */}
          <div className="space-y-1.5">
            {data.goals.map((goal, i) => {
              const key = `${weekStart}-${i}`;
              const isDone = !!completed[key];
              return (
                <button
                  key={i}
                  onClick={() => toggle(weekStart, i)}
                  className="w-full flex items-center gap-2 text-left press-effect"
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[var(--text-tertiary)] shrink-0" />
                  )}
                  <span className={`text-caption ${isDone ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-secondary)]"}`}>
                    {goal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 지난주 코칭 비교 */}
      {prevCoaching && prevCoaching.actions.length > 0 && (
        <div className="border border-[var(--bg-tertiary)] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPrev(!showPrev)}
            className="w-full flex items-center justify-between p-3 press-effect"
          >
            <div className="flex items-center gap-1.5">
              <History size={13} className="text-[var(--text-tertiary)]" />
              <span className="text-caption font-medium text-[var(--text-secondary)]">지난주 코칭 비교</span>
            </div>
            <ChevronDown size={14} className={`text-[var(--text-tertiary)] transition-transform ${showPrev ? "rotate-180" : ""}`} />
          </button>
          {showPrev && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-3 pb-3 space-y-2"
            >
              <p className="text-[11px] text-[var(--text-tertiary)] italic">
                {prevCoaching.insight}
              </p>
              {prevCoaching.actions.map((a, i) => (
                <div key={i} className="text-[11px] text-[var(--text-secondary)]">
                  <span className="text-[var(--text-tertiary)]">{i + 1}.</span> {a.title}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* AI 생성 버튼 */}
      {limits.aiCoaching ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGenerate}
          disabled={generating}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-body-small flex items-center justify-center gap-2 press-effect disabled:opacity-50"
        >
          {generating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={16} />
              AI 경영 코칭 {hasContent ? "재생성" : "생성"}
            </>
          )}
        </motion.button>
      ) : (
        <div className="w-full py-3 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-body-small font-medium flex items-center justify-center gap-2">
          <Lock size={14} /> Pro 플랜부터 사용 가능
        </div>
      )}
    </div>
  );
}
