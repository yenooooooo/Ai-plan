/** 관리자 팀 초대 현황 API */
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const status = new URL(req.url).searchParams.get("status"); // "pending" | "accepted" | null

    const sb = createAdminClient();
    let query = sb.from("sb_team_members")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (status === "pending") query = query.is("accepted_at", null);
    else if (status === "accepted") query = query.not("accepted_at", "is", null);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

    // Resolve store names
    const storeIds = Array.from(new Set((data ?? []).map((m) => m.store_id)));
    const { data: stores } = await sb.from("sb_stores")
      .select("id, store_name")
      .in("id", storeIds);
    const storeMap = new Map((stores ?? []).map((s) => [s.id, s.store_name]));

    // Resolve inviter emails
    const { data: authData } = await sb.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    for (const u of authData?.users ?? []) {
      emailMap.set(u.id, u.email ?? "");
    }

    const members = (data ?? []).map((m) => ({
      ...m,
      storeName: storeMap.get(m.store_id) ?? "",
      inviterEmail: emailMap.get(m.invited_by) ?? "",
    }));

    return NextResponse.json({ members });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
