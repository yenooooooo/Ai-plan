"use client";

import { useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface LogEntry {
  id: string;
  userId: string;
  email: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  login: "로그인",
  closing_save: "마감 저장",
  receipt_ocr: "영수증 OCR",
  review_generate: "리뷰 생성",
  order_save: "발주 저장",
  briefing_view: "브리핑 조회",
};

const ACTION_OPTIONS = [
  { value: "", label: "전체" },
  ...Array.from(Object.entries(ACTION_LABELS)).map(([value, label]) => ({ value, label })),
];

const LIMIT = 50;

const ACTION_COLORS: Record<string, string> = {
  login: "#3b82f6",
  closing_save: "#8b5cf6",
  receipt_ocr: "#f59e0b",
  review_generate: "#10b981",
  order_save: "#ef4444",
  briefing_view: "#06b6d4",
};

export function AdminActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = useCallback(async (newOffset: number) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (email) params.set("email", email);
      if (action) params.set("action", action);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("offset", String(newOffset));
      params.set("limit", String(LIMIT));
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) throw new Error("활동 로그를 불러오지 못했습니다.");
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setOffset(newOffset);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [email, action, fromDate, toDate]);

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const truncateJson = (obj: Record<string, unknown>) => {
    const s = JSON.stringify(obj);
    return s.length > 60 ? s.slice(0, 57) + "..." : s;
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--bg-tertiary)",
    background: "var(--bg-tertiary)", color: "var(--text-primary)", fontSize: "0.875rem", minWidth: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>이메일</label>
          <input style={inputStyle} placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>액션</label>
          <select style={inputStyle} value={action} onChange={(e) => setAction(e.target.value)}>
            {Array.from(ACTION_OPTIONS).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>시작일</label>
          <input style={inputStyle} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>종료일</label>
          <input style={inputStyle} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <button
          onClick={() => fetchLogs(0)}
          style={{
            padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer",
            background: "var(--bg-tertiary)", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.375rem",
          }}
        >
          <Search size={16} /> 검색
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", padding: "0.75rem", background: "var(--bg-tertiary)", borderRadius: "0.5rem" }}>{error}</div>
      )}

      {/* Log List */}
      <div className="glass-card" style={{ padding: "0" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>로딩 중...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            {total === 0 && offset === 0 ? "검색 버튼을 눌러 조회하세요." : "데이터가 없습니다."}
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {Array.from(logs).map((log) => (
              <li key={log.id} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--bg-tertiary)", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <Activity size={14} style={{ color: "var(--text-secondary)" }} />
                <span style={{ fontWeight: 600, color: "var(--text-primary)", minWidth: "10rem" }}>{log.email}</span>
                <span style={{
                  padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600,
                  background: (ACTION_COLORS[log.action] ?? "#6b7280") + "22",
                  color: ACTION_COLORS[log.action] ?? "#6b7280",
                }}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <span style={{ flex: 1, fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {truncateJson(log.metadata)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {new Date(log.createdAt).toLocaleString("ko-KR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
          <button disabled={offset === 0} onClick={() => fetchLogs(offset - LIMIT)}
            style={{ padding: "0.4rem", borderRadius: "0.375rem", border: "none", cursor: offset === 0 ? "default" : "pointer", background: "var(--bg-tertiary)", color: "var(--text-primary)", opacity: offset === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{currentPage} / {totalPages}</span>
          <button disabled={offset + LIMIT >= total} onClick={() => fetchLogs(offset + LIMIT)}
            style={{ padding: "0.4rem", borderRadius: "0.375rem", border: "none", cursor: offset + LIMIT >= total ? "default" : "pointer", background: "var(--bg-tertiary)", color: "var(--text-primary)", opacity: offset + LIMIT >= total ? 0.4 : 1 }}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
