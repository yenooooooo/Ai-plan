"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error.digest ?? "unknown");
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <h2 className="text-body-default font-semibold text-[var(--text-primary)]">
          예상치 못한 오류가 발생했습니다
        </h2>
        <p className="text-caption text-[var(--text-secondary)]">
          잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect"
        >
          <RotateCcw size={14} />
          다시 시도
        </button>
      </div>
    </div>
  );
}
