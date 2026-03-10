"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useThemeStore, type ThemeMode } from "@/stores/useThemeStore";

const THEMES: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "system", label: "시스템", icon: Monitor },
  { mode: "light", label: "라이트", icon: Sun },
  { mode: "dark", label: "다크", icon: Moon },
];

export function ThemeSection() {
  const { mode, setMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">테마</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map(({ mode: m, label, icon: Icon }) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`h-10 rounded-xl flex items-center justify-center gap-1.5 text-body-small font-medium transition-all press-effect ${
              mode === m
                ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
