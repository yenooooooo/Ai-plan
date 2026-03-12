/** 팀원 관리 API (Pro+ 전용) */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";
import { isValidUUID, isValidEmail } from "@/lib/security/validate";

export const dynamic = "force-dynamic";

/** 요청한 유저가 해당 storeId의 소유자인지 확인 */
async function verifyStoreOwner(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userId: string, storeId: string) {
  const { data } = await supabase
    .from("sb_stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });

    // 매장 소유권 확인
    const isOwner = await verifyStoreOwner(supabase, user.id, storeId);
    if (!isOwner) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const { data, error } = await sb.from("sb_team_members")
      .select("*").eq("store_id", storeId).order("created_at");

    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ members: data ?? [] });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const plan = await getUserPlan(user.id);
    const limits = getPlanLimits(plan);
    if (limits.teamMembers <= 0) {
      return NextResponse.json(
        { error: "직원 계정은 Pro+ 플랜부터 사용 가능합니다.", limitReached: true },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { storeId, email, role } = body;
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "이메일 형식 오류" }, { status: 400 });

    // 매장 소유권 확인
    const isOwner = await verifyStoreOwner(supabase, user.id, storeId);
    if (!isOwner) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const { count } = await sb.from("sb_team_members")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId);

    if ((count ?? 0) >= limits.teamMembers) {
      return NextResponse.json(
        { error: `매장당 최대 ${limits.teamMembers}명까지 초대 가능합니다.` },
        { status: 429 }
      );
    }

    const { data, error } = await sb.from("sb_team_members").insert({
      store_id: storeId,
      email,
      role: role ?? "viewer",
      invited_by: user.id,
    }).select().single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "이미 초대된 이메일입니다." }, { status: 409 });
      return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
    return NextResponse.json({ member: data });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!isValidUUID(id)) return NextResponse.json({ error: "ID 형식 오류" }, { status: 400 });

    const sb = createAdminClient();

    // 삭제 전 팀원이 본인 매장 소속인지 확인
    const { data: member } = await sb.from("sb_team_members")
      .select("store_id").eq("id", id).maybeSingle();
    if (!member) return NextResponse.json({ error: "팀원 없음" }, { status: 404 });

    const isOwner = await verifyStoreOwner(supabase, user.id, member.store_id);
    if (!isOwner) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { error } = await sb.from("sb_team_members").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
