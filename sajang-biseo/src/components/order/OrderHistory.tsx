"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { formatCurrency } from "@/lib/utils/format";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface OrderHistoryProps {
  items: DBOrderItem[];
}

interface DailyOrderRecord {
  date: string;
  entries: { itemId: string; itemName: string; unit: string; qty: number; unitPrice: number | null; supplier: string | null }[];
  totalCost: number;
}

export function OrderHistory({ items }: OrderHistoryProps) {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const [records, setRecords] = useState<DailyOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const itemMap = useMemo(() => {
    const m = new Map<string, DBOrderItem>();
    for (const item of items) m.set(item.id, item);
    return m;
  }, [items]);

  const loadHistory = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data } = await supabase
      .from("sb_daily_orders")
      .select("*")
      .eq("store_id", storeId)
      .gte("date", fromDate)
      .order("date", { ascending: false });

    if (!data || data.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    // Group by date
    const byDate = new Map<string, DailyOrderRecord>();
    for (const row of data) {
      const item = itemMap.get(row.item_id);
      const entry = {
        itemId: row.item_id,
        itemName: item?.item_name ?? "삭제된 품목",
        unit: item?.unit ?? "",
        qty: row.order_qty,
        unitPrice: row.unit_price_at_order,
        supplier: row.supplier_name,
      };

      const existing = byDate.get(row.date);
      if (existing) {
        existing.entries.push(entry);
        existing.totalCost += (entry.unitPrice ?? 0) * entry.qty;
      } else {
        byDate.set(row.date, {
          date: row.date,
          entries: [entry],
          totalCost: (entry.unitPrice ?? 0) * entry.qty,
        });
      }
    }

    setRecords(Array.from(byDate.values()));
    setLoading(false);
  }, [storeId, supabase, itemMap]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  if (loading) {
    return (
      <div className="glass-card p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <Calendar size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-body-small text-[var(--text-tertiary)]">
          발주 이력이 없어요
        </p>
        <p className="text-caption text-[var(--text-tertiary)] mt-1">
          발주를 저장하면 여기에 이력이 쌓여요
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
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} className="text-primary-500" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">
          발주 이력 (최근 30일)
        </h3>
      </div>

      <div className="space-y-2">
        {records.map((record) => {
          const isExpanded = expandedDate === record.date;
          const dateLabel = new Date(record.date + "T00:00:00").toLocaleDateString("ko-KR", {
            month: "short", day: "numeric", weekday: "short",
          });

          return (
            <div key={record.date} className="bg-[var(--bg-tertiary)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedDate(isExpanded ? null : record.date)}
                className="w-full flex items-center justify-between p-3 press-effect"
              >
                <div className="flex items-center gap-2">
                  <span className="text-body-small font-medium text-[var(--text-primary)]">
                    {dateLabel}
                  </span>
                  <span className="text-caption text-[var(--text-tertiary)]">
                    {record.entries.length}개 품목
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {record.totalCost > 0 && (
                    <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">
                      {formatCurrency(record.totalCost)}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={14} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={14} className="text-[var(--text-tertiary)]" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1 border-t border-[var(--border-subtle)]">
                      {record.entries.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <div>
                            <span className="text-caption text-[var(--text-primary)]">{entry.itemName}</span>
                            {entry.supplier && (
                              <span className="text-[10px] text-[var(--text-tertiary)] ml-1.5">({entry.supplier})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-caption font-display text-[var(--text-secondary)]">
                              {entry.qty}{entry.unit}
                            </span>
                            {entry.unitPrice && (
                              <span className="text-caption text-[var(--text-tertiary)]">
                                {formatCurrency(entry.unitPrice * entry.qty)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
