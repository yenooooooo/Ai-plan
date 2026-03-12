"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, FileCheck } from "lucide-react";
import type { GenerationStage } from "@/hooks/useReviewData";

interface GenerationProgressProps {
  stage: GenerationStage;
  tokens: number;
}

const STAGES: Record<string, {
  icon: typeof Search;
  message: string;
  subMessage: string;
}> = {
  analyzing: {
    icon: Search,
    message: "리뷰 분석 중...",
    subMessage: "리뷰 내용과 톤 설정을 분석하고 있어요",
  },
  writing: {
    icon: Sparkles,
    message: "답글 작성 중...",
    subMessage: "AI가 맞춤 답글을 작성하고 있어요",
  },
  formatting: {
    icon: FileCheck,
    message: "답글 정리 중...",
    subMessage: "3개 버전으로 정리하고 있어요",
  },
};

export function GenerationProgress({ stage, tokens }: GenerationProgressProps) {
  const config = STAGES[stage ?? "analyzing"] ?? STAGES.analyzing;
  const Icon = config.icon;
  // 토큰 기반 진행률 추정 (약 500토큰 = 100%)
  const progress = Math.min(95, (tokens / 500) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center space-y-5"
    >
      {/* 아이콘 애니메이션 */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: stage === "writing" ? [0, 3, -3, 0] : 0,
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10"
      >
        <Icon size={28} className="text-primary-500" />
      </motion.div>

      {/* 진행 단계 */}
      <div>
        <p className="text-body-small font-semibold text-[var(--text-primary)] mb-1">
          {config.message}
        </p>
        <p className="text-caption text-[var(--text-tertiary)]">
          {config.subMessage}
        </p>
      </div>

      {/* 진행 바 */}
      <div className="w-full max-w-[200px] mx-auto">
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: "5%" }}
            animate={{ width: `${Math.max(5, progress)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 단계 인디케이터 */}
      <div className="flex items-center justify-center gap-2">
        {(["analyzing", "writing", "formatting"] as const).map((s, i) => {
          const stageOrder = ["analyzing", "writing", "formatting"];
          const currentIdx = stageOrder.indexOf(stage ?? "analyzing");
          const isActive = i <= currentIdx;

          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isActive ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"
                }`}
              />
              {i < 2 && (
                <div
                  className={`w-6 h-px transition-colors duration-300 ${
                    isActive && i < currentIdx ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
