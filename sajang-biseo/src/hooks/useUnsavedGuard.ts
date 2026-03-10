"use client";

import { useEffect, useRef } from "react";

/** beforeunload 이벤트로 미저장 데이터 이탈 경고 */
export function useUnsavedGuard(isDirty: boolean) {
  const ref = useRef(isDirty);
  ref.current = isDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!ref.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
}
