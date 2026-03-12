/** 코호트 분석 API */
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 86400000).toISOString().slice(0, 10);

    // Get users who signed up in the last 12 weeks
    const { data: profiles } = await sb.from("sb_user_profiles")
      .select("id, created_at")
      .gte("created_at", twelveWeeksAgo)
      .is("deleted_at", null);

    // Get all stores mapped to users
    const { data: stores } = await sb.from("sb_stores")
      .select("id, user_id")
      .is("deleted_at", null);

    const userStoreMap = new Map<string, string[]>();
    for (const s of stores ?? []) {
      const existing = userStoreMap.get(s.user_id) ?? [];
      existing.push(s.id);
      userStoreMap.set(s.user_id, existing);
    }

    // Get all closing dates in the last 12 weeks
    const { data: closings } = await sb.from("sb_daily_closing")
      .select("store_id, date")
      .gte("date", twelveWeeksAgo);

    // Build store → active weeks set
    const storeActiveWeeks = new Map<string, Set<string>>();
    for (const c of closings ?? []) {
      const week = getWeekStart(new Date(c.date));
      if (!storeActiveWeeks.has(c.store_id)) storeActiveWeeks.set(c.store_id, new Set());
      storeActiveWeeks.get(c.store_id)!.add(week);
    }

    // Group users by signup week
    const cohorts = new Map<string, { total: number; retention: Record<number, number> }>();

    for (const p of profiles ?? []) {
      const signupWeek = getWeekStart(new Date(p.created_at));
      if (!cohorts.has(signupWeek)) cohorts.set(signupWeek, { total: 0, retention: {} });
      const cohort = cohorts.get(signupWeek)!;
      cohort.total++;

      // Check retention at 1w, 2w, 4w, 8w offsets
      const userStores = userStoreMap.get(p.id) ?? [];
      for (const weekOffset of [1, 2, 4, 8]) {
        const targetWeekDate = new Date(new Date(signupWeek).getTime() + weekOffset * 7 * 86400000);
        if (targetWeekDate > new Date()) continue;
        const targetWeek = getWeekStart(targetWeekDate);

        const isActive = userStores.some((storeId) =>
          storeActiveWeeks.get(storeId)?.has(targetWeek) ?? false
        );
        if (isActive) {
          cohort.retention[weekOffset] = (cohort.retention[weekOffset] ?? 0) + 1;
        }
      }
    }

    // Convert to sorted array
    const result = Array.from(cohorts.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return NextResponse.json({ cohorts: result });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
