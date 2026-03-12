"use client";

import { useState } from "react";
import {
  BarChart3, Users, Bell, Ticket, DollarSign, Activity,
  MessageSquare, Send, UsersRound, GitBranch, Flame,
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminNotices } from "@/components/admin/AdminNotices";
import { AdminCoupons } from "@/components/admin/AdminCoupons";
import { AdminRevenue } from "@/components/admin/AdminRevenue";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { AdminTickets } from "@/components/admin/AdminTickets";
import { AdminPush } from "@/components/admin/AdminPush";
import { AdminTeams } from "@/components/admin/AdminTeams";
import { AdminCohort } from "@/components/admin/AdminCohort";
import { AdminFeatureHeatmap } from "@/components/admin/AdminFeatureHeatmap";

type Tab =
  | "dashboard" | "revenue" | "activity"
  | "users" | "notices" | "coupons" | "tickets" | "push"
  | "teams" | "cohort" | "heatmap";

interface TabGroup {
  label: string;
  tabs: { key: Tab; label: string; icon: typeof BarChart3 }[];
}

const GROUPS: TabGroup[] = [
  {
    label: "현황",
    tabs: [
      { key: "dashboard", label: "대시보드", icon: BarChart3 },
      { key: "revenue", label: "매출·구독", icon: DollarSign },
      { key: "activity", label: "활동로그", icon: Activity },
    ],
  },
  {
    label: "관리",
    tabs: [
      { key: "users", label: "사용자", icon: Users },
      { key: "notices", label: "공지사항", icon: Bell },
      { key: "coupons", label: "쿠폰", icon: Ticket },
      { key: "tickets", label: "문의", icon: MessageSquare },
      { key: "push", label: "푸시발송", icon: Send },
    ],
  },
  {
    label: "분석",
    tabs: [
      { key: "teams", label: "팀현황", icon: UsersRound },
      { key: "cohort", label: "코호트", icon: GitBranch },
      { key: "heatmap", label: "히트맵", icon: Flame },
    ],
  },
];

const COMPONENTS: Record<Tab, React.FC> = {
  dashboard: AdminDashboard,
  revenue: AdminRevenue,
  activity: AdminActivityLog,
  users: AdminUsers,
  notices: AdminNotices,
  coupons: AdminCoupons,
  tickets: AdminTickets,
  push: AdminPush,
  teams: AdminTeams,
  cohort: AdminCohort,
  heatmap: AdminFeatureHeatmap,
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const ActiveComponent = COMPONENTS[tab];

  return (
    <div className="space-y-5">
      {/* Grouped navigation */}
      <div className="space-y-2">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1 px-1">
              {group.label}
            </p>
            <div className="flex bg-[var(--bg-tertiary)] rounded-xl p-0.5 overflow-x-auto">
              {group.tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap min-w-0 ${
                    tab === key
                      ? "bg-[var(--bg-elevated)] text-red-500 shadow-sm"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Icon size={13} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}
