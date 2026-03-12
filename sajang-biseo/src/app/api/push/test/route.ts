import { NextResponse } from "next/server";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push/sendPush";

export const dynamic = "force-dynamic";

/**
 * 테스트용: 현재 로그인한 유저에게 테스트 푸시 발송
 * POST /api/push/test
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const sent = await sendPushToUser(user.id, {
      title: "테스트 알림 🔔",
      body: "푸시 알림이 정상적으로 작동합니다!",
      url: "/settings",
      tag: "test",
    });

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("Test push error:", err);
    return NextResponse.json({ error: "발송 실패" }, { status: 500 });
  }
}
