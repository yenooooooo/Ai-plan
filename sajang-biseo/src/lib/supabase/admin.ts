import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service Role 클라이언트 (서버 전용)
 * RLS를 우회하므로 API Routes / Server Actions에서만 사용
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
