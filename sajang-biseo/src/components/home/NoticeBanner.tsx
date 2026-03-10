"use client";

import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";

interface NoticeData {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "update" | "maintenance";
  link: string | null;
}

const TYPE_CONFIG = {
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
  warning: { icon: AlertTriangle, bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-500" },
  update: { icon: Sparkles, bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-500" },
  maintenance: { icon: Wrench, bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-500" },
};

const DISMISSED_KEY = "sajang-dismissed-notices";

function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"); }
  catch { return []; }
}

export function NoticeBanner({ notices }: { notices: NoticeData[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setDismissed(getDismissed()); }, []);

  if (!mounted) return null;

  const visible = notices.filter((n) => !dismissed.includes(n.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-2">
      {visible.map((n) => {
        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
        const Icon = cfg.icon;
        const inner = (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
            <Icon size={16} className={`${cfg.text} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-body-small font-medium text-[var(--text-primary)]">{n.title}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.content}</p>
            </div>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
              className="shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors">
              <X size={14} className="text-[var(--text-tertiary)]" />
            </button>
          </div>
        );

        return n.link ? (
          <Link key={n.id} href={n.link} className="block press-effect">{inner}</Link>
        ) : (
          <div key={n.id}>{inner}</div>
        );
      })}
    </div>
  );
}
