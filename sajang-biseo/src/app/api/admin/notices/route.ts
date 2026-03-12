import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const sb = createAdminClient();
    const { data, error } = await sb.from("sb_notices")
      .select("*").order("created_at", { ascending: false }).limit(50);
    // 테이블 미존재 시 빈 배열 반환
    if (error) {
      console.error("Notices load error:", error.message);
      return NextResponse.json({ notices: [] });
    }
    return NextResponse.json({ notices: data });
  } catch (err) {
    console.error("Notices GET error:", err);
    return NextResponse.json({ notices: [], error: "서버 오류" });
  }
}

export async function POST(request: Request) {
  try {
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
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ notice: data });
  } catch (err) {
    console.error("Notices POST error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });
    const sb = createAdminClient();
    const { error } = await sb.from("sb_notices")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notices PATCH error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });
    const sb = createAdminClient();
    const { error } = await sb.from("sb_notices").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notices DELETE error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
