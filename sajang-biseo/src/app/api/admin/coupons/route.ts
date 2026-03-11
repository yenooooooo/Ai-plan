/** 관리자 쿠폰 관리 API */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// 쿠폰 목록 조회
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("sb_coupons")
    .select("*, sb_coupon_uses(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

// 쿠폰 생성
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { code, plan, duration_days, max_uses, expires_at } = body;

  if (!code?.trim() || !plan || !duration_days) {
    return NextResponse.json({ error: "코드, 플랜, 기간은 필수입니다." }, { status: 400 });
  }
  if (!["pro", "pro_plus"].includes(plan)) {
    return NextResponse.json({ error: "플랜은 pro 또는 pro_plus만 가능합니다." }, { status: 400 });
  }

  const sb = createAdminClient();
  const { data, error } = await sb.from("sb_coupons").insert({
    code: code.trim().toUpperCase(),
    plan,
    duration_days: Number(duration_days),
    max_uses: Number(max_uses) || 1,
    expires_at: expires_at || null,
  }).select().single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "이미 존재하는 쿠폰 코드입니다." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ coupon: data });
}

// 쿠폰 비활성화 / 삭제
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

  const sb = createAdminClient();
  // 사용 기록이 있으면 비활성화, 없으면 삭제
  const { count } = await sb
    .from("sb_coupon_uses")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", id);

  if ((count ?? 0) > 0) {
    const { error } = await sb.from("sb_coupons").update({ is_active: false }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "deactivated" });
  } else {
    const { error } = await sb.from("sb_coupons").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "deleted" });
  }
}
