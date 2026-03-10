"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface StockAlertBannerProps {
  items: DBOrderItem[];
  stockMap: Record<string, number>;
  avgUsageMap: Record<string, number>;
  onGoToRecommend: () => void;
}

interface AlertItem {
  name: string;
  unit: string;
  stock: number;
  avgUsage: number;
  daysLeft: number;
}

export function StockAlertBanner({ items, stockMap, avgUsageMap, onGoToRecommend }: StockAlertBannerProps) {
  const alerts: AlertItem[] = useMemo(() => {
    return items
      .filter((item) => item.is_active)
      .map((item) => {
        const stock = stockMap[item.id] ?? 0;
        const avgUsage = avgUsageMap[item.id] ?? item.default_order_qty ?? 1;
        const daysLeft = avgUsage > 0 ? stock / avgUsage : 999;
        return { name: item.item_name, unit: item.unit, stock, avgUsage, daysLeft: Math.round(daysLeft * 10) / 10 };
      })
      .filter((a) => a.stock > 0 && a.daysLeft <= 2)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [items, stockMap, avgUsageMap]);

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 border border-warning/20 bg-warning/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-body-small font-semibold text-[var(--text-primary)]">
              재고 부족 알림
              <span className="text-caption text-warning ml-1.5">{alerts.length}개 품목</span>
            </p>
            <div className="mt-1 space-y-0.5">
              {alerts.slice(0, 3).map((a) => (
                <p key={a.name} className="text-caption text-[var(--text-secondary)] truncate">
                  <span className={a.daysLeft < 1 ? "text-danger font-medium" : "text-warning"}>
                    {a.name}
                  </span>
                  {" "}— 재고 {a.stock}{a.unit} ({a.daysLeft}일분)
                </p>
              ))}
              {alerts.length > 3 && (
                <p className="text-caption text-[var(--text-tertiary)]">외 {alerts.length - 3}개</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onGoToRecommend}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-warning/10 text-caption font-medium text-warning hover:bg-warning/20 transition-colors"
        >
          발주
          <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
