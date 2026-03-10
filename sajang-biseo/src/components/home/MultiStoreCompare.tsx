"use client";

import { useState, useEffect } from "react";
import { BarChart3, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface StoreStats {
  id: string;
  name: string;
  totalSales: number;
  totalFees: number;
  netSales: number;
  closingCount: number;
}

export function MultiStoreCompare() {
  const [stats, setStats] = useState<StoreStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }

      const { data: stores } = await supabase
        .from("sb_stores").select("id, store_name")
        .eq("user_id", user.id).is("deleted_at", null);

      if (!stores || stores.length <= 1) { setLoading(false); return; }

      const results: StoreStats[] = [];
      for (const store of stores) {
        const { data: closings } = await supabase
          .from("sb_daily_closing")
          .select("total_sales, total_fees, net_sales")
          .eq("store_id", store.id)
          .gte("date", thirtyDaysAgo)
          .is("deleted_at", null);

        const rows = closings ?? [];
        results.push({
          id: store.id,
          name: store.store_name,
          totalSales: rows.reduce((s, r) => s + r.total_sales, 0),
          totalFees: rows.reduce((s, r) => s + r.total_fees, 0),
          netSales: rows.reduce((s, r) => s + r.net_sales, 0),
          closingCount: rows.length,
        });
      }
      setStats(results);
      setLoading(false);
    });
  }, []);

  if (loading || stats.length <= 1) return null;

  const maxSales = Math.max(...stats.map((s) => s.totalSales), 1);

  return (
    <section className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">다매장 비교 (30일)</h3>
      </div>

      <div className="space-y-3">
        {stats.map((s) => {
          const pct = Math.round((s.totalSales / maxSales) * 100);
          return (
            <div key={s.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Store size={13} className="text-[var(--text-tertiary)]" />
                  <span className="text-body-small font-medium text-[var(--text-primary)]">{s.name}</span>
                </div>
                <span className="text-caption text-[var(--text-tertiary)]">{s.closingCount}일 기록</span>
              </div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
                <span>매출 {s.totalSales.toLocaleString()}원</span>
                <span>수수료 {s.totalFees.toLocaleString()}원</span>
                <span>순매출 {s.netSales.toLocaleString()}원</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
