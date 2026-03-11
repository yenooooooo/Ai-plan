"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  plan: "pro" | "pro_plus";
  duration_days: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const PLAN_LABEL = { pro: "Pro", pro_plus: "Pro+" };
const DURATION_PRESETS = [7, 30, 90, 180, 365];

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: randomCode(),
    plan: "pro" as "pro" | "pro_plus",
    duration_days: 30,
    max_uses: 1,
    expires_at: "",
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, expires_at: form.expires_at || null }),
    });
    setCreating(false);
    if (res.ok) {
      setForm({ code: randomCode(), plan: "pro", duration_days: 30, max_uses: 1, expires_at: "" });
      fetchCoupons();
    } else {
      const d = await res.json();
      alert(d.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("쿠폰을 삭제/비활성화하시겠습니까?")) return;
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchCoupons();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5">
      {/* 생성 폼 */}
      <form onSubmit={handleCreate} className="glass-card p-5 space-y-4">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">쿠폰 발급</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">코드</label>
            <div className="flex gap-1.5">
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="flex-1 h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500 uppercase"
                required maxLength={20} />
              <button type="button" onClick={() => setForm(f => ({ ...f, code: randomCode() }))}
                className="h-9 px-2 rounded-xl bg-[var(--bg-elevated)] text-caption text-[var(--text-tertiary)] hover:text-primary-500 border border-[var(--border-default)]">
                랜덤
              </button>
            </div>
          </div>
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">플랜</label>
            <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as "pro" | "pro_plus" }))}
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500">
              <option value="pro">Pro</option>
              <option value="pro_plus">Pro+</option>
            </select>
          </div>
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">기간(일)</label>
            <div className="flex gap-1 flex-wrap">
              {DURATION_PRESETS.map(d => (
                <button key={d} type="button" onClick={() => setForm(f => ({ ...f, duration_days: d }))}
                  className={`px-2 h-7 rounded-lg text-[11px] font-medium transition-all ${form.duration_days === d ? "bg-primary-500 text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-default)]"}`}>
                  {d}일
                </button>
              ))}
              <input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: Number(e.target.value) }))}
                className="w-16 h-7 px-2 rounded-lg bg-[var(--bg-tertiary)] text-[11px] font-display text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500 text-center"
                min={1} />
            </div>
          </div>
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">최대 사용 횟수</label>
            <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))}
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500"
              min={1} required />
          </div>
          <div className="col-span-2">
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">쿠폰 유효기간 (선택)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)] border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <button type="submit" disabled={creating}
          className="w-full h-10 rounded-xl bg-primary-500 text-white text-body-small font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-50 transition-colors">
          <Plus size={15} />{creating ? "발급 중..." : "쿠폰 발급"}
        </button>
      </form>

      {/* 쿠폰 목록 */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">발급된 쿠폰 ({coupons.length})</h3>
        {loading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : coupons.length === 0 ? (
          <p className="text-caption text-[var(--text-tertiary)] text-center py-4">발급된 쿠폰 없음</p>
        ) : coupons.map(c => (
          <div key={c.id} className={`flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0 ${!c.is_active ? "opacity-40" : ""}`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-display text-body-small font-bold text-[var(--text-primary)]">{c.code}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c.plan === "pro_plus" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                  {PLAN_LABEL[c.plan]}
                </span>
                {!c.is_active && <span className="text-[10px] text-danger">비활성</span>}
              </div>
              <p className="text-caption text-[var(--text-tertiary)]">
                {c.duration_days}일 · {c.used_count}/{c.max_uses}회 사용
                {c.expires_at && ` · ${c.expires_at.slice(0, 10)} 만료`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => copyCode(c.code)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-primary-500 transition-colors">
                {copied === c.code ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-danger transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
