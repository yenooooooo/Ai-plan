/** 대기 중 초대 조회 API */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ invitations: [] });

    const sb = createAdminClient();

    // 이메일 매칭으로 pending 초대 조회
    const { data: pending } = await sb
      .from("sb_team_members")
      .select("id, store_id, role, invited_by, created_at")
      .eq("email", user.email)
      .is("accepted_at", null);

    if (!pending || pending.length === 0) {
      return NextResponse.json({ invitations: [] });
    }

    // 매장 정보 조회
    const storeIds = pending.map((p) => p.store_id);
    const { data: stores } = await sb
      .from("sb_stores")
      .select("id, store_name")
      .in("id", storeIds)
      .is("deleted_at", null);

    // 초대자 이름 조회
    const inviterIds = Array.from(new Set(pending.map((p) => p.invited_by)));
    const { data: profiles } = await sb
      .from("sb_user_profiles")
      .select("id, display_name")
      .in("id", inviterIds);

    const storeMap = new Map((stores ?? []).map((s) => [s.id, s.store_name]));
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

    const invitations = pending
      .filter((p) => storeMap.has(p.store_id))
      .map((p) => ({
        id: p.id,
        storeId: p.store_id,
        storeName: storeMap.get(p.store_id) ?? "",
        role: p.role,
        inviterName: profileMap.get(p.invited_by) ?? "매장 관리자",
        createdAt: p.created_at,
      }));

    return NextResponse.json({ invitations });
  } catch {
    return NextResponse.json({ invitations: [] });
  }
}
