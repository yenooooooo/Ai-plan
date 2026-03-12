/**
 * 리뷰 답글 생성 API Route
 * Claude API로 블록형 답글 생성 (스트리밍 SSE + Haiku)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

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
    context: string;
  };
  versionsCount?: number;
}

const MODEL = "claude-haiku-4-5-20251001";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
    }

    const limitError = await checkUsageLimit(user.id, "review_generate");
    if (limitError) {
      return NextResponse.json({ success: false, error: limitError, limitReached: true }, { status: 429 });
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

    // 블록 재생성: 비스트리밍 (빠름)
    if (body.regenerateBlock) {
      return handleNonStreaming(prompt, apiKey, user.id);
    }

    // 전체 생성: 스트리밍 SSE
    return handleStreaming(prompt, apiKey, user.id);
  } catch (error) {
    console.error("Review generate error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

/** 블록 재생성 — 비스트리밍 */
async function handleNonStreaming(prompt: string, apiKey: string, userId: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error("Anthropic API error:", response.status, errBody);
    let detail = `API ${response.status}`;
    try { const e = JSON.parse(errBody); detail = e?.error?.message ?? detail; } catch {}
    return NextResponse.json(
      { success: false, error: `답글 생성 실패: ${detail}` },
      { status: 500 }
    );
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? "";
  const parsed = parseResponseJSON(text);

  if (!parsed) {
    return NextResponse.json({ success: false, error: "블록 파싱 실패" }, { status: 500 });
  }

  await incrementUsage(userId, "review_generate");
  return NextResponse.json({ success: true, data: parsed });
}

/** 전체 생성 — 스트리밍 SSE */
async function handleStreaming(prompt: string, apiKey: string, userId: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* controller closed */ }
      };

      try {
        send({ type: "stage", stage: "analyzing", message: "리뷰 분석 중..." });

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 8000,
            stream: true,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => "");
          let detail = `API ${response.status}`;
          try { const e = JSON.parse(errBody); detail = e?.error?.message ?? detail; } catch {}
          send({ type: "error", message: `답글 생성 실패: ${detail}` });
          controller.close();
          return;
        }

        send({ type: "stage", stage: "writing", message: "답글 작성 중..." });

        let fullText = "";
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const events = sseBuffer.split("\n\n");
          sseBuffer = events.pop() || "";

          for (const event of events) {
            for (const line of event.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6);
              if (raw === "[DONE]") continue;
              try {
                const parsed = JSON.parse(raw);
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  fullText += parsed.delta.text;
                  tokenCount++;
                  if (tokenCount % 15 === 0) {
                    send({ type: "progress", tokens: tokenCount });
                  }
                }
              } catch { /* ignore malformed SSE */ }
            }
          }
        }

        send({ type: "stage", stage: "formatting", message: "답글 정리 중..." });

        const parsed = parseResponseJSON(fullText);

        if (parsed) {
          await incrementUsage(userId, "review_generate");
          send({ type: "done", data: parsed });
        } else {
          send({ type: "error", message: "답글 파싱 실패" });
        }
      } catch (err) {
        console.error("Streaming error:", err);
        send({ type: "error", message: "생성 중 오류가 발생했습니다" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

/** JSON 응답 파싱 (코드블록, 이스케이프 처리 포함) */
function parseResponseJSON(text: string): Record<string, unknown> | null {
  try {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = codeBlockMatch?.[1]?.trim() ?? text;
    const jsonMatch = candidate.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(escapeJsonStrings(jsonMatch[0]));
  } catch {
    return null;
  }
}

function getBlockStructure(rating: number): { types: string; example: string } {
  if (rating >= 4) {
    return {
      types: `greeting(인사), empathy(감사 표현), mention(리뷰 내용 구체적 언급), menu_detail(메뉴/서비스 자랑), response(상세 감사), invitation(재방문 유도), closing(따뜻한 마무리)`,
      example: `[
          {"type": "greeting", "text": "..."},
          {"type": "empathy", "text": "..."},
          {"type": "mention", "text": "..."},
          {"type": "menu_detail", "text": "..."},
          {"type": "response", "text": "..."},
          {"type": "invitation", "text": "..."},
          {"type": "closing", "text": "..."}
        ]`,
    };
  }
  if (rating <= 2) {
    return {
      types: `greeting(인사), empathy(공감 표현), mention(고객 불편 구체적 언급), response(해명 및 개선 약속), invitation(재방문 유도), closing(마무리)`,
      example: `[
          {"type": "greeting", "text": "..."},
          {"type": "empathy", "text": "..."},
          {"type": "mention", "text": "..."},
          {"type": "response", "text": "..."},
          {"type": "invitation", "text": "..."},
          {"type": "closing", "text": "..."}
        ]`,
    };
  }
  return {
    types: `greeting(인사), empathy(감사/공감), mention(리뷰 내용 언급), menu_detail(메뉴 소개), response(감사 및 개선점 인정), invitation(재방문 유도), closing(마무리)`,
    example: `[
          {"type": "greeting", "text": "..."},
          {"type": "empathy", "text": "..."},
          {"type": "mention", "text": "..."},
          {"type": "menu_detail", "text": "..."},
          {"type": "response", "text": "..."},
          {"type": "invitation", "text": "..."},
          {"type": "closing", "text": "..."}
        ]`,
  };
}

function buildFullPrompt(body: GenerateRequest): string {
  const { reviewContent, rating, platform, toneSettings: ts, versionsCount = 3 } = body;
  const blockInfo = getBlockStructure(rating);
  const ratingContext = rating >= 4
    ? "긍정 리뷰입니다. 진심 어린 감사와 함께 메뉴/서비스를 자연스럽게 홍보하세요."
    : rating <= 2
    ? "부정 리뷰입니다. 고객의 불편에 진심으로 공감하고, 구체적 개선 약속을 포함하세요. 절대 변명하지 마세요."
    : "보통 리뷰입니다. 감사를 표하면서 아쉬운 점은 인정하고, 더 나은 경험을 약속하세요.";

  return `당신은 한국 음식점/카페 사장님의 리뷰 답글 전문 작성자입니다.
실제 사장님이 직접 쓴 것처럼 자연스럽고 진정성 있는 답글을 작성합니다.

매장 정보:
- 매장명: ${ts.storeNameDisplay || "우리 매장"}
- 대표 메뉴: ${ts.signatureMenus?.join(", ") || "없음"}
- 매장 특징: ${ts.storeFeatures?.join(", ") || "없음"}
- 자주 쓰는 표현: ${ts.frequentPhrases?.join(", ") || "없음"}
- 이모지 사용: ${ts.useEmoji ? "사용" : "미사용"}
- 톤: ${ts.toneName}
${ts.sampleReplies?.length ? `- 기존 답글 스타일 참고:\n${ts.sampleReplies.map((s, i) => `  ${i + 1}. "${s}"`).join("\n")}` : ""}

리뷰:
- 플랫폼: ${platform}
- 별점: ${rating}점/5점
- 내용: "${reviewContent}"

전략: ${ratingContext}

작성 규칙:
1. 각 블록은 반드시 3~5문장으로 작성 (한 줄짜리 답변 절대 금지)
2. 블록 내부에서 문장마다 줄바꿈을 넣어 가독성을 높여주세요 (JSON 이스케이프: \\n 사용)
3. 전체 답글이 최소 20줄 이상이 되어야 합니다 (7블록 × 3줄 이상)
4. 리뷰에서 언급된 구체적인 내용(메뉴명, 상황 등)을 반드시 답글에 포함
5. 매장의 대표 메뉴나 특징을 자연스럽게 1~2회 언급
6. 과도한 사과나 비굴한 톤 지양, 당당하면서도 겸손하게
7. 기계적/템플릿 느낌 지양, 이 리뷰에만 해당되는 맞춤 답변으로 작성
8. 각 버전은 서로 다른 표현과 구성으로 차별화
9. ${versionsCount}개 버전 생성

블록 구성: ${blockInfo.types}

반드시 아래 JSON 형식으로만 응답:
{
  "versions": [
    {
      "blocks": ${blockInfo.example}
    }
  ]
}

JSON만 응답하세요.`;
}

function buildBlockPrompt(body: GenerateRequest): string {
  const { reviewContent, rating, toneSettings: ts, regenerateBlock: rb } = body;
  const adj = rb?.toneAdjustment;
  const adjMap: Record<string, string> = {
    polite: "더 정중하고 격식 있는 톤으로",
    short: "핵심만 간결하게 (2문장 이내)",
    longer: "더 상세하고 풍성하게 (4~5문장)",
    apology: "진심 어린 사과 톤을 자연스럽게 추가하여",
    humor: "센스 있는 유머를 자연스럽게 섞어서",
    warm: "따뜻하고 정감 있는 톤으로",
  };
  const adjText = adj ? adjMap[adj] ?? "" : "";

  return `한국 음식점 리뷰 답글의 "${rb?.type}" 블록만 다시 작성해주세요.

매장: ${ts.storeNameDisplay || "우리 매장"}
대표 메뉴: ${ts.signatureMenus?.join(", ") || "없음"}
톤: ${ts.toneName}, 이모지: ${ts.useEmoji ? "사용" : "미사용"}
리뷰: "${reviewContent}" (${rating}점)
다른 블록 내용: ${rb?.context}
${adjText ? `톤 조절 요청: ${adjText}` : ""}

규칙: 최소 3~4문장, 문장 사이 줄바꿈(JSON \\n 이스케이프), 리뷰 내용에 맞춤 작성, 기계적 표현 지양

반드시 JSON으로만 응답: {"text": "새로운 블록 텍스트"}`;
}

/**
 * JSON 문자열 값 안의 실제 개행/탭 문자를 이스케이프 처리.
 */
function escapeJsonStrings(raw: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
    }

    result += ch;
  }

  return result;
}
