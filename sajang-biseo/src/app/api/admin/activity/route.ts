/** 관리자 활동 로그 조회 API */
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const action = searchParams.get("action");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

    const sb = createAdminClient();

    // If email filter, look up user_id first
    let userId: string | null = null;
    if (email) {
      const { data: authUsers } = await sb.auth.admin.listUsers();
      const found = (authUsers?.users ?? []).find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (!found) return NextResponse.json({ logs: [], total: 0 });
      userId = found.id;
    }

    let query = sb.from("sb_activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) query = query.eq("user_id", userId);
    if (action) query = query.eq("action", action);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to + "T23:59:59");

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

    // Resolve user emails for display
    const { data: authData } = await sb.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    for (const u of authData?.users ?? []) {
      emailMap.set(u.id, u.email ?? "");
    }

    const logs = (data ?? []).map((l: { id: string; user_id: string; action: string; metadata: unknown; created_at: string }) => ({
      id: l.id,
      userId: l.user_id,
      email: emailMap.get(l.user_id) ?? "",
      action: l.action,
      metadata: l.metadata,
      createdAt: l.created_at,
    }));

    return NextResponse.json({ logs, total: count ?? 0 });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
