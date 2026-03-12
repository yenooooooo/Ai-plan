/** 관리자 푸시 발송 API */
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser, getSubscribedUserIds } from "@/lib/push/sendPush";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const { data } = await sb.from("sb_push_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ history: data ?? [] });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { title, body, targetType, targetValue } = await req.json();
    if (!title || !body) return NextResponse.json({ error: "제목/내용 필수" }, { status: 400 });

    const sb = createAdminClient();
    let targetUserIds: string[] = [];

    if (targetType === "all") {
      targetUserIds = await getSubscribedUserIds();
    } else if (targetType === "plan") {
      const { data: profiles } = await sb.from("sb_user_profiles")
        .select("id").eq("plan", targetValue);
      const allSubscribed = await getSubscribedUserIds();
      const profileIds = new Set((profiles ?? []).map((p) => p.id));
      targetUserIds = allSubscribed.filter((id) => profileIds.has(id));
    } else if (targetType === "user") {
      const { data: authData } = await sb.auth.admin.listUsers();
      const found = (authData?.users ?? []).find(
        (u) => u.email?.toLowerCase() === targetValue?.toLowerCase()
      );
      if (found) targetUserIds = [found.id];
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const userId of targetUserIds) {
      try {
        const sent = await sendPushToUser(userId, { title, body, tag: "admin-broadcast" });
        if (sent > 0) sentCount++; else failedCount++;
      } catch {
        failedCount++;
      }
    }

    // Log to history
    await sb.from("sb_push_history").insert({
      title, body,
      target_type: targetType,
      target_value: targetValue || null,
      sent_count: sentCount,
      failed_count: failedCount,
      sent_by: admin.id,
    });

    return NextResponse.json({ success: true, sentCount, failedCount });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
