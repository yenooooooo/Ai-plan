"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Send, XCircle } from "lucide-react";

interface Ticket {
  id: string; user_id: string; email: string; category: string;
  subject: string; message: string; status: string;
  admin_reply: string | null; admin_replied_at: string | null; created_at: string;
}

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "open", label: "open" },
  { key: "replied", label: "replied" },
  { key: "closed", label: "closed" },
];

const CATEGORY_STYLES: Record<string, string> = {
  bug: "bg-danger/10 text-danger",
  feature: "bg-purple-500/10 text-purple-500",
  billing: "bg-blue-500/10 text-blue-500",
  general: "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]",
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "버그", feature: "기능", billing: "결제", general: "일반",
};

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const qs = status === "all" ? "" : `?status=${status}`;
    const res = await fetch(`/api/admin/tickets${qs}`);
    const data = await res.json();
    setTickets(data.tickets ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminReply: replyText.trim() }),
    });
    setReplyText(""); setSubmitting(false);
    loadTickets();
  };

  const handleClose = async (id: string) => {
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "closed" }),
    });
    loadTickets();
  };

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
    setReplyText("");
  };

  return (
    <div className="space-y-4">
      {/* 상태 필터 */}
      <div className="flex gap-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button key={tab.key} onClick={() => { setStatus(tab.key); setExpanded(null); }}
            className={`px-3 py-1.5 rounded-full text-caption font-medium whitespace-nowrap transition-colors ${
              status === tab.key
                ? "bg-primary-500 text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <p className="text-center text-[var(--text-tertiary)] py-8">티켓이 없습니다</p>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="glass-card overflow-hidden">
              <button onClick={() => toggle(t.id)}
                className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_STYLES[t.category] ?? CATEGORY_STYLES.general}`}>
                      {CATEGORY_LABELS[t.category] ?? t.category}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      t.status === "open" ? "bg-warning/10 text-warning" :
                      t.status === "replied" ? "bg-success/10 text-success" :
                      "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-body-small font-medium text-[var(--text-primary)] truncate">{t.subject}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{t.email} · {new Date(t.created_at).toLocaleDateString("ko")}</p>
                </div>
                {expanded === t.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {expanded === t.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-default)]">
                  <p className="text-body-small text-[var(--text-secondary)] pt-3 whitespace-pre-wrap">{t.message}</p>

                  {t.admin_reply && (
                    <div className="bg-primary-500/5 rounded-xl p-3 space-y-1">
                      <p className="text-[11px] font-medium text-primary-500">관리자 답변</p>
                      <p className="text-body-small text-[var(--text-primary)] whitespace-pre-wrap">{t.admin_reply}</p>
                      {t.admin_replied_at && (
                        <p className="text-[10px] text-[var(--text-tertiary)]">{new Date(t.admin_replied_at).toLocaleString("ko")}</p>
                      )}
                    </div>
                  )}

                  {t.status !== "closed" && (
                    <div className="space-y-2">
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        placeholder="답변 작성..." rows={3}
                        className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                          border border-[var(--border-default)] focus:outline-none focus:border-primary-500 resize-none" />
                      <div className="flex gap-2 justify-end">
                        {t.status === "replied" && (
                          <button onClick={() => handleClose(t.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-caption font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <XCircle size={12} />종료
                          </button>
                        )}
                        <button onClick={() => handleReply(t.id)} disabled={submitting || !replyText.trim()}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-caption font-medium bg-primary-500 text-white disabled:opacity-50">
                          <Send size={12} />{submitting ? "전송 중..." : "답변"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
