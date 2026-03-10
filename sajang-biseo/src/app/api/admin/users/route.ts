import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const sb = createAdminClient();

  // Get all users from auth
  const { data: { users }, error } = await sb.auth.admin.listUsers({ perPage: 100 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let filtered = users ?? [];
  if (search) {
    filtered = filtered.filter((u) =>
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Get stores for these users
  const userIds = filtered.map((u) => u.id);
  const { data: stores } = await sb.from("sb_stores").select("id, user_id, store_name").in("user_id", userIds.length > 0 ? userIds : ["_none_"]);

  // Get profiles
  const { data: profiles } = await sb.from("sb_user_profiles").select("id, onboarding_complete, created_at").in("id", userIds.length > 0 ? userIds : ["_none_"]);

  // Get closing counts per store
  const storeIds = (stores ?? []).map((s) => s.id);
  const { data: closings } = await sb.from("sb_daily_closing").select("store_id").in("store_id", storeIds.length > 0 ? storeIds : ["_none_"]);

  const closingCountMap: Record<string, number> = {};
  (closings ?? []).forEach((c) => { closingCountMap[c.store_id] = (closingCountMap[c.store_id] ?? 0) + 1; });

  const result = filtered.map((u) => {
    const profile = (profiles ?? []).find((p) => p.id === u.id);
    const userStores = (stores ?? []).filter((s) => s.user_id === u.id);
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
}
