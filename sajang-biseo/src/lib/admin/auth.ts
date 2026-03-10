import { createServerSupabaseClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "yaya01234@naver.com";

/** API Route에서 관리자 인증 확인 */
export async function verifyAdmin() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) return null;
    return user;
  } catch (err) {
    console.error("Admin auth error:", err);
    return null;
  }
}
