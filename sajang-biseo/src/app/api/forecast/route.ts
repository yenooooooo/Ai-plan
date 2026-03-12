/** AI 매출 예측 API (Pro+ 전용) */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";
import { isValidUUID } from "@/lib/security/validate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const plan = await getUserPlan(user.id);
    if (!getPlanLimits(plan).salesForecast) {
      return NextResponse.json(
        { error: "매출 예측은 Pro+ 플랜부터 사용 가능합니다.", limitReached: true },
        { status: 429 }
      );
    }

    const { storeId } = await req.json();
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });

    // 최근 30일 매출 데이터 조회
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data: closings } = await supabase
      .from("sb_daily_closing")
      .select("date, total_sales, net_sales")
      .eq("store_id", storeId)
      .gte("date", thirtyDaysAgo)
      .is("deleted_at", null)
      .order("date");

    if (!closings || closings.length < 7) {
      return NextResponse.json({ error: "예측에 최소 7일 이상의 데이터가 필요합니다." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API 키 미설정" }, { status: 503 });

    const salesData = closings.map((c) => `${c.date}: 매출 ${c.total_sales}원, 순매출 ${c.net_sales}원`).join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `다음은 식당/카페의 최근 매출 데이터입니다:\n${salesData}\n\n이 데이터를 기반으로 다음 7일간 매출을 예측해주세요.\n반드시 아래 JSON으로만 응답:\n{\n  "predictions": [{"date": "YYYY-MM-DD", "expectedSales": 숫자, "confidence": "high"|"medium"|"low"}],\n  "trend": "상승"|"유지"|"하락",\n  "insight": "한줄 분석 코멘트",\n  "weeklyEstimate": 숫자\n}\nJSON만 응답.`,
        }],
      }),
    });

    if (!response.ok) return NextResponse.json({ error: "예측 API 오류" }, { status: 500 });

    const result = await response.json();
    const text = result.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "예측 결과 파싱 실패" }, { status: 500 });

    try {
      return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
    } catch {
      return NextResponse.json({ error: "JSON 파싱 실패" }, { status: 500 });
    }
  } catch (err) {
    console.error("Forecast error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
