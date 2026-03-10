"use client";

import { useState } from "react";
import { Search, RefreshCw, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface UserInfo {
  id: string; email: string; createdAt: string; lastSignIn: string | null;
  onboardingComplete: boolean; stores: { id: string; name: string; closingCount: number }[];
}
interface StoreDetail {
  store: { store_name: string; business_type: string; address: string | null; phone: string | null } | null;
  closings: { id: string; date: string; total_sales: number; total_fees: number; net_sales: number; memo: string | null }[];
  receipts: { id: string; date: string; merchant_name: string; total_amount: number }[];
  reviews: { id: string; platform: string; rating: number; content: string; reply_status: string }[];
  deleted: {
    closings: { id: string; date: string; total_sales: number; deleted_at: string }[];
    receipts: { id: string; date: string; merchant_name: string; total_amount: number; deleted_at: string }[];
    channels: { id: string; channel_name: string; deleted_at: string }[];
  };
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [detailStoreId, setDetailStoreId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const handleSearch = async () => {
    setLoading(true); setDetail(null); setDetailStoreId(null);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data.users ?? []); setLoading(false);
  };

  const loadDetail = async (storeId: string) => {
    if (detailStoreId === storeId) { setDetailStoreId(null); setDetail(null); return; }
    setDetailLoading(true); setDetailStoreId(storeId);
    const res = await fetch(`/api/admin/users/${storeId}`);
    setDetail(await res.json()); setDetailLoading(false);
  };

  const restore = async (table: string, recordId: string) => {
    if (!detailStoreId) return;
    await fetch(`/api/admin/users/${detailStoreId}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", table, recordId }),
    });
    loadDetail(detailStoreId);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="이메일로 검색"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
              border border-[var(--border-default)] focus:outline-none focus:border-primary-500" />
        </div>
        <button onClick={handleSearch} disabled={loading}
          className="h-10 px-4 rounded-xl bg-primary-500 text-white text-body-small font-medium disabled:opacity-50">
          {loading ? <RefreshCw size={14} className="animate-spin" /> : "검색"}
        </button>
      </div>

      {users.length === 0 && !loading && (
        <p className="text-center text-[var(--text-tertiary)] py-4">검색 결과가 없습니다</p>
      )}

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-small font-medium text-[var(--text-primary)]">{u.email}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  가입: {new Date(u.createdAt).toLocaleDateString("ko")} · 온보딩: {u.onboardingComplete ? "완료" : "미완료"}
                  {u.lastSignIn && ` · 마지막 접속: ${new Date(u.lastSignIn).toLocaleDateString("ko")}`}
                </p>
              </div>
            </div>
            {u.stores.map((s) => (
              <div key={s.id}>
                <button onClick={() => loadDetail(s.id)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors">
                  <span className="text-body-small text-[var(--text-primary)]">{s.name} <span className="text-[var(--text-tertiary)]">({s.closingCount}건)</span></span>
                  {detailStoreId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {detailStoreId === s.id && (
                  <div className="mt-2 pl-2 border-l-2 border-primary-500/30 space-y-3">
                    {detailLoading ? <p className="text-caption text-[var(--text-tertiary)] py-2">로딩...</p> : detail && (
                      <>
                        {/* 최근 마감 */}
                        <div>
                          <p className="text-caption font-medium text-[var(--text-secondary)] mb-1">최근 마감 (최대 30건)</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {detail.closings.map((c) => (
                              <div key={c.id} className="flex justify-between text-[11px] px-2 py-1 bg-[var(--bg-tertiary)] rounded">
                                <span>{c.date}</span>
                                <span>매출 {formatCurrency(c.total_sales)} / 수수료 {formatCurrency(c.total_fees)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* 삭제된 데이터 */}
                        <div>
                          <button onClick={() => setShowDeleted(!showDeleted)}
                            className="text-caption text-warning font-medium flex items-center gap-1">
                            <RotateCcw size={12} />삭제된 데이터 ({(detail.deleted.closings.length + detail.deleted.receipts.length + detail.deleted.channels.length)}건)
                          </button>
                          {showDeleted && (
                            <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                              {detail.deleted.closings.map((c) => (
                                <div key={c.id} className="flex justify-between items-center text-[11px] px-2 py-1 bg-danger/5 rounded">
                                  <span>마감 {c.date} ({formatCurrency(c.total_sales)})</span>
                                  <button onClick={() => restore("sb_daily_closing", c.id)}
                                    className="text-primary-500 font-medium">복원</button>
                                </div>
                              ))}
                              {detail.deleted.receipts.map((r) => (
                                <div key={r.id} className="flex justify-between items-center text-[11px] px-2 py-1 bg-danger/5 rounded">
                                  <span>영수증 {r.date} {r.merchant_name}</span>
                                  <button onClick={() => restore("sb_receipts", r.id)}
                                    className="text-primary-500 font-medium">복원</button>
                                </div>
                              ))}
                              {detail.deleted.channels.map((ch) => (
                                <div key={ch.id} className="flex justify-between items-center text-[11px] px-2 py-1 bg-danger/5 rounded">
                                  <span>채널 {ch.channel_name}</span>
                                  <button onClick={() => restore("sb_fee_channels", ch.id)}
                                    className="text-primary-500 font-medium">복원</button>
                                </div>
                              ))}
                              {(detail.deleted.closings.length + detail.deleted.receipts.length + detail.deleted.channels.length) === 0 && (
                                <p className="text-[11px] text-[var(--text-tertiary)] py-1">삭제된 데이터 없음</p>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
