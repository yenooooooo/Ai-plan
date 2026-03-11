"use client";

import { Bell, BellOff } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";

export function NotificationSection() {
  const { supported, subscribed, loading, subscribe, unsubscribe } = usePushNotification();

  if (!supported) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-body-default font-medium text-[var(--text-primary)] mb-2">알림</h3>
        <p className="text-caption text-[var(--text-tertiary)]">
          이 브라우저는 푸시 알림을 지원하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-body-default font-medium text-[var(--text-primary)] mb-3">알림</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subscribed ? (
            <Bell size={18} className="text-primary-500" />
          ) : (
            <BellOff size={18} className="text-[var(--text-tertiary)]" />
          )}
          <div>
            <p className="text-body-small text-[var(--text-primary)]">
              {subscribed ? "알림 켜짐" : "알림 꺼짐"}
            </p>
            <p className="text-caption text-[var(--text-tertiary)]">
              마감 리마인더, 주간 브리핑 알림
            </p>
          </div>
        </div>
        <button
          onClick={subscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-body-small font-medium transition-colors press-effect disabled:opacity-50 ${
            subscribed
              ? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              : "bg-primary-500 text-white"
          }`}
        >
          {loading ? "..." : subscribed ? "끄기" : "켜기"}
        </button>
      </div>
    </div>
  );
}
