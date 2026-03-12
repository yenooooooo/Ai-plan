"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";

export function LeaveStoreSection() {
  const { storeId, storeName, reset } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    if (!confirm(`${storeName} 매장에서 나가시겠습니까?\n더 이상 이 매장의 데이터에 접근할 수 없습니다.`)) return;
    setLeaving(true);
    try {
      const res = await fetch("/api/team/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (res.ok) {
        toast("매장에서 나갔습니다", "success");
        reset();
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      toast("매장 나가기에 실패했습니다", "error");
    } catch {
      toast("오류가 발생했습니다", "error");
    }
    setLeaving(false);
  };

  return (
    <section className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <LogOut size={16} className="text-danger" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">매장 나가기</h3>
      </div>
      <p className="text-caption text-[var(--text-tertiary)]">
        이 매장은 팀원으로 참여 중입니다. 나가면 더 이상 접근할 수 없습니다.
      </p>
      <button
        onClick={handleLeave}
        disabled={leaving}
        className="w-full py-2.5 rounded-xl bg-danger/10 text-danger text-body-small font-medium press-effect disabled:opacity-50"
      >
        {leaving ? "처리 중..." : `${storeName} 매장 나가기`}
      </button>
    </section>
  );
}
