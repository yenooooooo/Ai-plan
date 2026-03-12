/** 기능별 사용량 히트맵 API */
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data: logs } = await sb.from("sb_activity_logs")
      .select("action, created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at");

    // Build daily counts per action
    const matrix: Record<string, Record<string, number>> = {};
    for (const log of logs ?? []) {
      const date = log.created_at.slice(0, 10);
      if (!matrix[date]) matrix[date] = {};
      matrix[date][log.action] = (matrix[date][log.action] ?? 0) + 1;
    }

    // Also query sb_daily_closing counts by date for last 30 days
    const { data: closings } = await sb.from("sb_daily_closing")
      .select("date")
      .gte("date", thirtyDaysAgo.slice(0, 10));

    for (const c of closings ?? []) {
      if (!matrix[c.date]) matrix[c.date] = {};
      matrix[c.date]["closing_save"] = (matrix[c.date]["closing_save"] ?? 0) + 1;
    }

    // Generate date list for last 30 days
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    }

    const actions = ["closing_save", "receipt_ocr", "review_generate", "order_save", "briefing_view"];

    const heatmap = dates.map((date) => {
      const row: Record<string, number> = { date: 0 };
      // Store date as a separate field handled in client
      for (const action of actions) {
        row[action] = matrix[date]?.[action] ?? 0;
      }
      return { date, ...row };
    });

    return NextResponse.json({ heatmap, actions, dates });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
