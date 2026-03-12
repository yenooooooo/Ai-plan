/** 매장 접근 권한 체크 유틸리티 */

import { createAdminClient } from "@/lib/supabase/admin";

export type StoreRole = "owner" | "editor" | "viewer";

export interface AccessibleStore {
  id: string;
  storeName: string;
  businessType: string;
  role: StoreRole;
}

/** 유저가 접근 가능한 모든 매장 (소유 + 팀) 반환 */
export async function getUserAccessibleStores(
  userId: string,
  email: string,
): Promise<AccessibleStore[]> {
  const sb = createAdminClient();
  const stores: AccessibleStore[] = [];

  // 1) 소유 매장
  const { data: owned } = await sb
    .from("sb_stores")
    .select("id, store_name, business_type")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at");

  if (owned) {
    for (const s of owned) {
      stores.push({
        id: s.id,
        storeName: s.store_name,
        businessType: s.business_type,
        role: "owner",
      });
    }
  }

  // 2) 수락된 팀 매장
  const { data: teams } = await sb
    .from("sb_team_members")
    .select("store_id, role")
    .eq("email", email)
    .not("accepted_at", "is", null);

  if (teams && teams.length > 0) {
    const teamStoreIds = teams.map((t) => t.store_id);
    const { data: teamStores } = await sb
      .from("sb_stores")
      .select("id, store_name, business_type")
      .in("id", teamStoreIds)
      .is("deleted_at", null);

    if (teamStores) {
      for (const s of teamStores) {
        const membership = teams.find((t) => t.store_id === s.id);
        if (membership && !stores.some((x) => x.id === s.id)) {
          stores.push({
            id: s.id,
            storeName: s.store_name,
            businessType: s.business_type,
            role: membership.role as StoreRole,
          });
        }
      }
    }
  }

  return stores;
}

/** 특정 매장에 대한 유저 역할 반환 (접근 불가 시 null) */
export async function getStoreRole(
  userId: string,
  email: string,
  storeId: string,
): Promise<StoreRole | null> {
  const sb = createAdminClient();

  // 소유자 체크
  const { data: owned } = await sb
    .from("sb_stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (owned) return "owner";

  // 팀 멤버 체크
  const { data: team } = await sb
    .from("sb_team_members")
    .select("role")
    .eq("store_id", storeId)
    .eq("email", email)
    .not("accepted_at", "is", null)
    .maybeSingle();

  if (team) return team.role as StoreRole;

  return null;
}

/** 쓰기 권한 확인 (owner 또는 editor) */
export async function canWrite(
  userId: string,
  email: string,
  storeId: string,
): Promise<boolean> {
  const role = await getStoreRole(userId, email, storeId);
  return role === "owner" || role === "editor";
}
