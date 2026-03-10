"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Trash2, Mail } from "lucide-react";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/stores/useToast";
import { PlanGate } from "@/components/shared/PlanGate";

interface Member { id: string; email: string; role: string; accepted_at: string | null; created_at: string }

export function TeamSection() {
  const { storeId } = useStoreSettings();
  const { limits } = usePlan();
  const toast = useToast((s) => s.show);
  const [members, setMembers] = useState<Member[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!storeId) return;
    const res = await fetch(`/api/team?storeId=${storeId}`);
    const data = await res.json();
    setMembers(data.members ?? []);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    if (!email.trim() || !storeId) return;
    setLoading(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, email, role }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error, "error"); setLoading(false); return; }
    toast("직원이 초대되었습니다", "success");
    setEmail(""); setShowInvite(false); setLoading(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/team?id=${id}`, { method: "DELETE" });
    load();
  };

  if (limits.teamMembers <= 0) {
    return (
      <PlanGate requiredPlan="pro_plus" featureName="직원 계정">
        <div />
      </PlanGate>
    );
  }

  return (
    <section className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">직원 관리</h3>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500 text-white text-caption font-medium">
          <Plus size={12} /> 초대
        </button>
      </div>
      <p className="text-caption text-[var(--text-tertiary)]">매장당 최대 {limits.teamMembers}명</p>

      {showInvite && (
        <div className="space-y-2 p-3 bg-[var(--bg-tertiary)] rounded-xl">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일"
            className="w-full h-8 px-3 rounded-lg bg-[var(--bg-primary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]" />
          <div className="flex gap-2">
            <select value={role} onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
              className="h-8 px-2 rounded-lg bg-[var(--bg-primary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]">
              <option value="viewer">조회만</option>
              <option value="editor">편집 가능</option>
            </select>
            <button onClick={invite} disabled={loading || !email.trim()}
              className="flex-1 h-8 rounded-lg bg-primary-500 text-white text-caption font-medium disabled:opacity-50">
              {loading ? "..." : "초대하기"}
            </button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-body-small text-[var(--text-tertiary)] text-center py-3">초대된 직원이 없습니다</p>
      ) : (
        <div className="space-y-1.5">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={13} className="text-[var(--text-tertiary)] shrink-0" />
                <span className="text-body-small text-[var(--text-primary)] truncate">{m.email}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-tertiary)]">
                  {m.role === "editor" ? "편집" : "조회"}
                </span>
              </div>
              <button onClick={() => remove(m.id)}
                className="p-1 rounded hover:bg-danger/10 text-[var(--text-tertiary)] hover:text-danger shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
