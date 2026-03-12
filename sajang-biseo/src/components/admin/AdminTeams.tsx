"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Mail, Store, Clock, CheckCircle } from "lucide-react";

interface Member {
  id: string;
  email: string;
  role: string;
  store_id: string;
  storeName: string;
  invited_by: string;
  inviterEmail: string;
  accepted_at: string | null;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "accepted";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기중" },
  { key: "accepted", label: "수락됨" },
];

export function AdminTeams() {
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/teams${params}`);
      if (!res.ok) throw new Error("팀 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const pendingCount = members.filter((m) => !m.accepted_at).length;
  const acceptedCount = members.filter((m) => m.accepted_at).length;

  const filtered =
    status === "all"
      ? members
      : members.filter((m) =>
          status === "pending" ? !m.accepted_at : !!m.accepted_at
        );

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Summary */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "전체", count: members.length, icon: <Users size={18} /> },
          { label: "대기중", count: pendingCount, icon: <Clock size={18} /> },
          { label: "수락됨", count: acceptedCount, icon: <CheckCircle size={18} /> },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {s.icon}
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{s.label}</span>
            <strong style={{ color: "var(--text-primary)", fontSize: "1.125rem" }}>{s.count}</strong>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {Array.from(STATUS_TABS).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontWeight: status === tab.key ? 700 : 400,
              background: status === tab.key ? "var(--bg-tertiary)" : "transparent",
              color: status === tab.key ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: "#ef4444", padding: "0.75rem", background: "var(--bg-tertiary)", borderRadius: "0.5rem" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ overflowX: "auto", padding: "0" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>데이터가 없습니다.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-tertiary)" }}>
                {["이메일", "매장", "역할", "초대자", "상태", "날짜"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(filtered).map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--bg-tertiary)" }}>
                  <td style={{ padding: "0.75rem", color: "var(--text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Mail size={14} /> {m.email}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Store size={14} /> {m.storeName}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{ background: "var(--bg-tertiary)", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", color: "var(--text-primary)" }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>{m.inviterEmail}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600,
                      background: m.accepted_at ? "#dcfce7" : "#fff7ed",
                      color: m.accepted_at ? "#16a34a" : "#ea580c",
                    }}>
                      {m.accepted_at ? "수락됨" : "대기중"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>
                    {formatDate(m.accepted_at ?? m.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
