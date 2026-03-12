"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Store, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useTeamRoleStore } from "@/stores/useTeamRole";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/stores/useToast";

interface StoreItem { id: string; store_name: string; business_type: string }
interface TeamStore { id: string; storeName: string; businessType: string; role: string }

const ROLE_BADGE: Record<string, string> = { viewer: "조회", editor: "편집" };

export function StoreSwitcher() {
  const { storeId, storeName, setStoreId, setStoreName, setBusinessType } = useStoreSettings();
  const setRole = useTeamRoleStore((s) => s.setRole);
  const { limits } = usePlan();
  const toast = useToast((s) => s.show);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [teamStores, setTeamStores] = useState<TeamStore[]>([]);
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("음식점");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // 소유 매장
      supabase.from("sb_stores").select("id, store_name, business_type")
        .eq("user_id", user.id).is("deleted_at", null).order("created_at")
        .then(({ data }) => setStores(data ?? []));
    });
    // 팀 매장
    fetch("/api/stores/accessible").then((r) => r.json()).then((data) => {
      const teams = (data.stores ?? []).filter((s: TeamStore) => s.role !== "owner");
      setTeamStores(teams);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalStores = stores.length + teamStores.length;
  if (totalStores <= 1 && limits.maxStores <= 1 && teamStores.length === 0) return null;

  const switchToOwned = (s: StoreItem) => {
    setStoreId(s.id); setStoreName(s.store_name); setBusinessType(s.business_type);
    setRole("owner"); setOpen(false); window.location.reload();
  };

  const switchToTeam = (s: TeamStore) => {
    setStoreId(s.id); setStoreName(s.storeName); setBusinessType(s.businessType);
    setRole(s.role as "owner" | "editor" | "viewer"); setOpen(false); window.location.reload();
  };

  const addStore = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_name: newName, business_type: newType }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error, "error"); return; }
    setStores((prev) => [...prev, data.store]);
    switchToOwned(data.store);
    setShowAdd(false); setNewName("");
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
        <Store size={14} className="text-primary-500" />
        <span className="text-body-small font-medium text-[var(--text-primary)] max-w-[100px] truncate">
          {storeName || "매장"}
        </span>
        <ChevronDown size={12} className={`text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-lg z-50 overflow-hidden">
          {/* 내 매장 */}
          {stores.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">내 매장</p>
              {stores.map((s) => (
                <button key={s.id} onClick={() => switchToOwned(s)}
                  className={`w-full px-3 py-2.5 text-left text-body-small hover:bg-[var(--bg-tertiary)] transition-colors ${s.id === storeId ? "bg-primary-500/10 text-primary-500 font-medium" : "text-[var(--text-primary)]"}`}>
                  {s.store_name}
                </button>
              ))}
            </>
          )}

          {/* 팀 매장 */}
          {teamStores.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase border-t border-[var(--border-default)]">
                <Users size={10} className="inline mr-1" />팀 매장
              </p>
              {teamStores.map((s) => (
                <button key={s.id} onClick={() => switchToTeam(s)}
                  className={`w-full px-3 py-2.5 text-left text-body-small hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-between ${s.id === storeId ? "bg-primary-500/10 text-primary-500 font-medium" : "text-[var(--text-primary)]"}`}>
                  <span className="truncate">{s.storeName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-tertiary)] shrink-0 ml-2">
                    {ROLE_BADGE[s.role] || s.role}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* 매장 추가 */}
          {stores.length < limits.maxStores && (
            <>
              {showAdd ? (
                <div className="p-2.5 border-t border-[var(--border-default)] space-y-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="매장명"
                    className="w-full h-8 px-2.5 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]" />
                  <select value={newType} onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]">
                    <option>음식점</option><option>카페</option><option>술집/주점</option><option>기타</option>
                  </select>
                  <button onClick={addStore} disabled={!newName.trim()}
                    className="w-full h-8 rounded-lg bg-primary-500 text-white text-caption font-medium disabled:opacity-50">추가</button>
                </div>
              ) : (
                <button onClick={() => setShowAdd(true)}
                  className="w-full px-3 py-2.5 text-left text-body-small text-primary-500 hover:bg-[var(--bg-tertiary)] border-t border-[var(--border-default)] flex items-center gap-1.5">
                  <Plus size={14} /> 매장 추가
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
