"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";

interface ItemGroupAccordionProps {
  group: OrderItemGroup;
  items: DBOrderItem[];
  onAddItem: (groupId: string) => void;
  onEditItem: (item: DBOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string, isActive: boolean) => void;
}

export function ItemGroupAccordion({
  group,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
}: ItemGroupAccordionProps) {
  const [open, setOpen] = useState(true);
  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="glass-card overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 press-effect"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{group.icon ?? "📦"}</span>
          <span className="text-body-small font-semibold text-[var(--text-primary)]">
            {group.group_name}
          </span>
          <span className="text-caption text-[var(--text-tertiary)]">
            {activeCount}개
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-[var(--text-tertiary)]" />
        </motion.div>
      </button>

      {/* 품목 리스트 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-3 space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleItem(item.id, !item.is_active)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        item.is_active
                          ? "bg-primary-500 border-primary-500"
                          : "border-[var(--border-default)]"
                      }`}
                    >
                      {item.is_active && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className={`text-body-small ${item.is_active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] line-through"}`}>
                        {item.item_name}
                      </span>
                      <span className="text-caption text-[var(--text-tertiary)] ml-2">
                        {item.unit}
                        {item.unit_price ? ` · ₩${item.unit_price.toLocaleString()}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* 품목 추가 버튼 */}
              <button
                onClick={() => onAddItem(group.id)}
                className="flex items-center gap-2 w-full py-2 px-2 rounded-lg text-primary-500 hover:bg-primary-500/5 transition-colors"
              >
                <Plus size={16} />
                <span className="text-body-small">품목 추가</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
