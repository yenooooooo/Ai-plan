/** 매장 추가 API — 플랜별 매장 수 제한 적용 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkStoreLimit } from "@/lib/usage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const limitError = await checkStoreLimit(user.id);
    if (limitError) {
      return NextResponse.json({ error: limitError, limitReached: true }, { status: 429 });
    }

    const body = await req.json();
    const { data: store, error } = await supabase
      .from("sb_stores")
      .insert({
        user_id: user.id,
        store_name: body.store_name,
        business_type: body.business_type,
      })
      .select("id, store_name, business_type")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ store });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
