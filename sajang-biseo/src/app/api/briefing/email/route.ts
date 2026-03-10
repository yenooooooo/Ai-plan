/** 주간 브리핑 이메일 발송 API (Pro+ 전용) */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const plan = await getUserPlan(user.id);
    if (!getPlanLimits(plan).emailBriefing) {
      return NextResponse.json(
        { error: "이메일 브리핑은 Pro+ 플랜부터 사용 가능합니다.", limitReached: true },
        { status: 429 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "이메일 서비스 준비 중입니다." }, { status: 503 });
    }

    const body = await req.json();
    const { briefingId, email: targetEmail } = body;
    if (!briefingId) return NextResponse.json({ error: "브리핑 ID 필요" }, { status: 400 });

    const { data: briefing } = await supabase
      .from("sb_weekly_briefings")
      .select("*")
      .eq("id", briefingId)
      .single();

    if (!briefing) return NextResponse.json({ error: "브리핑을 찾을 수 없습니다" }, { status: 404 });

    const to = targetEmail || user.email;
    const sales = briefing.sales_summary as { totalSales?: number; avgDaily?: number } | null;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "사장님비서 <onboarding@resend.dev>",
        to: [to],
        subject: `[사장님비서] ${briefing.week_start} ~ ${briefing.week_end} 주간 브리핑`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#ef4444">🍳 주간 경영 브리핑</h2>
          <p>${briefing.week_start} ~ ${briefing.week_end}</p>
          <hr/>
          <h3>매출 요약</h3>
          <p>총 매출: ${(sales?.totalSales ?? 0).toLocaleString()}원</p>
          <p>일 평균: ${(sales?.avgDaily ?? 0).toLocaleString()}원</p>
          <hr/>
          <p style="color:#888;font-size:12px">사장님비서에서 발송된 이메일입니다.</p>
        </div>`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return NextResponse.json({ error: "이메일 발송 실패" }, { status: 500 });
    }

    // 발송 기록 업데이트
    await supabase.from("sb_weekly_briefings")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", briefingId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
