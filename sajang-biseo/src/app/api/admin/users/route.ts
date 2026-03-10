import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const sb = createAdminClient();

    const { data: { users }, error } = await sb.auth.admin.listUsers({ perPage: 100 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let filtered = users ?? [];
    if (search) {
      filtered = filtered.filter((u) =>
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const userIds = filtered.map((u) => u.id);
    const safeIds = userIds.length > 0 ? userIds : ["_none_"];

    const [storesData, profilesData, closingsData] = await Promise.all([
      sb.from("sb_stores").select("id, user_id, store_name").in("user_id", safeIds),
      sb.from("sb_user_profiles").select("id, onboarding_complete, plan, created_at").in("id", safeIds),
      sb.from("sb_daily_closing").select("store_id"),
    ]);

    const stores = storesData.data ?? [];
    const profiles = profilesData.data ?? [];
    const closingCountMap: Record<string, number> = {};
    (closingsData.data ?? []).forEach((c) => {
      closingCountMap[c.store_id] = (closingCountMap[c.store_id] ?? 0) + 1;
    });

    const result = filtered.map((u) => {
      const profile = profiles.find((p) => p.id === u.id);
      const userStores = stores.filter((s) => s.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
        onboardingComplete: profile?.onboarding_complete ?? false,
        plan: (profile as { plan?: string } | undefined)?.plan ?? "free",
        stores: userStores.map((s) => ({
          id: s.id,
          name: s.store_name,
          closingCount: closingCountMap[s.id] ?? 0,
        })),
      };
    });

    return NextResponse.json({ users: result });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "서버 오류", detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const body = await request.json();
    const { userId, plan } = body;
    if (!userId || !plan) return NextResponse.json({ error: "userId, plan 필요" }, { status: 400 });

    const sb = createAdminClient();
    const { error } = await sb.from("sb_user_profiles")
      .update({ plan, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin plan update error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
