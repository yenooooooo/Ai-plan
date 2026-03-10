"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorRetry({ message = "데이터를 불러오지 못했습니다", onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertTriangle size={24} className="text-danger" />
      </div>
      <p className="text-body-small text-[var(--text-secondary)] text-center">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-caption font-medium
          bg-[var(--bg-tertiary)] text-primary-500 border border-primary-500/20
          hover:bg-primary-500/10 transition-colors duration-200"
      >
        <RefreshCw size={14} />
        다시 시도
      </button>
    </div>
  );
}
