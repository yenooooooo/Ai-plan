"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/stores/useToast";

interface StoreItem { id: string; store_name: string; business_type: string }

export function StoreSwitcher() {
  const { storeId, storeName, setStoreId, setStoreName, setBusinessType } = useStoreSettings();
  const { limits } = usePlan();
  const toast = useToast((s) => s.show);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("음식점");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("sb_stores").select("id, store_name, business_type")
        .eq("user_id", user.id).is("deleted_at", null).order("created_at")
        .then(({ data }) => setStores(data ?? []));
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (stores.length <= 1 && limits.maxStores <= 1) return null;

  const switchStore = (s: StoreItem) => {
    setStoreId(s.id); setStoreName(s.store_name); setBusinessType(s.business_type);
    setOpen(false); window.location.reload();
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
    switchStore(data.store);
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
          {stores.map((s) => (
            <button key={s.id} onClick={() => switchStore(s)}
              className={`w-full px-3 py-2.5 text-left text-body-small hover:bg-[var(--bg-tertiary)] transition-colors ${s.id === storeId ? "bg-primary-500/10 text-primary-500 font-medium" : "text-[var(--text-primary)]"}`}>
              {s.store_name}
            </button>
          ))}
          {stores.length < limits.maxStores && (
            <>
              {showAdd ? (
                <div className="p-2.5 border-t border-[var(--border-default)] space-y-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="매장명" className="w-full h-8 px-2.5 rounded-lg bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-[var(--border-default)]" />
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
