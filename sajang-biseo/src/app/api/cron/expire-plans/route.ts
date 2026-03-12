/** Cron: 만료된 쿠폰 플랜 자동 해지 (매일 자정) */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel Cron 인증 (Authorization: Bearer {CRON_SECRET})
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = createAdminClient();
    const now = new Date().toISOString();

    // plan_expires_at이 지났고 아직 free가 아닌 사용자 일괄 다운그레이드
    const { data: expired, error } = await sb
      .from("sb_user_profiles")
      .update({ plan: "free", plan_expires_at: null, updated_at: now })
      .lt("plan_expires_at", now)
      .neq("plan", "free")
      .select("id");

    if (error) throw error;

    console.log(`[Cron] expire-plans: ${expired?.length ?? 0}명 플랜 만료 처리`);
    return NextResponse.json({ success: true, expired: expired?.length ?? 0 });
  } catch (err) {
    console.error("[Cron] expire-plans error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
