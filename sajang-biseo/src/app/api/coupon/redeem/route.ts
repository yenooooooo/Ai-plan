/** 쿠폰 사용 API */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { code } = await req.json();
    if (!code?.trim()) return NextResponse.json({ error: "쿠폰 코드를 입력해주세요." }, { status: 400 });

    const sb = createAdminClient();
    const now = new Date();

    // 쿠폰 조회
    const { data: coupon } = await sb
      .from("sb_coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!coupon) return NextResponse.json({ error: "유효하지 않은 쿠폰 코드입니다." }, { status: 404 });

    // 쿠폰 자체 만료일 체크
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: "만료된 쿠폰입니다." }, { status: 400 });
    }

    // 최대 사용 횟수 체크
    if (coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: "이미 모두 사용된 쿠폰입니다." }, { status: 400 });
    }

    // 중복 사용 체크
    const { data: alreadyUsed } = await sb
      .from("sb_coupon_uses")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (alreadyUsed) return NextResponse.json({ error: "이미 사용한 쿠폰입니다." }, { status: 409 });

    // 플랜 만료일 계산
    const planExpiresAt = new Date(now.getTime() + coupon.duration_days * 86400 * 1000).toISOString();

    // 트랜잭션처럼 순차 처리
    // 1) 사용자 플랜 업데이트
    const { error: profileErr } = await sb
      .from("sb_user_profiles")
      .update({ plan: coupon.plan, plan_expires_at: planExpiresAt, updated_at: now.toISOString() })
      .eq("id", user.id);
    if (profileErr) throw profileErr;

    // 2) 사용 기록 저장
    const { error: useErr } = await sb.from("sb_coupon_uses").insert({
      coupon_id: coupon.id,
      user_id: user.id,
      plan_expires_at: planExpiresAt,
    });
    if (useErr) throw useErr;

    // 3) 사용 횟수 증가
    const { error: countErr } = await sb
      .from("sb_coupons")
      .update({ used_count: coupon.used_count + 1, updated_at: now.toISOString() })
      .eq("id", coupon.id);
    if (countErr) throw countErr;

    return NextResponse.json({
      success: true,
      plan: coupon.plan,
      planExpiresAt,
      durationDays: coupon.duration_days,
    });
  } catch (err) {
    console.error("Coupon redeem error:", err);
    return NextResponse.json({ error: "쿠폰 적용 중 오류가 발생했습니다." }, { status: 500 });
  }
}
