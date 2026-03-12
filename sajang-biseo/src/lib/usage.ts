/** 서버 사이드 사용량 추적 유틸 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanLimits } from "@/lib/plan";

type Feature = "receipt_ocr" | "review_generate";

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

/** 사용자 플랜 조회 (쿠폰 만료 자동 처리 포함) */
export async function getUserPlan(userId: string): Promise<string> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("sb_user_profiles")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .single();

  if (!data) return "free";

  const row = data as { plan?: string; plan_expires_at?: string | null };

  // 쿠폰 플랜 만료 체크
  if (row.plan_expires_at && new Date(row.plan_expires_at) < new Date()) {
    await sb.from("sb_user_profiles")
      .update({ plan: "free", plan_expires_at: null })
      .eq("id", userId);
    return "free";
  }

  return row.plan ?? "free";
}

/** 현재 월 사용량 조회 */
export async function getUsageCount(userId: string, feature: Feature): Promise<number> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("sb_usage_logs")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("month", getCurrentMonth())
    .single();
  return (data as { count?: number } | null)?.count ?? 0;
}

/** 사용량 증가 (upsert) */
export async function incrementUsage(userId: string, feature: Feature): Promise<void> {
  const sb = createAdminClient();
  const month = getCurrentMonth();
  const { data: existing } = await sb
    .from("sb_usage_logs")
    .select("id, count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("month", month)
    .single();

  if (existing) {
    await sb.from("sb_usage_logs")
      .update({ count: (existing as { count: number }).count + 1, updated_at: new Date().toISOString() })
      .eq("id", (existing as { id: string }).id);
  } else {
    await sb.from("sb_usage_logs").insert({
      user_id: userId, feature, month, count: 1,
    });
  }
}

/** 제한 체크 + 사전 증가: 초과 시 에러 메시지 반환, 통과 시 null (사용량 미리 증가) */
export async function checkUsageLimit(
  userId: string,
  feature: Feature
): Promise<string | null> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  const limitKey = feature === "receipt_ocr" ? "receiptPerMonth" : "reviewPerMonth";
  const max = limits[limitKey];
  if (max === Infinity) return null;

  const current = await getUsageCount(userId, feature);
  if (current >= max) {
    const label = feature === "receipt_ocr" ? "영수증 인식" : "리뷰 답글 생성";
    return `${label} 월간 한도 ${max}회를 초과했습니다. 플랜을 업그레이드해주세요.`;
  }

  // Race condition 방지: 체크 통과 시 즉시 사용량 증가
  await incrementUsage(userId, feature);
  return null;
}

/** 매장 수 제한 체크 */
export async function checkStoreLimit(userId: string): Promise<string | null> {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  if (limits.maxStores === Infinity) return null;

  const sb = createAdminClient();
  const { count } = await sb
    .from("sb_stores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if ((count ?? 0) >= limits.maxStores) {
    return `현재 플랜은 최대 ${limits.maxStores}개 매장까지 가능합니다. 플랜을 업그레이드해주세요.`;
  }
  return null;
}
