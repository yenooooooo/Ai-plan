"use client";

import { motion } from "framer-motion";
import { Package, TrendingDown, TrendingUp } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface StockFlowCardProps {
  items: DBOrderItem[];
  stockMap: Record<string, number>;
  usageMap: Record<string, number>;
  wasteMap: Record<string, number>;
  orderMap: Record<string, number>;
}

interface FlowItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  todayUsage: number;
  todayWaste: number;
  remainingStock: number;
  orderQty: number;
  tomorrowStock: number;
}

export function StockFlowCard({ items, stockMap, usageMap, wasteMap, orderMap }: StockFlowCardProps) {
  const flowItems: FlowItem[] = items
    .filter((item) => {
      const stock = stockMap[item.id] ?? 0;
      const usage = usageMap[item.id] ?? 0;
      const order = orderMap[item.id] ?? 0;
      return stock > 0 || usage > 0 || order > 0;
    })
    .map((item) => {
      const currentStock = stockMap[item.id] ?? 0;
      const todayUsage = usageMap[item.id] ?? 0;
      const todayWaste = wasteMap[item.id] ?? 0;
      const remainingStock = Math.max(0, currentStock - todayUsage - todayWaste);
      const orderQty = orderMap[item.id] ?? 0;
      const tomorrowStock = remainingStock + orderQty;
      return {
        id: item.id,
        name: item.item_name,
        unit: item.unit,
        currentStock,
        todayUsage,
        todayWaste,
        remainingStock,
        orderQty,
        tomorrowStock,
      };
    });

  if (flowItems.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Package size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-body-small text-[var(--text-tertiary)]">
          사용량 입력 후 재고 흐름을 확인할 수 있어요
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
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-primary-500" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">
          재고 흐름
        </h3>
        <span className="text-caption text-[var(--text-tertiary)]">
          오늘 → 내일
        </span>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-5 gap-1 text-[10px] text-[var(--text-tertiary)] font-medium mb-2 px-1">
        <span>품목</span>
        <span className="text-center">현재고</span>
        <span className="text-center">사용</span>
        <span className="text-center">발주</span>
        <span className="text-right">내일</span>
      </div>

      <div className="space-y-1">
        {flowItems.map((fi, idx) => {
          const isLow = fi.tomorrowStock < fi.todayUsage * 0.5;
          return (
            <motion.div
              key={fi.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`grid grid-cols-5 gap-1 items-center py-2 px-1 rounded-lg ${
                isLow ? "bg-danger/5" : "bg-[var(--bg-tertiary)]/50"
              }`}
            >
              <span className="text-caption font-medium text-[var(--text-primary)] truncate">
                {fi.name}
              </span>
              <span className="text-caption text-center font-display text-[var(--text-secondary)]">
                {fi.currentStock}{fi.unit}
              </span>
              <span className="text-caption text-center font-display text-danger">
                -{fi.todayUsage}{fi.unit}
              </span>
              <span className={`text-caption text-center font-display ${fi.orderQty > 0 ? "text-success font-semibold" : "text-[var(--text-tertiary)]"}`}>
                {fi.orderQty > 0 ? `+${fi.orderQty}` : "-"}{fi.orderQty > 0 ? fi.unit : ""}
              </span>
              <span className={`text-caption text-right font-display font-semibold ${
                isLow ? "text-danger" : "text-[var(--text-primary)]"
              }`}>
                {fi.tomorrowStock.toFixed(1)}{fi.unit}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* 요약 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5">
          <TrendingDown size={13} className="text-danger" />
          <span className="text-caption text-[var(--text-tertiary)]">
            부족 예상: {flowItems.filter((f) => f.tomorrowStock < f.todayUsage * 0.5).length}개
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package size={13} className="text-success" />
          <span className="text-caption text-[var(--text-tertiary)]">
            발주: {flowItems.filter((f) => f.orderQty > 0).length}개
          </span>
        </div>
      </div>
    </motion.div>
  );
}
