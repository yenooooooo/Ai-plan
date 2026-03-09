"use client";

import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Sparkles } from "lucide-react";
import type { AiCoachingData } from "@/lib/briefing/types";

interface CoachingCardProps {
  data: AiCoachingData;
  generating: boolean;
  onGenerate: () => void;
}

export function CoachingCard({ data, generating, onGenerate }: CoachingCardProps) {
  const hasContent = data.actions.length > 0;

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

      {/* 목표 */}
      {data.goals.length > 0 && (
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={13} className="text-amber-500" />
            <span className="text-caption font-semibold text-[var(--text-primary)]">이번 주 목표</span>
          </div>
          <div className="space-y-1.5">
            {data.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 text-caption text-[var(--text-secondary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {goal}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 생성 버튼 */}
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
    </div>
  );
}
