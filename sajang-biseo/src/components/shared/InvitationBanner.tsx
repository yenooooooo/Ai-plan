"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Check, X } from "lucide-react";
import { useToast } from "@/stores/useToast";

interface Invitation {
  id: string;
  storeId: string;
  storeName: string;
  role: string;
  inviterName: string;
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  viewer: "조회",
  editor: "편집",
};

export function InvitationBanner() {
  const toast = useToast((s) => s.show);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/team/invitations");
      const data = await res.json();
      setInvitations(data.invitations ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const accept = async (inv: Invitation) => {
    setProcessing(inv.id);
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", id: inv.id }),
      });
      if (res.ok) {
        toast(`${inv.storeName} 매장 초대를 수락했습니다`, "success");
        setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
        // 매장 목록 갱신을 위해 새로고침
        setTimeout(() => window.location.reload(), 500);
      } else {
        const data = await res.json();
        toast(data.error || "수락 실패", "error");
      }
    } catch {
      toast("수락 처리 중 오류", "error");
    }
    setProcessing(null);
  };

  const decline = async (inv: Invitation) => {
    if (!confirm(`${inv.storeName} 초대를 거절하시겠습니까?`)) return;
    setProcessing(inv.id);
    try {
      await fetch(`/api/team?id=${inv.id}`, { method: "DELETE" });
      toast("초대를 거절했습니다", "info");
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    } catch {
      toast("거절 처리 중 오류", "error");
    }
    setProcessing(null);
  };

  if (invitations.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="glass-card p-4 flex items-center gap-3 border-l-4 border-primary-500"
        >
          <UserPlus size={20} className="text-primary-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-body-small font-medium text-[var(--text-primary)]">
              <span className="text-primary-500">{inv.inviterName}</span>님이{" "}
              <strong>{inv.storeName}</strong> 매장에 초대했습니다
            </p>
            <p className="text-caption text-[var(--text-tertiary)]">
              권한: {ROLE_LABEL[inv.role] || inv.role}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => accept(inv)}
              disabled={processing === inv.id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-caption font-medium disabled:opacity-50"
            >
              <Check size={13} /> 수락
            </button>
            <button
              onClick={() => decline(inv)}
              disabled={processing === inv.id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-caption font-medium disabled:opacity-50"
            >
              <X size={13} /> 거절
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
