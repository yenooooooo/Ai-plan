/** 매출/구독 현황 API */
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Price tiers for MRR calculation (won/month)
const PLAN_PRICES: Record<string, number> = {
  pro: 9900,
  pro_plus: 19900,
};

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const now = new Date();
    const monthStart = now.toISOString().slice(0, 7) + "-01";

    // Plan distribution
    const { data: profiles } = await sb.from("sb_user_profiles")
      .select("plan").is("deleted_at", null);

    const distribution: Record<string, number> = { free: 0, pro: 0, pro_plus: 0 };
    for (const p of profiles ?? []) {
      distribution[p.plan] = (distribution[p.plan] ?? 0) + 1;
    }

    // MRR
    const mrr = (distribution.pro ?? 0) * PLAN_PRICES.pro +
                (distribution.pro_plus ?? 0) * PLAN_PRICES.pro_plus;

    // Churn (users downgraded this month - plan_expires_at in this month, now free)
    const { data: churned } = await sb.from("sb_user_profiles")
      .select("id, display_name, plan, updated_at")
      .eq("plan", "free")
      .gte("updated_at", monthStart)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(50);

    // Coupon stats
    const { data: coupons } = await sb.from("sb_coupons")
      .select("id, code, plan, max_uses, is_active");
    const { data: couponUses } = await sb.from("sb_coupon_uses")
      .select("coupon_id");

    const couponStats = (coupons ?? []).map((c) => ({
      code: c.code,
      plan: c.plan,
      maxUses: c.max_uses,
      usedCount: (couponUses ?? []).filter((u) => u.coupon_id === c.id).length,
      isActive: c.is_active,
    }));

    return NextResponse.json({
      distribution,
      mrr,
      totalPaid: (distribution.pro ?? 0) + (distribution.pro_plus ?? 0),
      churned: churned ?? [],
      couponStats,
    });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
