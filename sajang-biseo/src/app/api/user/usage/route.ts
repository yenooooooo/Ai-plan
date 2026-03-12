/**
 * 사용자 플랜 + 사용량 조회 API
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { getUserPlan, getUsageCount } from "@/lib/usage";
import { getPlanLimits, PLAN_LABELS, type PlanType } from "@/lib/plan";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
    }

    // 플랜 조회
    const plan = await getUserPlan(user.id) as PlanType;
    const limits = getPlanLimits(plan);

    // 만료일 조회
    const { data: profile } = await supabase
      .from("sb_user_profiles")
      .select("plan_expires_at")
      .eq("id", user.id)
      .single();
    const planExpiresAt = (profile as { plan_expires_at?: string | null } | null)?.plan_expires_at ?? null;

    // 사용량 조회
    const [receiptUsed, reviewUsed] = await Promise.all([
      getUsageCount(user.id, "receipt_ocr"),
      getUsageCount(user.id, "review_generate"),
    ]);

    // 다음 달 1일 (초기화일)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      .toISOString().split("T")[0];

    return NextResponse.json({
      success: true,
      data: {
        plan,
        planLabel: PLAN_LABELS[plan] ?? "무료",
        planExpiresAt,
        usage: {
          receipt_ocr: { used: receiptUsed, limit: limits.receiptPerMonth },
          review_generate: { used: reviewUsed, limit: limits.reviewPerMonth },
        },
        resetDate,
      },
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
