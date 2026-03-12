/** 클라이언트 액션 로깅 API */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { action, metadata } = await req.json();
    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "action 필수" }, { status: 400 });
    }

    // Allowed actions whitelist
    const ALLOWED = ["closing_save", "order_save", "settings_update", "briefing_view", "login"];
    if (!ALLOWED.includes(action)) {
      return NextResponse.json({ error: "유효하지 않은 action" }, { status: 400 });
    }

    logActivity(user.id, action, metadata);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
