import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id: storeId } = await params;
  const sb = createAdminClient();

  const [storeRes, closingsRes, receiptsRes, reviewsRes, deletedClosingsRes, deletedReceiptsRes, deletedChannelsRes] =
    await Promise.all([
      sb.from("sb_stores").select("*").eq("id", storeId).maybeSingle(),
      sb.from("sb_daily_closing").select("id, date, total_sales, total_fees, net_sales, memo")
        .eq("store_id", storeId).is("deleted_at", null).order("date", { ascending: false }).limit(30),
      sb.from("sb_receipts").select("id, date, merchant_name, total_amount, category_id")
        .eq("store_id", storeId).is("deleted_at", null).order("date", { ascending: false }).limit(20),
      sb.from("sb_reviews").select("id, platform, rating, content, reply_status")
        .eq("store_id", storeId).is("deleted_at", null).order("created_at", { ascending: false }).limit(20),
      sb.from("sb_daily_closing").select("id, date, total_sales, deleted_at")
        .eq("store_id", storeId).not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(20),
      sb.from("sb_receipts").select("id, date, merchant_name, total_amount, deleted_at")
        .eq("store_id", storeId).not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(20),
      sb.from("sb_fee_channels").select("id, channel_name, deleted_at")
        .eq("store_id", storeId).not("deleted_at", "is", null),
    ]);

  return NextResponse.json({
    store: storeRes.data,
    closings: closingsRes.data ?? [],
    receipts: receiptsRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    deleted: {
      closings: deletedClosingsRes.data ?? [],
      receipts: deletedReceiptsRes.data ?? [],
      channels: deletedChannelsRes.data ?? [],
    },
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id: storeId } = await params;
  const body = await req.json();
  const { action, table, recordId } = body as { action: string; table: string; recordId: string };

  if (action !== "restore" || !table || !recordId) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const allowedTables = ["sb_daily_closing", "sb_receipts", "sb_fee_channels", "sb_reviews"] as const;
  if (!allowedTables.includes(table as typeof allowedTables[number])) {
    return NextResponse.json({ error: "허용되지 않는 테이블" }, { status: 400 });
  }

  const sb = createAdminClient();
  const validTable = table as "sb_daily_closing" | "sb_receipts" | "sb_fee_channels" | "sb_reviews";
  const { error } = await sb.from(validTable)
    .update({ deleted_at: null } as Record<string, unknown>)
    .eq("id", recordId)
    .eq("store_id", storeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
