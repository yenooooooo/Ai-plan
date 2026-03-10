/** 플랜 타입 및 제한 정의 */

export type PlanType = "free" | "pro" | "pro_plus";

export interface PlanLimits {
  maxStores: number;
  receiptPerMonth: number;
  reviewPerMonth: number;
  csvExport: boolean;
  pdfExport: boolean;
  aiCoaching: boolean;
  aiOrder: boolean;
  emailBriefing: boolean;
  teamMembers: number;
  multiStoreDashboard: boolean;
  salesForecast: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxStores: 1,
    receiptPerMonth: 5,
    reviewPerMonth: 3,
    csvExport: false,
    pdfExport: false,
    aiCoaching: false,
    aiOrder: false,
    emailBriefing: false,
    teamMembers: 0,
    multiStoreDashboard: false,
    salesForecast: false,
  },
  pro: {
    maxStores: 3,
    receiptPerMonth: 100,
    reviewPerMonth: 50,
    csvExport: true,
    pdfExport: true,
    aiCoaching: true,
    aiOrder: true,
    emailBriefing: false,
    teamMembers: 0,
    multiStoreDashboard: false,
    salesForecast: false,
  },
  pro_plus: {
    maxStores: Infinity,
    receiptPerMonth: Infinity,
    reviewPerMonth: Infinity,
    csvExport: true,
    pdfExport: true,
    aiCoaching: true,
    aiOrder: true,
    emailBriefing: true,
    teamMembers: 3,
    multiStoreDashboard: true,
    salesForecast: true,
  },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  free: "무료",
  pro: "Pro",
  pro_plus: "Pro+",
};

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  if (plan && plan in PLAN_LIMITS) return PLAN_LIMITS[plan as PlanType];
  return PLAN_LIMITS.free;
}
