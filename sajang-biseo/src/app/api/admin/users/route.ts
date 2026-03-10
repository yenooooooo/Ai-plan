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
      sb.from("sb_user_profiles").select("id, onboarding_complete, created_at").in("id", safeIds),
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
