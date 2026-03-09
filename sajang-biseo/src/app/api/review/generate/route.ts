/**
 * 리뷰 답글 생성 API Route
 * Claude API로 블록형 답글 생성 (서버 사이드)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";

interface GenerateRequest {
  reviewContent: string;
  rating: number;
  platform: string;
  toneSettings: {
    toneName: string;
    sampleReplies: string[];
    storeNameDisplay: string;
    signatureMenus: string[];
    storeFeatures: string[];
    frequentPhrases: string[];
    useEmoji: boolean;
  };
  /** 특정 블록만 재생성 시 */
  regenerateBlock?: {
    type: string;
    toneAdjustment?: string;
    context: string; // 다른 블록 텍스트
  };
  versionsCount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
    }

    const body: GenerateRequest = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API 키가 설정되지 않았습니다" },
        { status: 503 }
      );
    }

    const prompt = body.regenerateBlock
      ? buildBlockPrompt(body)
      : buildFullPrompt(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "답글 생성 실패" }, { status: 500 });
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "답글 파싱 실패" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Review generate error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

function buildFullPrompt(body: GenerateRequest): string {
  const { reviewContent, rating, platform, toneSettings: ts, versionsCount = 3 } = body;
  return `당신은 한국 음식점 사장님의 리뷰 답글 작성 도우미입니다.

매장 정보:
- 매장명: ${ts.storeNameDisplay || "우리 매장"}
- 대표 메뉴: ${ts.signatureMenus?.join(", ") || "없음"}
- 매장 특징: ${ts.storeFeatures?.join(", ") || "없음"}
- 자주 쓰는 표현: ${ts.frequentPhrases?.join(", ") || "없음"}
- 이모지 사용: ${ts.useEmoji ? "사용" : "미사용"}
- 톤: ${ts.toneName}
${ts.sampleReplies?.length ? `- 기존 답글 예시:\n${ts.sampleReplies.map((s, i) => `  ${i + 1}. "${s}"`).join("\n")}` : ""}

리뷰:
- 플랫폼: ${platform}
- 별점: ${rating}점/5점
- 내용: "${reviewContent}"

규칙:
1. 과도한 사과나 비굴한 톤 지양
2. 매장 특성(메뉴명, 특징)을 자연스럽게 녹이기
3. 답글은 4개 블록으로 구성: greeting(인사), mention(리뷰 언급), response(감사 또는 해명), closing(마무리)
4. ${versionsCount}개 버전 생성

반드시 아래 JSON 형식으로만 응답:
{
  "versions": [
    {
      "blocks": [
        {"type": "greeting", "text": "인사 텍스트"},
        {"type": "mention", "text": "리뷰 내용 언급 텍스트"},
        {"type": "response", "text": "감사 또는 해명 텍스트"},
        {"type": "closing", "text": "마무리 텍스트"}
      ]
    }
  ]
}

JSON만 응답하세요.`;
}

function buildBlockPrompt(body: GenerateRequest): string {
  const { reviewContent, rating, toneSettings: ts, regenerateBlock: rb } = body;
  const adj = rb?.toneAdjustment;
  const adjText = adj === "polite" ? "더 정중한 톤으로" :
    adj === "short" ? "더 짧게" :
    adj === "apology" ? "사과하는 톤을 추가하여" :
    adj === "humor" ? "유머를 추가하여" : "";

  return `한국 음식점 리뷰 답글의 "${rb?.type}" 블록만 다시 작성해주세요.

매장: ${ts.storeNameDisplay || "우리 매장"}
톤: ${ts.toneName}, 이모지: ${ts.useEmoji ? "사용" : "미사용"}
리뷰: "${reviewContent}" (${rating}점)
다른 블록 내용: ${rb?.context}
${adjText ? `요청: ${adjText}` : ""}

반드시 JSON으로만 응답: {"text": "새로운 블록 텍스트"}`;
}

