"use client";

import { Crown, Receipt, MessageSquare, Check, X, ArrowRight } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { PLAN_LIMITS, type PlanType } from "@/lib/plan";

const PLAN_COLORS: Record<PlanType, string> = {
  free: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  pro: "bg-primary-500/15 text-primary-500",
  pro_plus: "bg-gradient-to-r from-primary-500 to-violet-500 text-white",
};

const FEATURE_LIST: { key: keyof typeof PLAN_LIMITS.free; label: string }[] = [
  { key: "csvExport", label: "CSV 내보내기" },
  { key: "pdfExport", label: "PDF 내보내기" },
  { key: "aiCoaching", label: "AI 경영 코칭" },
  { key: "aiOrder", label: "AI 발주 추천" },
  { key: "emailBriefing", label: "이메일 브리핑" },
  { key: "salesForecast", label: "매출 예측" },
  { key: "multiStoreDashboard", label: "멀티매장 대시보드" },
];

export function PlanUsageSection() {
  const { plan, planLabel, planExpiresAt, usage, resetDate, loading } = useUsage();

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24" />
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-40" />
          </div>
        </div>
      </div>
    );
  }

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const receiptPct = usage.receipt_ocr.limit === Infinity
    ? 0 : (usage.receipt_ocr.used / usage.receipt_ocr.limit) * 100;
  const reviewPct = usage.review_generate.limit === Infinity
    ? 0 : (usage.review_generate.used / usage.review_generate.limit) * 100;

  return (
    <div className="glass-card p-5 space-y-5">
      {/* 플랜 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PLAN_COLORS[plan]}`}>
            <Crown size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-heading-md text-[var(--text-primary)]">내 플랜</h3>
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${PLAN_COLORS[plan]}`}>
                {planLabel}
              </span>
            </div>
            {planExpiresAt && (
              <p className="text-caption text-[var(--text-tertiary)]">
                {new Date(planExpiresAt).toLocaleDateString("ko-KR")} 만료
              </p>
            )}
            {plan === "free" && (
              <p className="text-caption text-[var(--text-tertiary)]">
                매장 {limits.maxStores}개 · 기본 기능
              </p>
            )}
          </div>
        </div>
        {plan === "free" && (
          <button
            onClick={() => { window.location.href = "/"; }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-caption font-medium press-effect"
          >
            업그레이드 <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* 사용량 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body-small font-medium text-[var(--text-primary)]">이번 달 사용량</h4>
          {resetDate && (
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {new Date(resetDate).getMonth() + 1}월 1일 초기화
            </span>
          )}
        </div>

        <UsageBar
          icon={<Receipt size={14} />}
          label="영수증 인식"
          used={usage.receipt_ocr.used}
          limit={usage.receipt_ocr.limit}
          pct={receiptPct}
        />
        <UsageBar
          icon={<MessageSquare size={14} />}
          label="리뷰 답글"
          used={usage.review_generate.used}
          limit={usage.review_generate.limit}
          pct={reviewPct}
        />
      </div>

      {/* 포함 기능 */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <h4 className="text-caption font-medium text-[var(--text-secondary)] mb-2">포함 기능</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {FEATURE_LIST.map(({ key, label }) => {
            const enabled = !!limits[key];
            return (
              <div key={key} className="flex items-center gap-1.5">
                {enabled
                  ? <Check size={12} className="text-success shrink-0" />
                  : <X size={12} className="text-[var(--text-tertiary)] shrink-0" />
                }
                <span className={`text-[11px] ${enabled ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] line-through"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UsageBar({ icon, label, used, limit, pct }: {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  pct: number;
}) {
  const isUnlimited = limit === Infinity;
  const color = isUnlimited ? "bg-success" : pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-primary-500";
  const textColor = isUnlimited ? "text-success" : pct >= 100 ? "text-danger" : pct >= 80 ? "text-warning" : "text-[var(--text-secondary)]";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          {icon}
          <span className="text-caption">{label}</span>
        </div>
        <span className={`text-caption font-medium ${textColor}`}>
          {isUnlimited ? `${used}회 (무제한)` : `${used}/${limit}회`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          />
        </div>
      )}
    </div>
  );
}
