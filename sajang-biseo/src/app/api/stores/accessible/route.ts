/** 소유 + 팀 매장 통합 조회 API */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserAccessibleStores } from "@/lib/team/access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ stores: [] });

    const stores = await getUserAccessibleStores(user.id, user.email);
    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json({ stores: [] });
  }
}
