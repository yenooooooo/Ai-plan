/** 팀원 관리 API (Pro+ 전용) */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPlan } from "@/lib/usage";
import { getPlanLimits } from "@/lib/plan";
import { isValidUUID, isValidEmail } from "@/lib/security/validate";
import { sendInvitationEmail } from "@/lib/team/email";

export const dynamic = "force-dynamic";

async function verifyStoreOwner(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string, storeId: string) {
  const { data } = await supabase
    .from("sb_stores").select("id")
    .eq("id", storeId).eq("user_id", userId).maybeSingle();
  return !!data;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const storeId = new URL(req.url).searchParams.get("storeId");
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });

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
      return NextResponse.json({ error: "직원 계정은 Pro+ 플랜부터 사용 가능합니다.", limitReached: true }, { status: 429 });
    }

    const body = await req.json();
    const { storeId, email, role } = body;
    if (!isValidUUID(storeId)) return NextResponse.json({ error: "매장 ID 형식 오류" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "이메일 형식 오류" }, { status: 400 });

    // 자기 자신 초대 방지
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: "본인은 초대할 수 없습니다." }, { status: 400 });
    }

    const isOwner = await verifyStoreOwner(supabase, user.id, storeId);
    if (!isOwner) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const { count } = await sb.from("sb_team_members")
      .select("id", { count: "exact", head: true }).eq("store_id", storeId);

    if ((count ?? 0) >= limits.teamMembers) {
      return NextResponse.json({ error: `매장당 최대 ${limits.teamMembers}명까지 초대 가능합니다.` }, { status: 429 });
    }

    const { data, error } = await sb.from("sb_team_members").insert({
      store_id: storeId, email, role: role ?? "viewer", invited_by: user.id,
    }).select().single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "이미 초대된 이메일입니다." }, { status: 409 });
      return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }

    // 초대 이메일 발송 (실패해도 초대 자체는 성공)
    const { data: store } = await sb.from("sb_stores").select("store_name").eq("id", storeId).single();
    const { data: profile } = await sb.from("sb_user_profiles").select("display_name").eq("id", user.id).single();

    const emailResult = await sendInvitationEmail({
      email,
      storeName: store?.store_name ?? "매장",
      inviterName: profile?.display_name ?? "매장 관리자",
      role: role ?? "viewer",
    });

    return NextResponse.json({ member: data, emailSent: emailResult.success });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const body = await req.json();
    const { action, id, role } = body;
    if (!isValidUUID(id)) return NextResponse.json({ error: "ID 형식 오류" }, { status: 400 });

    const sb = createAdminClient();
    const { data: member } = await sb.from("sb_team_members")
      .select("*").eq("id", id).maybeSingle();
    if (!member) return NextResponse.json({ error: "팀원 없음" }, { status: 404 });

    if (action === "accept") {
      // 본인 이메일과 매칭되는 초대만 수락 가능
      if (member.email.toLowerCase() !== user.email?.toLowerCase()) {
        return NextResponse.json({ error: "권한 없음" }, { status: 403 });
      }
      if (member.accepted_at) {
        return NextResponse.json({ error: "이미 수락된 초대입니다." }, { status: 400 });
      }
      const { error } = await sb.from("sb_team_members")
        .update({ accepted_at: new Date().toISOString() }).eq("id", id);
      if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // role 변경, resend — owner만 가능
    const isOwner = await verifyStoreOwner(supabase, user.id, member.store_id);
    if (!isOwner) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    if (action === "role") {
      if (role !== "viewer" && role !== "editor") {
        return NextResponse.json({ error: "유효하지 않은 역할" }, { status: 400 });
      }
      const { error } = await sb.from("sb_team_members").update({ role }).eq("id", id);
      if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === "resend") {
      const { data: store } = await sb.from("sb_stores").select("store_name").eq("id", member.store_id).single();
      const { data: profile } = await sb.from("sb_user_profiles").select("display_name").eq("id", user.id).single();
      const result = await sendInvitationEmail({
        email: member.email,
        storeName: store?.store_name ?? "매장",
        inviterName: profile?.display_name ?? "매장 관리자",
        role: member.role as "viewer" | "editor",
      });
      return NextResponse.json({ success: result.success, error: result.error });
    }

    return NextResponse.json({ error: "유효하지 않은 액션" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!isValidUUID(id)) return NextResponse.json({ error: "ID 형식 오류" }, { status: 400 });

    const sb = createAdminClient();
    const { data: member } = await sb.from("sb_team_members")
      .select("store_id, email").eq("id", id).maybeSingle();
    if (!member) return NextResponse.json({ error: "팀원 없음" }, { status: 404 });

    // 소유자이거나 본인(초대받은 사람)이면 삭제 가능
    const isOwner = await verifyStoreOwner(supabase, user.id, member.store_id);
    const isSelf = member.email.toLowerCase() === user.email?.toLowerCase();
    if (!isOwner && !isSelf) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { error } = await sb.from("sb_team_members").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
