"use client";

import { useState, useEffect } from "react";
import { Users, Store, TrendingUp, UserPlus, AlertTriangle, Activity } from "lucide-react";

interface DashboardData {
  stats: { totalUsers: number; totalStores: number; activeToday: number; newSignupsWeek: number };
  funnel: { totalSignups: number; onboardingDone: number; storeCreated: number; firstClosing: number; retained: number };
  retention: { atRiskStores: { id: string; storeName: string; userId: string }[]; atRiskCount: number };
  featureUsage: Record<string, number>;
  uniqueFeature: Record<string, number>;
  totalStores: number;
}

const FEATURE_LABELS: Record<string, string> = {
  closing: "마감", receipt: "영수증", review: "리뷰", order: "발주", briefing: "브리핑",
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => console.error("Dashboard load failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-[var(--text-tertiary)]">데이터 로드 실패</p>;

  const { stats, funnel, retention, featureUsage, uniqueFeature, totalStores } = data;

  return (
    <div className="space-y-5">
      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "총 사용자", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
          { label: "총 매장", value: stats.totalStores, icon: Store, color: "text-green-500" },
          { label: "오늘 활성", value: stats.activeToday, icon: TrendingUp, color: "text-primary-500" },
          { label: "주간 신규", value: stats.newSignupsWeek, icon: UserPlus, color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Icon size={14} className={color} />
              <span className="text-caption text-[var(--text-tertiary)]">{label}</span>
            </div>
            <p className="text-heading-lg font-display text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      {/* 온보딩 퍼널 */}
      <section className="glass-card p-5 space-y-3">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">온보딩 퍼널</h3>
        <div className="space-y-2">
          {[
            { label: "가입", value: funnel.totalSignups, base: funnel.totalSignups },
            { label: "온보딩 완료", value: funnel.onboardingDone, base: funnel.totalSignups },
            { label: "매장 생성", value: funnel.storeCreated, base: funnel.totalSignups },
            { label: "첫 마감", value: funnel.firstClosing, base: funnel.totalSignups },
            { label: "7일 활성", value: funnel.retained, base: funnel.totalSignups },
          ].map(({ label, value, base }) => {
            const pct = base > 0 ? Math.round((value / base) * 100) : 0;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-caption">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <span className="text-[var(--text-tertiary)]">{value}명 ({pct}%)</span>
                </div>
                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 기능별 사용률 */}
      <section className="glass-card p-5 space-y-3">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">기능별 사용률</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => {
            const stores = uniqueFeature[key] ?? 0;
            const total = featureUsage[key] ?? 0;
            const pct = totalStores > 0 ? Math.round((stores / totalStores) * 100) : 0;
            return (
              <div key={key} className="bg-[var(--bg-tertiary)] rounded-xl p-3 text-center space-y-1">
                <Activity size={14} className="mx-auto text-[var(--text-tertiary)]" />
                <p className="text-caption font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{stores}/{totalStores}매장 ({pct}%)</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">총 {total}건</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 이탈 위험 사용자 */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">이탈 위험 ({retention.atRiskCount})</h3>
        </div>
        <p className="text-caption text-[var(--text-tertiary)]">마감 기록이 있지만 3일 이상 미입력한 매장</p>
        {retention.atRiskStores.length === 0 ? (
          <p className="text-body-small text-success text-center py-2">이탈 위험 매장 없음</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {retention.atRiskStores.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--bg-tertiary)]">
                <span className="text-body-small text-[var(--text-primary)]">{s.storeName}</span>
                <span className="text-[11px] text-[var(--text-tertiary)]">{s.id.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
