"use client";

import { motion } from "framer-motion";
import { ClipboardList, Sparkles, Package, ArrowRight, CheckCircle2 } from "lucide-react";

interface OrderOnboardingProps {
  hasItems: boolean;
  hasUsage: boolean;
  hasOrders: boolean;
  onGoToTab: (tab: string) => void;
}

const STEPS = [
  {
    key: "items",
    icon: Package,
    title: "① 품목 등록",
    desc: "관리할 식자재를 등록하세요. 업종별 기본 템플릿으로 빠르게 시작할 수 있어요.",
    tab: "settings",
    action: "품목관리 가기",
  },
  {
    key: "usage",
    icon: ClipboardList,
    title: "② 사용량 입력",
    desc: "매일 사용한 식자재 양을 입력하면 AI가 패턴을 학습해요.",
    tab: "usage",
    action: "사용량 입력하기",
  },
  {
    key: "orders",
    icon: Sparkles,
    title: "③ 발주 추천 확인",
    desc: "AI가 내일 필요한 발주량을 자동 추천해드려요. 확인 후 거래처에 바로 전달!",
    tab: "recommend",
    action: "발주추천 보기",
  },
];

export function OrderOnboarding({ hasItems, hasUsage, hasOrders, onGoToTab }: OrderOnboardingProps) {
  const completedMap: Record<string, boolean> = {
    items: hasItems,
    usage: hasUsage,
    orders: hasOrders,
  };

  const currentStep = !hasItems ? 0 : !hasUsage ? 1 : !hasOrders ? 2 : -1;
  if (currentStep === -1) return null; // 모두 완료

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 mb-4"
    >
      <h3 className="text-heading-md text-[var(--text-primary)] mb-1">
        시작 가이드
      </h3>
      <p className="text-caption text-[var(--text-tertiary)] mb-4">
        3단계만 완료하면 AI 발주 추천을 받을 수 있어요
      </p>

      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const done = completedMap[step.key];
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-xl border transition-all ${
                done
                  ? "bg-success/5 border-success/20"
                  : isCurrent
                  ? "bg-primary-500/5 border-primary-500/20"
                  : "bg-[var(--bg-tertiary)] border-transparent opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-success/10" : isCurrent ? "bg-primary-500/10" : "bg-[var(--bg-tertiary)]"
                }`}>
                  {done ? (
                    <CheckCircle2 size={18} className="text-success" />
                  ) : (
                    <Icon size={18} className={isCurrent ? "text-primary-500" : "text-[var(--text-tertiary)]"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-body-small font-medium ${
                    done ? "text-success" : "text-[var(--text-primary)]"
                  }`}>
                    {step.title}
                    {done && " ✓"}
                  </p>
                  <p className="text-caption text-[var(--text-tertiary)] mt-0.5">
                    {step.desc}
                  </p>
                  {isCurrent && !done && (
                    <button
                      onClick={() => onGoToTab(step.tab)}
                      className="mt-2 flex items-center gap-1 text-caption font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {step.action}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 진행률 */}
      <div className="mt-4">
        <div className="flex justify-between text-caption text-[var(--text-tertiary)] mb-1">
          <span>진행률</span>
          <span>{Object.values(completedMap).filter(Boolean).length}/3 완료</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Object.values(completedMap).filter(Boolean).length / 3) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-primary-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
