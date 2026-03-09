"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { formatCurrency } from "@/lib/utils/format";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface PriceHistoryCardProps {
  items: DBOrderItem[];
}

interface PricePoint {
  date: string;
  price: number;
}

interface PriceChange {
  itemId: string;
  itemName: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  history: PricePoint[];
}

export function PriceHistoryCard({ items }: PriceHistoryCardProps) {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPriceHistory = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data } = await supabase
      .from("sb_item_price_history")
      .select("item_id, date, unit_price")
      .eq("store_id", storeId)
      .gte("date", fromDate)
      .order("date", { ascending: true });

    if (!data || data.length === 0) {
      setPriceChanges([]);
      setLoading(false);
      return;
    }

    // Group by item
    const byItem = new Map<string, PricePoint[]>();
    for (const row of data) {
      const arr = byItem.get(row.item_id) ?? [];
      arr.push({ date: row.date, price: row.unit_price });
      byItem.set(row.item_id, arr);
    }

    const changes: PriceChange[] = [];
    Array.from(byItem.entries()).forEach(([itemId, history]) => {
      if (history.length < 2) return;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const current = history[history.length - 1].price;
      const previous = history[history.length - 2].price;
      const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : 0;

      if (Math.abs(changePercent) >= 1) {
        changes.push({
          itemId,
          itemName: item.item_name,
          unit: item.unit,
          currentPrice: current,
          previousPrice: previous,
          changePercent,
          history,
        });
      }
    });

    changes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    setPriceChanges(changes);
    setLoading(false);
  }, [storeId, items, supabase]);

  useEffect(() => { loadPriceHistory(); }, [loadPriceHistory]);

  if (loading) {
    return (
      <div className="glass-card p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (priceChanges.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <Minus size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-body-small text-[var(--text-tertiary)]">
          가격 변동 데이터가 아직 없어요
        </p>
        <p className="text-caption text-[var(--text-tertiary)] mt-1">
          발주를 저장하면 가격 이력이 자동으로 기록돼요
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">
        가격 변동 리포트 (최근 30일)
      </h3>

      <div className="space-y-2">
        {priceChanges.slice(0, 10).map((pc, idx) => {
          const isUp = pc.changePercent > 0;
          return (
            <motion.div
              key={pc.itemId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl ${
                isUp ? "bg-danger/5" : "bg-success/5"
              }`}
            >
              <div>
                <span className="text-body-small font-medium text-[var(--text-primary)]">
                  {pc.itemName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-caption text-[var(--text-tertiary)]">
                    {formatCurrency(pc.previousPrice)}
                  </span>
                  <span className="text-caption text-[var(--text-tertiary)]">→</span>
                  <span className="text-caption font-semibold text-[var(--text-primary)]">
                    {formatCurrency(pc.currentPrice)}/{pc.unit}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${isUp ? "text-danger" : "text-success"}`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-body-small font-display font-semibold">
                  {isUp ? "+" : ""}{pc.changePercent.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 경고: 20% 이상 변동 */}
      {priceChanges.some((pc) => Math.abs(pc.changePercent) >= 20) && (
        <div className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-caption font-medium text-warning">
            20% 이상 가격 변동 품목이 있어요! 거래처 확인을 권장합니다.
          </p>
        </div>
      )}
    </motion.div>
  );
}
