/**
 * 영수증 OCR API Route
 * Claude Vision API로 영수증 분석 (서버 사이드)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";

interface OcrResult {
  date: string | null;
  merchantName: string | null;
  totalAmount: number | null;
  vatAmount: number | null;
  paymentMethod: "카드" | "현금" | "이체" | null;
  cardLastFour: string | null;
  items: { name: string; qty: number; price: number }[] | null;
  categoryCode: string | null;
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다" }, { status: 401 });
    }

    const formData = await req.formData();
    const imageUrl = formData.get("imageUrl") as string;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "이미지 URL이 필요합니다" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // API 키 없으면 더미 결과 반환 (개발용)
      return NextResponse.json({
        success: true,
        data: getDummyResult(),
      });
    }

    // Claude Vision API 호출
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url: imageUrl },
              },
              {
                type: "text",
                text: `이 영수증 이미지를 분석해주세요. 반드시 아래 JSON 형식으로만 응답하세요.

{
  "date": "YYYY-MM-DD 또는 null",
  "merchantName": "가맹점명 또는 null",
  "totalAmount": 숫자(원 단위) 또는 null,
  "vatAmount": 숫자(원 단위) 또는 null,
  "paymentMethod": "카드" | "현금" | "이체" | null,
  "cardLastFour": "카드 끝 4자리 또는 null",
  "items": [{"name": "품목명", "qty": 수량, "price": 금액}] 또는 null,
  "categoryCode": "F01~F99 중 적절한 코드",
  "confidence": 0.0~1.0 (인식 신뢰도)
}

카테고리 코드:
F01=식재료비, F02=소모품비, F03=수선유지비, F04=차량유지비,
F05=접대비, F06=통신비, F07=광고선전비, F08=보험료,
F09=임차료, F10=인건비, F99=기타

JSON만 응답하세요. 설명 금지.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "OCR 처리 실패" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? "";

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        error: "영수증 인식 결과를 파싱할 수 없습니다",
      });
    }

    const parsed: OcrResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

function getDummyResult(): OcrResult {
  return {
    date: new Date().toISOString().split("T")[0],
    merchantName: "인식 결과 없음",
    totalAmount: 0,
    vatAmount: null,
    paymentMethod: "카드",
    cardLastFour: null,
    items: null,
    categoryCode: "F99",
    confidence: 0.5,
  };
}
