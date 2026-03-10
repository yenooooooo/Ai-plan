import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const sb = createAdminClient();
  const { data, error } = await sb.from("sb_notices")
    .select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notices: data });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await request.json();
  const sb = createAdminClient();
  const { data, error } = await sb.from("sb_notices").insert({
    title: body.title,
    content: body.content,
    type: body.type ?? "info",
    link: body.link ?? null,
    is_active: body.is_active ?? true,
    priority: body.priority ?? 0,
    starts_at: body.starts_at ?? new Date().toISOString(),
    ends_at: body.ends_at ?? null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notice: data });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });
  const sb = createAdminClient();
  const { error } = await sb.from("sb_notices")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });
  const sb = createAdminClient();
  const { error } = await sb.from("sb_notices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
