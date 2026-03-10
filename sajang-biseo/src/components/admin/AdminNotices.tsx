"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Notice {
  id: string; title: string; content: string;
  type: "info" | "warning" | "update" | "maintenance";
  link: string | null; is_active: boolean; priority: number;
  starts_at: string; ends_at: string | null; created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  info: { label: "안내", color: "bg-blue-500/10 text-blue-500" },
  warning: { label: "주의", color: "bg-yellow-500/10 text-yellow-500" },
  update: { label: "업데이트", color: "bg-green-500/10 text-green-500" },
  maintenance: { label: "점검", color: "bg-red-500/10 text-red-500" },
};

export function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info" as Notice["type"], link: "", priority: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notices");
    const data = await res.json();
    setNotices(data.notices ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await fetch("/api/admin/notices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, link: form.link || null }),
    });
    setForm({ title: "", content: "", type: "info", link: "", priority: 0 });
    setShowForm(false);
    load();
  };

  const toggleActive = async (notice: Notice) => {
    await fetch("/api/admin/notices", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notice.id, is_active: !notice.is_active }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">공지사항 관리</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-caption font-medium press-effect">
          <Plus size={13} />{showForm ? "취소" : "새 공지"}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-4 space-y-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="제목" className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="내용" rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500 resize-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Notice["type"] }))}
              className="h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]">
              <option value="info">안내</option>
              <option value="warning">주의</option>
              <option value="update">업데이트</option>
              <option value="maintenance">점검</option>
            </select>
            <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="링크 (선택)" className="flex-1 h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
              border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
          </div>
          <button onClick={handleCreate} disabled={!form.title.trim() || !form.content.trim()}
            className="w-full h-9 rounded-xl bg-primary-500 text-white text-body-small font-medium disabled:opacity-50">
            공지 등록
          </button>
        </div>
      )}

      {notices.length === 0 ? (
        <p className="text-center text-[var(--text-tertiary)] py-8">등록된 공지사항이 없습니다</p>
      ) : (
        <div className="space-y-2">
          {notices.map((n) => {
            const typeInfo = TYPE_LABELS[n.type] ?? TYPE_LABELS.info;
            return (
              <div key={n.id} className={`glass-card p-4 space-y-2 ${!n.is_active ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                      <h4 className="text-body-small font-medium text-[var(--text-primary)] truncate">{n.title}</h4>
                    </div>
                    <p className="text-caption text-[var(--text-secondary)] line-clamp-2">{n.content}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                      {new Date(n.created_at).toLocaleDateString("ko")}
                      {n.link && <> · <span className="text-primary-500">{n.link}</span></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(n)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]" title={n.is_active ? "비활성화" : "활성화"}>
                      {n.is_active ? <ToggleRight size={18} className="text-success" /> : <ToggleLeft size={18} className="text-[var(--text-tertiary)]" />}
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-[var(--text-tertiary)] hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
