import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser, getSubscribedUserIds } from "@/lib/push/sendPush";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Vercel Cron: 매일 21:00 KST (= 12:00 UTC)
 * 1) 마감 미입력 리마인더
 * 2) 발주 필요 알림
 * 3) 월요일: 주간 브리핑 알림
 */
export async function GET(request: Request) {
  // Vercel Cron 인증
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  // KST 기준 오늘 날짜
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const today = kstNow.toISOString().slice(0, 10);
  const dayOfWeek = kstNow.getDay(); // 0=일, 1=월, ...

  const subscribedUserIds = await getSubscribedUserIds();
  if (subscribedUserIds.length === 0) {
    return NextResponse.json({ message: "구독자 없음", sent: 0 });
  }

  let totalSent = 0;

  // ── 1) 마감 미입력 리마인더 ──
  for (const userId of subscribedUserIds) {
    try {
      // 유저의 매장 조회
      const { data: store } = await supabase
        .from("sb_stores")
        .select("id, store_name")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (!store) continue;

      // 오늘 마감 데이터 확인
      const { data: closing } = await supabase
        .from("sb_daily_closing")
        .select("id")
        .eq("store_id", store.id)
        .eq("date", today)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();

      if (!closing) {
        const sent = await sendPushToUser(userId, {
          title: "오늘 마감 입력을 잊으셨나요?",
          body: `${store.store_name} 매장의 오늘 매출을 기록해주세요.`,
          url: "/closing",
          tag: "closing-reminder",
        });
        totalSent += sent;
      }
    } catch {
      console.error("마감 리마인더 실패");
    }
  }

  // ── 2) 발주 필요 알림 ──
  for (const userId of subscribedUserIds) {
    try {
      const { data: store } = await supabase
        .from("sb_stores")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (!store) continue;

      // 활성 품목 수 확인
      const { count: itemCount } = await supabase
        .from("sb_order_items")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("is_active", true)
        .is("deleted_at", null);

      if (!itemCount || itemCount === 0) continue;

      // 내일 날짜
      const tomorrow = new Date(kstNow.getTime() + 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 10);

      // 내일 발주 이미 저장했는지 확인
      const { count: orderCount } = await supabase
        .from("sb_daily_orders")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("date", tomorrow);

      if (!orderCount || orderCount === 0) {
        const sent = await sendPushToUser(userId, {
          title: "내일 발주 확인하셨나요?",
          body: "AI 발주 추천을 확인하고 발주를 완료해보세요.",
          url: "/order",
          tag: "order-reminder",
        });
        totalSent += sent;
      }
    } catch {
      console.error("발주 알림 실패");
    }
  }

  // ── 3) 주간 브리핑 알림 (월요일만) ──
  if (dayOfWeek === 1) {
    for (const userId of subscribedUserIds) {
      try {
        const { data: store } = await supabase
          .from("sb_stores")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (!store) continue;

        // 지난주 마감 데이터 있는지 확인
        const lastMonday = new Date(kstNow.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString().slice(0, 10);
        const lastSunday = new Date(kstNow.getTime() - 1 * 24 * 60 * 60 * 1000)
          .toISOString().slice(0, 10);

        const { count: closingCount } = await supabase
          .from("sb_daily_closing")
          .select("id", { count: "exact", head: true })
          .eq("store_id", store.id)
          .gte("date", lastMonday)
          .lte("date", lastSunday)
          .is("deleted_at", null);

        if (closingCount && closingCount > 0) {
          const sent = await sendPushToUser(userId, {
            title: "주간 경영 브리핑이 준비되었습니다",
            body: "지난주 매출 분석과 AI 코칭을 확인해보세요.",
            url: "/briefing",
            tag: "briefing-weekly",
          });
          totalSent += sent;
        }
      } catch {
        console.error("브리핑 알림 실패");
      }
    }
  }

  return NextResponse.json({
    message: "Push notifications sent",
    sent: totalSent,
    subscribers: subscribedUserIds.length,
    date: today,
    isMonday: dayOfWeek === 1,
  });
}
