/** 회원 탈퇴 API — 사용자 데이터 삭제 + auth.users 삭제 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const userId = user.id;

    // 사용자 관련 데이터 soft-delete 또는 hard-delete
    // 프로필, 매장 설정 등 정리
    const admin = createAdminClient();

    // 1) 사용자 프로필 삭제
    await admin.from("sb_user_profiles").delete().eq("id", userId);

    // 2) 매장 관련 데이터 삭제 (store_id 기반)
    const { data: stores } = await admin
      .from("sb_stores")
      .select("id")
      .eq("user_id", userId);

    if (stores && stores.length > 0) {
      const storeIds = stores.map((s) => s.id);
      // 종속 데이터 먼저 삭제
      await admin.from("sb_daily_closing_channels").delete().in("store_id", storeIds);
      await admin.from("sb_daily_closing").delete().in("store_id", storeIds);
      await admin.from("sb_receipts").delete().in("store_id", storeIds);
      await admin.from("sb_receipt_categories").delete().in("store_id", storeIds);
      await admin.from("sb_order_items").delete().in("store_id", storeIds);
      await admin.from("sb_order_item_groups").delete().in("store_id", storeIds);
      await admin.from("sb_order_recommendations").delete().in("store_id", storeIds);
      await admin.from("sb_daily_orders").delete().in("store_id", storeIds);
      await admin.from("sb_reviews").delete().in("store_id", storeIds);
      await admin.from("sb_review_replies").delete().in("store_id", storeIds);
      await admin.from("sb_store_tone_settings").delete().in("store_id", storeIds);
      await admin.from("sb_weekly_briefings").delete().in("store_id", storeIds);
      await admin.from("sb_fee_channels").delete().in("store_id", storeIds);
      await admin.from("sb_store_fee_settings").delete().in("store_id", storeIds);
      await admin.from("sb_team_members").delete().in("store_id", storeIds);
      await admin.from("sb_usage_logs").delete().in("store_id", storeIds);
      await admin.from("sb_stores").delete().in("id", storeIds);
    }

    // 3) auth.users에서 사용자 삭제
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Auth delete error:", deleteError);
      return NextResponse.json({ error: "계정 삭제 실패" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account delete error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
