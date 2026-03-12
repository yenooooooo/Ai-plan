/** 활동 로깅 유틸 (fire-and-forget) */
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, Json>,
): void {
  // Non-awaited, fire-and-forget
  const sb = createAdminClient();
  Promise.resolve(
    sb.from("sb_activity_logs")
      .insert({ user_id: userId, action, metadata: (metadata ?? {}) as Json })
  ).catch(() => {});
}
