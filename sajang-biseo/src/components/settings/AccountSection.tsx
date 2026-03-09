"use client";

import { useState } from "react";
import { User, LogOut } from "lucide-react";

interface AccountSectionProps {
  email: string;
  onLogout: () => Promise<void>;
}

export function AccountSection({ email, onLogout }: AccountSectionProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    setLoggingOut(true);
    await onLogout();
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <User size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">계정</h3>
      </div>

      <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
        <span className="text-body-small text-[var(--text-secondary)]">이메일</span>
        <span className="text-body-small font-display text-[var(--text-primary)]">
          {email || "불러오는 중..."}
        </span>
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className={`w-full h-10 rounded-xl text-body-small font-medium flex items-center justify-center gap-2 transition-all duration-200
          ${confirmLogout
            ? "bg-[var(--danger)] text-white"
            : "bg-[var(--bg-tertiary)] text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/10"
          } disabled:opacity-50`}
      >
        <LogOut size={15} />
        {loggingOut ? "로그아웃 중..." : confirmLogout ? "한 번 더 눌러서 로그아웃" : "로그아웃"}
      </button>
    </div>
  );
}
