import { createServerSupabaseClient } from "@/lib/supabase/server";

/** API Route에서 관리자 인증 확인 */
export async function verifyAdmin() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
    if (!adminEmails.includes(user.email ?? "")) return null;
    return user;
  } catch (err) {
    console.error("Admin auth error:", err);
    return null;
  }
}
