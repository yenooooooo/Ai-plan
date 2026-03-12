"use client";

import { useState, useEffect } from "react";
import { DollarSign, Users, TrendingDown, Ticket } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface RevenueData {
  distribution: { free: number; pro: number; pro_plus: number };
  mrr: number;
  totalPaid: number;
  churned: { id: string; email: string; previousPlan: string; date: string }[];
  couponStats: { code: string; plan: string; usedCount: number; maxUses: number; active: boolean }[];
}

const PLAN_LABELS: Record<string, string> = { free: "무료", pro: "Pro", pro_plus: "Pro+" };
const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-400", pro: "bg-blue-500", pro_plus: "bg-purple-500",
};

export function AdminRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => console.error("Revenue load failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-[var(--text-tertiary)]">데이터 로드 실패</p>;

  const { distribution, mrr, totalPaid, churned, couponStats } = data;
  const totalUsers = distribution.free + distribution.pro + distribution.pro_plus;

  return (
    <div className="space-y-5">
      {/* MRR + 유료 사용자 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-green-500" />
            <span className="text-caption text-[var(--text-tertiary)]">MRR</span>
          </div>
          <p className="text-heading-lg font-display text-[var(--text-primary)]">{formatCurrency(mrr)}</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-blue-500" />
            <span className="text-caption text-[var(--text-tertiary)]">유료 사용자</span>
          </div>
          <p className="text-heading-lg font-display text-[var(--text-primary)]">{totalPaid}명</p>
        </div>
      </div>

      {/* 플랜 분포 */}
      <section className="glass-card p-5 space-y-3">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">플랜 분포</h3>
        <div className="grid grid-cols-3 gap-2">
          {(["free", "pro", "pro_plus"] as const).map((key) => {
            const count = distribution[key];
            const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={key} className="bg-[var(--bg-tertiary)] rounded-xl p-3 text-center space-y-2">
                <p className="text-caption font-medium text-[var(--text-primary)]">{PLAN_LABELS[key]}</p>
                <p className="text-heading-lg font-display text-[var(--text-primary)]">{count}</p>
                <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className={`h-full ${PLAN_COLORS[key]} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">{pct}%</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 최근 이탈 */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-warning" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">최근 이탈 ({churned.length})</h3>
        </div>
        {churned.length === 0 ? (
          <p className="text-body-small text-success text-center py-2">이번 달 이탈 없음</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {churned.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div>
                  <p className="text-body-small text-[var(--text-primary)]">{c.email}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{PLAN_LABELS[c.previousPlan] ?? c.previousPlan} → 무료</p>
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)]">{new Date(c.date).toLocaleDateString("ko")}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 쿠폰 통계 */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Ticket size={16} className="text-purple-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">쿠폰 통계</h3>
        </div>
        {couponStats.length === 0 ? (
          <p className="text-body-small text-[var(--text-tertiary)] text-center py-2">등록된 쿠폰 없음</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-default)]">
                  <th className="text-left py-2 font-medium">코드</th>
                  <th className="text-left py-2 font-medium">플랜</th>
                  <th className="text-center py-2 font-medium">사용</th>
                  <th className="text-center py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {couponStats.map((cp) => (
                  <tr key={cp.code} className="border-b border-[var(--border-default)]/50">
                    <td className="py-2 text-[var(--text-primary)] font-mono">{cp.code}</td>
                    <td className="py-2 text-[var(--text-secondary)]">{PLAN_LABELS[cp.plan] ?? cp.plan}</td>
                    <td className="py-2 text-center text-[var(--text-secondary)]">{cp.usedCount}/{cp.maxUses}</td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cp.active ? "bg-success/10 text-success" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"}`}>
                        {cp.active ? "활성" : "만료"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
