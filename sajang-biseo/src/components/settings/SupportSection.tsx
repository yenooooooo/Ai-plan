"use client";

import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Send, Loader2, MessageSquare, Clock } from "lucide-react";
import { useToast } from "@/stores/useToast";
import { useStoreSettings } from "@/stores/useStoreSettings";

interface Ticket {
  id: string; category: string; subject: string; message: string;
  status: "open" | "replied" | "closed";
  admin_reply: string | null; admin_replied_at: string | null; created_at: string;
}

const CATS = [
  { value: "bug", label: "버그" }, { value: "feature", label: "기능 요청" },
  { value: "billing", label: "결제" }, { value: "general", label: "기타" },
];
const STATUS: Record<string, { label: string; color: string }> = {
  open: { label: "접수", color: "var(--color-warning)" },
  replied: { label: "답변완료", color: "var(--color-success)" },
  closed: { label: "종료", color: "var(--text-secondary)" },
};
const inputStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
  border: "1px solid var(--border-primary)", background: "var(--bg-tertiary)",
  color: "var(--text-primary)", fontSize: "0.9rem", width: "100%", boxSizing: "border-box",
};
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

export function SupportSection() {
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const [cat, setCat] = useState("general");
  const [subj, setSubj] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/support");
      if (!r.ok) throw 0;
      setTickets((await r.json()).tickets ?? []);
    } catch { toast("문의 내역 로딩 실패", "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!subj.trim() || !msg.trim()) { toast("제목과 내용을 모두 입력해주세요.", "error"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, subject: subj, message: msg, storeId }),
      });
      if (!r.ok) throw 0;
      toast("문의가 접수되었습니다.", "success");
      setSubj(""); setMsg(""); setCat("general");
      await load();
    } catch { toast("문의 등록 중 오류가 발생했습니다.", "error"); }
    finally { setBusy(false); }
  };

  return (
    <section className="glass-card" style={{ padding: "1.25rem" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem",
        fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
        <HelpCircle size={20} /> 문의하기
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
          {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input type="text" placeholder="제목" value={subj}
          onChange={(e) => setSubj(e.target.value)} style={inputStyle} />
        <textarea placeholder="문의 내용을 입력하세요" value={msg}
          onChange={(e) => setMsg(e.target.value)} rows={4}
          style={{ ...inputStyle, resize: "vertical" }} />
        <button onClick={submit} disabled={busy}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            padding: "0.65rem", borderRadius: "0.5rem", border: "none",
            background: "var(--color-primary)", color: "#fff", fontWeight: 600, fontSize: "0.9rem",
            cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {busy ? "전송 중..." : "문의 보내기"}
        </button>
      </div>

      {/* Ticket history */}
      <div style={{ marginTop: "1.5rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)",
          marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <MessageSquare size={16} /> 내 문의 내역
        </h4>

        {loading ? (
          <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto" }} />
          </div>
        ) : tickets.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
            문의 내역이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {tickets.map((t) => {
              const s = STATUS[t.status] ?? STATUS.open;
              return (
                <li key={t.id} style={{ padding: "0.75rem", borderRadius: "0.5rem",
                  background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {t.subject}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.5rem",
                      borderRadius: "999px", background: s.color, color: "#fff" }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem",
                    marginTop: "0.3rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <Clock size={12} /> {fmtDate(t.created_at)}
                  </div>
                  {t.admin_reply && (
                    <div style={{ marginTop: "0.5rem", padding: "0.6rem 0.75rem", borderRadius: "0.4rem",
                      background: "var(--bg-secondary)", borderLeft: "3px solid var(--color-primary)",
                      fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      <strong style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>관리자 답변</strong>
                      <p style={{ margin: "0.25rem 0 0" }}>{t.admin_reply}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
