/** 팀 매장 나가기 API */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/security/validate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { storeId } = await req.json();
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });

    const sb = createAdminClient();
    const { data: member } = await sb.from("sb_team_members")
      .select("id")
      .eq("store_id", storeId)
      .eq("email", user.email)
      .maybeSingle();

    if (!member) return NextResponse.json({ error: "멤버십 없음" }, { status: 404 });

    const { error } = await sb.from("sb_team_members").delete().eq("id", member.id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
