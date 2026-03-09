"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BarChart3,
  Package,
  Receipt,
  MessageSquare,
} from "lucide-react";

const ICON_MAP = {
  Home,
  BarChart3,
  Package,
  Receipt,
  MessageSquare,
} as const;

const TABS = [
  { key: "home", label: "홈", icon: "Home" as const, href: "/home" },
  { key: "closing", label: "마감", icon: "BarChart3" as const, href: "/closing" },
  { key: "order", label: "발주", icon: "Package" as const, href: "/order" },
  { key: "receipt", label: "장부", icon: "Receipt" as const, href: "/receipt" },
  { key: "review", label: "리뷰", icon: "MessageSquare" as const, href: "/review" },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/home" && pathname === "/") return true;
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] safe-bottom lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {TABS.map((tab) => {
          const Icon = ICON_MAP[tab.icon];
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-3 right-3 h-0.5 bg-primary-500 rounded-full"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  active
                    ? "text-primary-500"
                    : "text-[var(--text-tertiary)]"
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors duration-200 ${
                  active
                    ? "text-primary-500"
                    : "text-[var(--text-tertiary)]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
