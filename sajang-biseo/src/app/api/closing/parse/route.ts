import { NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";

export const dynamic = "force-dynamic";

interface ParsedClosing {
  totalSales: number | null;
  channels: { channel: string; ratio: number }[];
  memo: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const plan = await getUserPlan(user.id);
    if (!getPlanLimits(plan).aiCoaching) {
      return NextResponse.json(
        { success: false, error: "AI 대화 입력은 Pro 플랜부터 사용 가능합니다.", limitReached: true },
        { status: 429 }
      );
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ success: false, error: "텍스트 입력 필요" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API 키 미설정" }, { status: 503 });
    }

    const prompt = `당신은 한국 외식업 매장의 마감 데이터를 파싱하는 도우미입니다.

사장님이 자유롭게 입력한 텍스트에서 매출 정보를 추출해주세요.

## 입력 텍스트
"${text}"

## 추출 규칙
- 총매출: 숫자와 "만", "천" 등 한국어 단위를 인식 (예: "187만" = 1870000, "이백삼만" = 2030000)
- 채널 비율: 홀, 배민, 쿠팡이츠, 요기요, 땡겨요, 포장 등의 채널과 금액/비율 인식
- 채널 금액이 있으면 총매출 기준 비율로 변환 (합계 100%)
- 채널 정보 없으면 channels를 빈 배열로
- 나머지 텍스트는 memo에

반드시 JSON으로만 응답:
{"totalSales": number|null, "channels": [{"channel": "채널명", "ratio": number}], "memo": "메모 텍스트"}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "AI 분석 실패" }, { status: 500 });
    }

    const result = await res.json();
    const responseText = result.content?.[0]?.text ?? "";

    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = codeBlockMatch?.[1]?.trim() ?? responseText;
    const jsonMatch = candidate.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "파싱 실패" }, { status: 500 });
    }

    const parsed: ParsedClosing = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
