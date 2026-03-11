"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/stores/useToast";

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);
  const toast = useToast((s) => s.show);

  const handleOnline = useCallback(() => {
    setOnline(true);
    toast("인터넷 연결이 복구되었습니다", "success");
  }, [toast]);

  const handleOffline = useCallback(() => {
    setOnline(false);
    toast("인터넷 연결이 끊어졌습니다. 데이터는 로컬에 임시 저장됩니다.", "error");
  }, [toast]);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { online };
}
