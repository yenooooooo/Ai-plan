/** 관리자 문의 관리 API */
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/security/validate";
import { sendPushToUser } from "@/lib/push/sendPush";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const status = new URL(req.url).searchParams.get("status");
    const sb = createAdminClient();

    let query = sb.from("sb_support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

    // Resolve user emails
    const { data: authData } = await sb.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    for (const u of authData?.users ?? []) {
      emailMap.set(u.id, u.email ?? "");
    }

    const tickets = (data ?? []).map((t) => ({
      ...t,
      email: emailMap.get(t.user_id) ?? "",
    }));

    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { id, status, adminReply } = await req.json();
    if (!isValidUUID(id)) return NextResponse.json({ error: "ID 형식 오류" }, { status: 400 });

    const sb = createAdminClient();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (status) updateData.status = status;
    if (adminReply) {
      updateData.admin_reply = adminReply;
      updateData.admin_replied_at = new Date().toISOString();
      updateData.status = "replied";
    }

    const { error } = await sb.from("sb_support_tickets").update(updateData).eq("id", id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

    // Send push notification to user when admin replies
    if (adminReply) {
      const { data: ticket } = await sb.from("sb_support_tickets")
        .select("user_id").eq("id", id).single();
      if (ticket) {
        sendPushToUser(ticket.user_id, {
          title: "문의 답변",
          body: "문의하신 내용에 답변이 등록되었습니다.",
          url: "/settings",
          tag: "support-reply",
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
