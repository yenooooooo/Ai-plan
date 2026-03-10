"use client";

import { useState } from "react";
import { BarChart3, Users, Bell } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminNotices } from "@/components/admin/AdminNotices";

type Tab = "dashboard" | "users" | "notices";
const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "dashboard", label: "대시보드", icon: BarChart3 },
  { key: "users", label: "사용자", icon: Users },
  { key: "notices", label: "공지사항", icon: Bell },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="space-y-5">
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
              tab === key ? "bg-[var(--bg-elevated)] text-red-500 shadow-sm" : "text-[var(--text-tertiary)]"
            }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <AdminDashboard />}
      {tab === "users" && <AdminUsers />}
      {tab === "notices" && <AdminNotices />}
    </div>
  );
}
