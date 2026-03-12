/** 사용자 문의 API */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const sb = createAdminClient();
    const { data } = await sb.from("sb_support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ tickets: data ?? [] });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { category, subject, message, storeId } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요" }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data, error } = await sb.from("sb_support_tickets").insert({
      user_id: user.id,
      store_id: storeId || null,
      category: category || "general",
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 2000),
    }).select().single();

    if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    return NextResponse.json({ ticket: data });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
