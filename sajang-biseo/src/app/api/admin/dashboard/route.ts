import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const sb = createAdminClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10);

  const [usersRes, storesRes, todayClosingRes, weekClosingRes, profilesRes, receiptsRes, reviewsRes, ordersRes, briefingsRes] =
    await Promise.all([
      sb.from("sb_user_profiles").select("id, onboarding_complete, created_at"),
      sb.from("sb_stores").select("id, user_id, store_name, created_at").is("deleted_at", null),
      sb.from("sb_daily_closing").select("store_id").eq("date", today),
      sb.from("sb_daily_closing").select("store_id, date").gte("date", weekAgo),
      sb.from("sb_user_profiles").select("id, created_at").gte("created_at", weekAgo),
      sb.from("sb_receipts").select("store_id").is("deleted_at", null),
      sb.from("sb_reviews").select("store_id").is("deleted_at", null),
      sb.from("sb_daily_orders").select("store_id"),
      sb.from("sb_weekly_briefings").select("store_id"),
    ]);

  const users = usersRes.data ?? [];
  const stores = storesRes.data ?? [];
  const todayClosings = todayClosingRes.data ?? [];
  const weekClosings = weekClosingRes.data ?? [];
  const newSignups = profilesRes.data ?? [];

  // Active store IDs (closing in last 7 days)
  const activeStoreIds = new Set((weekClosings).map((c) => c.store_id));

  // Stores with at least 1 closing ever
  const allClosingStoreRes = await sb.from("sb_daily_closing").select("store_id");
  const closingStoreIds = new Set((allClosingStoreRes.data ?? []).map((c) => c.store_id));

  // Funnel
  const totalSignups = users.length;
  const onboardingDone = users.filter((u) => u.onboarding_complete).length;
  const storeCreated = stores.length;
  const firstClosing = stores.filter((s) => closingStoreIds.has(s.id)).length;
  const retained = stores.filter((s) => activeStoreIds.has(s.id)).length;

  // Retention alerts: stores with closing history but none in last 3 days
  const recentRes = await sb.from("sb_daily_closing").select("store_id").gte("date", threeDaysAgo);
  const recentActiveIds = new Set((recentRes.data ?? []).map((c) => c.store_id));
  const atRiskStores = stores.filter((s) => closingStoreIds.has(s.id) && !recentActiveIds.has(s.id));

  // Feature usage per store
  const featureUsage = {
    closing: (allClosingStoreRes.data ?? []).length,
    receipt: (receiptsRes.data ?? []).length,
    review: (reviewsRes.data ?? []).length,
    order: (ordersRes.data ?? []).length,
    briefing: (briefingsRes.data ?? []).length,
  };

  // Unique store counts per feature
  const uniqueFeature = {
    closing: closingStoreIds.size,
    receipt: new Set((receiptsRes.data ?? []).map((r) => r.store_id)).size,
    review: new Set((reviewsRes.data ?? []).map((r) => r.store_id)).size,
    order: new Set((ordersRes.data ?? []).map((r) => r.store_id)).size,
    briefing: new Set((briefingsRes.data ?? []).map((r) => r.store_id)).size,
  };

  return NextResponse.json({
    stats: {
      totalUsers: totalSignups,
      totalStores: storeCreated,
      activeToday: todayClosings.length,
      newSignupsWeek: newSignups.length,
    },
    funnel: { totalSignups, onboardingDone, storeCreated, firstClosing, retained },
    retention: {
      atRiskStores: atRiskStores.map((s) => ({ id: s.id, storeName: s.store_name, userId: s.user_id })),
      atRiskCount: atRiskStores.length,
    },
    featureUsage,
    uniqueFeature,
    totalStores: storeCreated,
  });
}
