"use client";

import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineIndicator() {
  const { online } = useNetworkStatus();

  if (online) return null;

  return (
    <div className="fixed top-14 inset-x-0 z-50 bg-warning/90 text-white text-center py-1.5 text-caption font-medium flex items-center justify-center gap-1.5">
      <WifiOff size={14} />
      오프라인 — 데이터가 로컬에 임시 저장됩니다
    </div>
  );
}
