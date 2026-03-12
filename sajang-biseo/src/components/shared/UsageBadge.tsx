"use client";

import { useUsage } from "@/hooks/useUsage";

interface UsageBadgeProps {
  feature: "receipt_ocr" | "review_generate";
}

/** 기능 화면에 표시할 남은 횟수 뱃지 */
export function UsageBadge({ feature }: UsageBadgeProps) {
  const { usage, loading } = useUsage();
  if (loading) return null;

  const { used, limit } = usage[feature];
  if (limit === Infinity) return null; // 무제한이면 표시 안 함

  const remaining = Math.max(0, limit - used);
  const pct = (used / limit) * 100;
  const color = pct >= 100
    ? "bg-danger/10 text-danger"
    : pct >= 80
      ? "bg-warning/10 text-warning"
      : "bg-primary-500/10 text-primary-500";

  const label = feature === "receipt_ocr" ? "인식" : "생성";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${color}`}>
      남은 {label}: {remaining}/{limit}회
    </span>
  );
}
