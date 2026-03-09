"use client";

import Link from "next/link";
import { TrendingUp, Settings } from "lucide-react";
import { FeeToggle } from "@/components/shared/FeeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-xl mx-auto">
        {/* 좌: 로고 */}
        <Link href="/closing" className="flex items-center gap-2">
          <span className="text-xl">🍳</span>
          <span className="font-body font-bold text-[var(--text-primary)] text-[15px] hidden sm:block">
            사장님비서
          </span>
        </Link>

        {/* 중: 수수료 토글 */}
        <FeeToggle />

        {/* 우: 메뉴 아이콘 */}
        <div className="flex items-center gap-1">
          <Link
            href="/briefing"
            className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <TrendingUp size={20} />
          </Link>
          <Link
            href="/settings"
            className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
