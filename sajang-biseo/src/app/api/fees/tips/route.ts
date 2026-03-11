import { NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";

export const dynamic = "force-dynamic";

interface TipsRequest {
  profitability: { channel: string; totalSales: number; totalFees: number; feeRate: number }[];
  totalSales: number;
  totalFees: number;
  feeRate: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    // 플랜 확인 (Pro 이상)
    const plan = await getUserPlan(user.id);
    if (!getPlanLimits(plan).aiCoaching) {
      return NextResponse.json(
        { success: false, error: "AI 수수료 분석은 Pro 플랜부터 사용 가능합니다.", limitReached: true },
        { status: 429 }
      );
    }

    const body = (await request.json()) as TipsRequest;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API 키 미설정" }, { status: 503 });
    }

    const channelInfo = body.profitability
      .map((p) => `- ${p.channel}: 매출 ${p.totalSales.toLocaleString()}원, 수수료 ${p.totalFees.toLocaleString()}원 (${p.feeRate}%)`)
      .join("\n");

    const prompt = `당신은 외식업 수수료 절감 전문 컨설턴트입니다.

## 현재 수수료 현황
- 총매출: ${body.totalSales.toLocaleString()}원
- 총수수료: ${body.totalFees.toLocaleString()}원 (수수료율 ${body.feeRate}%)

## 채널별 상세
${channelInfo}

위 데이터를 분석하여 수수료 절감을 위한 실행 가능한 팁 3~5개를 제공해주세요.
각 팁은 구체적인 수치와 예상 절감액을 포함하세요.

반드시 JSON으로만 응답: {"tips": ["팁1", "팁2", "팁3"]}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "AI 분석 실패" }, { status: 500 });
    }

    const result = await res.json();
    const text = result.content?.[0]?.text ?? "";

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = codeBlockMatch?.[1]?.trim() ?? text;
    const jsonMatch = candidate.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "파싱 실패" }, { status: 500 });
    }

    const parsed = JSON.parse(escapeJsonStrings(jsonMatch[0]));
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

function escapeJsonStrings(raw: string): string {
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === "\\" && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
    }
    result += ch;
  }
  return result;
}
