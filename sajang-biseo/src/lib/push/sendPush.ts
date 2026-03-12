import webPush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured");
  }
  webPush.setVapidDetails("mailto:support@sajang-biseo.com", publicKey, privateKey);
  vapidConfigured = true;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * 특정 유저에게 푸시 알림 발송
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureVapid();
  const supabase = createAdminClient();

  const { data: subs } = await supabase
    .from("sb_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!subs || subs.length === 0) return 0;

  let sent = 0;
  for (const sub of subs) {
    if (!sub.endpoint || !sub.p256dh || !sub.auth) continue;

    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      // 410 Gone 또는 404 — 구독 만료/삭제됨
      if (statusCode === 410 || statusCode === 404) {
        await supabase
          .from("sb_push_subscriptions")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", sub.id);
      }
      console.error(`Push failed for ${sub.endpoint}:`, err);
    }
  }
  return sent;
}

/**
 * 모든 활성 구독 유저 목록 반환
 */
export async function getSubscribedUserIds(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sb_push_subscriptions")
    .select("user_id")
    .eq("is_active", true);

  if (!data) return [];
  // 중복 제거
  return Array.from(new Set(data.map((d) => d.user_id)));
}
