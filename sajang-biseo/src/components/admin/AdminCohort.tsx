"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp } from "lucide-react";

interface CohortRow {
  week: string;
  total: number;
  retention: Record<number, number>;
}

const RETENTION_WEEKS = [1, 2, 4, 8];

function retentionColor(pct: number): string {
  if (pct > 60) return "#dcfce7";
  if (pct >= 30) return "#fef9c3";
  return "#fee2e2";
}

function retentionTextColor(pct: number): string {
  if (pct > 60) return "#16a34a";
  if (pct >= 30) return "#ca8a04";
  return "#dc2626";
}

export function AdminCohort() {
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/cohort");
        if (!res.ok) throw new Error("코호트 데이터를 불러오지 못했습니다.");
        const data = await res.json();
        setCohorts(data.cohorts ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalUsers = cohorts.reduce((sum, c) => sum + c.total, 0);

  const avg1WeekRetention = cohorts.length > 0
    ? cohorts.reduce((sum, c) => {
        const r = c.retention[1] ?? 0;
        return sum + (c.total > 0 ? (r / c.total) * 100 : 0);
      }, 0) / cohorts.length
    : 0;

  const formatWeek = (w: string) => {
    const d = new Date(w);
    return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  };

  const thStyle: React.CSSProperties = {
    padding: "0.625rem 0.75rem",
    textAlign: "center",
    fontWeight: 600,
    fontSize: "0.8125rem",
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--bg-tertiary)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    textAlign: "center",
    fontSize: "0.8125rem",
    borderBottom: "1px solid var(--bg-tertiary)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={18} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>추적 사용자</span>
          <strong style={{ color: "var(--text-primary)", fontSize: "1.125rem" }}>{totalUsers}명</strong>
        </div>
        <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={18} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>평균 1주 리텐션</span>
          <strong style={{ color: "var(--text-primary)", fontSize: "1.125rem" }}>{avg1WeekRetention.toFixed(1)}%</strong>
        </div>
      </div>

      {error && (
        <div style={{ color: "#ef4444", padding: "0.75rem", background: "var(--bg-tertiary)", borderRadius: "0.5rem" }}>
          {error}
        </div>
      )}

      {/* Cohort Table */}
      <div className="glass-card" style={{ overflowX: "auto", padding: 0 }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>로딩 중...</div>
        ) : cohorts.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>데이터가 없습니다.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left" }}>가입주</th>
                <th style={thStyle}>총원</th>
                {Array.from(RETENTION_WEEKS).map((w) => (
                  <th key={w} style={thStyle}>{w}주</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(cohorts).map((c) => (
                <tr key={c.week}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600, color: "var(--text-primary)" }}>
                    {formatWeek(c.week)}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-primary)", fontWeight: 600 }}>{c.total}</td>
                  {Array.from(RETENTION_WEEKS).map((w) => {
                    const count = c.retention[w] ?? 0;
                    const pct = c.total > 0 ? (count / c.total) * 100 : 0;
                    return (
                      <td key={w} style={{
                        ...tdStyle,
                        background: retentionColor(pct),
                        color: retentionTextColor(pct),
                        fontWeight: 600,
                      }}>
                        <div>{count}</div>
                        <div style={{ fontSize: "0.6875rem", opacity: 0.85 }}>{pct.toFixed(0)}%</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
