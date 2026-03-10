import { NextResponse } from "next/server";
import type {
  SalesSummaryData,
  FeeSummaryData,
  ExpenseSummaryData,
  IngredientEfficiencyData,
  CustomerReputationData,
} from "@/lib/briefing/types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface RequestBody {
  sales: SalesSummaryData;
  fees: FeeSummaryData;
  expenses: ExpenseSummaryData;
  ingredients: IngredientEfficiencyData;
  reputation: CustomerReputationData;
}

function buildPrompt(data: RequestBody): string {
  const { sales, fees, expenses, ingredients, reputation } = data;

  return `당신은 외식업 경영 컨설턴트입니다. 다음 주간 경영 데이터를 분석하여 실행 가능한 코칭을 제공해주세요.

## 매출
- 총매출: ${sales.totalSales.toLocaleString()}원
- 순매출: ${sales.netSales.toLocaleString()}원
- 전주 대비: ${sales.changeRate > 0 ? "+" : ""}${sales.changeRate.toFixed(1)}%
- 일평균: ${sales.dailyAvg.toLocaleString()}원
- 최고: ${sales.bestDay.day}요일 ${sales.bestDay.amount.toLocaleString()}원
- 최저: ${sales.worstDay.day}요일 ${sales.worstDay.amount.toLocaleString()}원

## 수수료
- 총 수수료: ${fees.totalFees.toLocaleString()}원
- 수수료율: ${fees.feeRate.toFixed(1)}% (전주 ${fees.prevFeeRate.toFixed(1)}%)

## 비용
- 총 경비: ${expenses.totalExpense.toLocaleString()}원
- 원가율: ${expenses.costRate.toFixed(1)}%

## 식자재
- 폐기금액: ${ingredients.wasteAmount.toLocaleString()}원
- 폐기율: ${ingredients.wasteRate.toFixed(1)}%
- 폐기 TOP: ${ingredients.wasteTop3.map((w) => w.name).join(", ") || "없음"}

## 고객
- 리뷰 수: ${reputation.reviewCount}건 (전주 ${reputation.prevReviewCount}건)
- 평균 별점: ${reputation.avgRating} (전주 ${reputation.prevAvgRating})
- 답글 완료율: ${reputation.replyRate}%

다음 JSON 형식으로만 응답하세요:
{
  "insight": "2~3문장의 핵심 인사이트",
  "actions": [
    { "title": "제안 제목", "description": "구체적 실행 방안 1~2문장" }
  ],
  "goals": ["이번 주 목표 1", "이번 주 목표 2", "이번 주 목표 3"]
}

actions는 2~3개, goals는 3개로 제한하세요. 한국어로 작성하세요.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API 키가 설정되지 않았습니다" },
        { status: 503 }
      );
    }

    const prompt = buildPrompt(body);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Coaching API error:", res.status, errBody);
      return NextResponse.json({ success: false, error: "코칭 생성 실패" }, { status: 500 });
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
