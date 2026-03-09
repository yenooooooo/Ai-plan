"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface ShelfLifeAlertProps {
  items: DBOrderItem[];
  stockMap: Record<string, number>;
  usageMap: Record<string, number>;
}

interface AlertItem {
  name: string;
  unit: string;
  shelfLifeDays: number;
  remainingStock: number;
  dailyUsage: number;
  daysToExpiry: number;
  daysOfStock: number;
  isExpiring: boolean;
}

export function ShelfLifeAlert({ items, stockMap, usageMap }: ShelfLifeAlertProps) {
  const alerts: AlertItem[] = useMemo(() => {
    return items
      .filter((item) => item.shelf_life_days && item.shelf_life_days > 0)
      .map((item) => {
        const remaining = stockMap[item.id] ?? 0;
        const dailyUsage = usageMap[item.id] ?? item.default_order_qty ?? 1;
        const daysOfStock = dailyUsage > 0 ? remaining / dailyUsage : 999;
        const shelfLifeDays = item.shelf_life_days!;
        // 유통기한 내 소진 가능 여부
        const isExpiring = daysOfStock > shelfLifeDays;

        return {
          name: item.item_name,
          unit: item.unit,
          shelfLifeDays,
          remainingStock: remaining,
          dailyUsage,
          daysToExpiry: shelfLifeDays,
          daysOfStock: Math.round(daysOfStock * 10) / 10,
          isExpiring,
        };
      })
      .filter((a) => a.isExpiring && a.remainingStock > 0)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [items, stockMap, usageMap]);

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-warning" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">
          유통기한 주의
        </h3>
        <span className="text-caption text-warning font-medium">{alerts.length}개</span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-warning/5 border border-warning/15"
          >
            <div>
              <span className="text-body-small font-medium text-[var(--text-primary)]">
                {alert.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-caption text-[var(--text-tertiary)]">
                  재고 {alert.remainingStock}{alert.unit}
                </span>
                <span className="text-caption text-[var(--text-tertiary)]">
                  유통기한 {alert.shelfLifeDays}일
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-warning">
              <AlertTriangle size={13} />
              <span className="text-caption font-semibold">
                {alert.daysOfStock}일분 재고
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
        현재 사용량 기준으로 유통기한 내 소진이 어려운 품목이에요
      </p>
    </motion.div>
  );
}
