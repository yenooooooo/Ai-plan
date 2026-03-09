/**
 * 영수증 경비 카테고리 체계 (F01~F99)
 * PROJECT_PLAN.md 기준
 */

export interface ReceiptCategoryDef {
  code: string;
  label: string;
  icon: string;
  taxItem: string;
}

/** 기본 카테고리 (시스템) */
export const DEFAULT_CATEGORIES: ReceiptCategoryDef[] = [
  { code: "F01", label: "식재료비", icon: "🥩", taxItem: "매입비용" },
  { code: "F02", label: "소모품비", icon: "📦", taxItem: "소모품비" },
  { code: "F03", label: "수선유지비", icon: "🔧", taxItem: "수선비" },
  { code: "F04", label: "차량유지비", icon: "⛽", taxItem: "차량유지비" },
  { code: "F05", label: "접대비", icon: "🍽️", taxItem: "접대비" },
  { code: "F06", label: "통신비", icon: "📱", taxItem: "통신비" },
  { code: "F07", label: "광고선전비", icon: "📣", taxItem: "광고선전비" },
  { code: "F08", label: "보험료", icon: "🛡️", taxItem: "보험료" },
  { code: "F09", label: "임차료", icon: "🏠", taxItem: "임차료" },
  { code: "F10", label: "인건비", icon: "👷", taxItem: "인건비" },
  { code: "F99", label: "기타", icon: "📋", taxItem: "기타경비" },
];

/** 카테고리 코드 → 라벨 매핑 */
export const CATEGORY_MAP = new Map(
  DEFAULT_CATEGORIES.map((c) => [c.code, c])
);

/** 카테고리 색상 (왼쪽 컬러 바 용) */
export const CATEGORY_COLORS: Record<string, string> = {
  F01: "#F97316", // orange
  F02: "#8B5CF6", // violet
  F03: "#06B6D4", // cyan
  F04: "#EF4444", // red
  F05: "#EC4899", // pink
  F06: "#3B82F6", // blue
  F07: "#F59E0B", // amber
  F08: "#10B981", // emerald
  F09: "#6366F1", // indigo
  F10: "#14B8A6", // teal
  F99: "#6B7280", // gray
};

/** 결제수단 옵션 */
export const PAYMENT_METHODS = ["카드", "현금", "이체"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
