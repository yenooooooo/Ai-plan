"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Package,
  Receipt,
  MessageSquare,
  TrendingUp,
  CircleDollarSign,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { label: "마감", icon: BarChart3, href: "/closing" },
  { label: "발주", icon: Package, href: "/order" },
  { label: "장부", icon: Receipt, href: "/receipt" },
  { label: "리뷰", icon: MessageSquare, href: "/review" },
];

const SUB_ITEMS = [
  { label: "브리핑", icon: TrendingUp, href: "/briefing" },
  { label: "수수료", icon: CircleDollarSign, href: "/fees" },
  { label: "설정", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-screen sticky top-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
      {/* 로고 */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--border-subtle)]">
        <span className="text-2xl">🍳</span>
        <span className="font-body font-bold text-[var(--text-primary)] text-[17px]">
          사장님비서
        </span>
      </div>

      {/* 메인 네비 */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-3 px-3 h-11 rounded-xl
                  text-[15px] font-medium transition-colors duration-200
                  ${
                    active
                      ? "text-primary-500"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    className="absolute inset-0 bg-primary-500/10 rounded-xl"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 구분선 */}
        <div className="h-px bg-[var(--border-subtle)] my-4 mx-2" />

        {/* 서브 네비 */}
        <div className="space-y-1">
          {SUB_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-3 px-3 h-11 rounded-xl
                  text-[15px] font-medium transition-colors duration-200
                  ${
                    active
                      ? "text-primary-500"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    className="absolute inset-0 bg-primary-500/10 rounded-xl"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 pb-4">
        <form action={signOut}>
          <button
            type="submit"
            className="
              flex items-center gap-3 px-3 h-11 w-full rounded-xl
              text-[15px] font-medium text-[var(--text-tertiary)]
              hover:text-danger hover:bg-danger/5
              transition-colors duration-200
            "
          >
            <LogOut size={20} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
