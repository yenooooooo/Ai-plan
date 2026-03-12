"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Clock } from "lucide-react";

interface PushRecord {
  id: string; title: string; body: string;
  targetType: string; targetValue: string | null;
  sentCount: number; failedCount: number; created_at: string;
}

const TARGET_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "plan", label: "플랜별" },
  { value: "user", label: "특정유저" },
];

export function AdminPush() {
  const [history, setHistory] = useState<PushRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [sending, setSending] = useState(false);

  const loadHistory = () => {
    fetch("/api/admin/push")
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((d) => setHistory(d.history ?? []))
      .catch((err) => console.error("Push history load failed:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    if (targetType !== "all" && !targetValue.trim()) return;
    if (!confirm(`"${title}" 알림을 ${targetType === "all" ? "전체" : targetValue}에게 발송하시겠습니까?`)) return;

    setSending(true);
    await fetch("/api/admin/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(), body: body.trim(),
        targetType, targetValue: targetType === "all" ? null : targetValue.trim(),
      }),
    });
    setTitle(""); setBody(""); setTargetType("all"); setTargetValue("");
    setSending(false);
    loadHistory();
  };

  return (
    <div className="space-y-5">
      {/* 발송 폼 */}
      <section className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">푸시 알림 발송</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목"
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
          </div>

          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">내용</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="알림 내용" rows={3}
              className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                border border-[var(--border-default)] focus:outline-none focus:border-primary-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-[var(--text-tertiary)] mb-1 block">대상</label>
              <select value={targetType} onChange={(e) => { setTargetType(e.target.value); setTargetValue(""); }}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                  border border-[var(--border-default)] focus:outline-none focus:border-primary-500">
                {TARGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {targetType !== "all" && (
              <div>
                <label className="text-caption text-[var(--text-tertiary)] mb-1 block">
                  {targetType === "plan" ? "플랜 (free/pro/pro_plus)" : "유저 이메일"}
                </label>
                <input value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={targetType === "plan" ? "pro" : "user@email.com"}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                    border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
              </div>
            )}
          </div>

          <button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary-500 text-white text-body-small font-medium disabled:opacity-50">
            <Send size={14} />{sending ? "발송 중..." : "발송하기"}
          </button>
        </div>
      </section>

      {/* 발송 이력 */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[var(--text-tertiary)]" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">발송 이력</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>
        ) : history.length === 0 ? (
          <p className="text-body-small text-[var(--text-tertiary)] text-center py-4">발송 이력 없음</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-body-small font-medium text-[var(--text-primary)]">{h.title}</p>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(h.created_at).toLocaleDateString("ko")}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{h.body}</p>
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
                  <span>대상: {h.targetValue ?? "전체"}</span>
                  <span className="text-success">성공 {h.sentCount}</span>
                  {h.failedCount > 0 && <span className="text-danger">실패 {h.failedCount}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
