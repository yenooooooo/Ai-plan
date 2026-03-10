"use client";

import { Lock, ArrowUpRight } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { PLAN_LABELS, type PlanType } from "@/lib/plan";

interface Props {
  /** 이 기능에 필요한 최소 플랜 */
  requiredPlan: PlanType;
  /** 기능 이름 (표시용) */
  featureName: string;
  children: React.ReactNode;
}

/** 플랜 미달 시 업그레이드 안내를 보여주는 게이트 */
export function PlanGate({ requiredPlan, featureName, children }: Props) {
  const { plan, loading } = usePlan();

  if (loading) return <>{children}</>;

  const planOrder: PlanType[] = ["free", "pro", "pro_plus"];
  const currentIdx = planOrder.indexOf(plan);
  const requiredIdx = planOrder.indexOf(requiredPlan);

  if (currentIdx >= requiredIdx) return <>{children}</>;

  return (
    <div className="glass-card p-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
        <Lock size={20} className="text-primary-500" />
      </div>
      <h3 className="text-body-default font-semibold text-[var(--text-primary)]">
        {featureName}
      </h3>
      <p className="text-caption text-[var(--text-secondary)]">
        이 기능은 <span className="font-semibold text-primary-500">{PLAN_LABELS[requiredPlan]}</span> 플랜부터 사용할 수 있습니다.
      </p>
      <button
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect"
        onClick={() => window.open("/", "_blank")}
      >
        플랜 업그레이드 <ArrowUpRight size={14} />
      </button>
    </div>
  );
}
