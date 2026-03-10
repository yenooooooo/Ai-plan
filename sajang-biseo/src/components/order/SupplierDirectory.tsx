"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, ChevronDown, Building2, Users } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

interface SupplierDirectoryProps {
  items: DBOrderItem[];
}

interface SupplierInfo {
  name: string;
  contact: string | null;
  items: { id: string; name: string; unit: string; unitPrice: number | null }[];
}

export function SupplierDirectory({ items }: SupplierDirectoryProps) {
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const suppliers: SupplierInfo[] = useMemo(() => {
    const map = new Map<string, SupplierInfo>();
    const noSupplierItems: SupplierInfo = { name: "미지정", contact: null, items: [] };

    for (const item of items) {
      if (item.deleted_at) continue;
      const entry = { id: item.id, name: item.item_name, unit: item.unit, unitPrice: item.unit_price };

      if (item.supplier_name) {
        const key = item.supplier_name.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.items.push(entry);
          if (!existing.contact && item.supplier_contact) existing.contact = item.supplier_contact;
        } else {
          map.set(key, { name: item.supplier_name, contact: item.supplier_contact, items: [entry] });
        }
      } else {
        noSupplierItems.items.push(entry);
      }
    }

    const result = Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
    if (noSupplierItems.items.length > 0) result.push(noSupplierItems);
    return result;
  }, [items]);

  if (suppliers.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Building2 size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-body-small text-[var(--text-tertiary)]">등록된 거래처가 없어요</p>
        <p className="text-caption text-[var(--text-tertiary)] mt-1">품목 수정에서 거래처 정보를 입력하세요</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-primary-500" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">
          거래처 관리
        </h3>
        <span className="text-caption text-[var(--text-tertiary)]">{suppliers.length}곳</span>
      </div>

      <div className="space-y-2">
        {suppliers.map((supplier) => {
          const isExpanded = expandedSupplier === supplier.name;
          return (
            <div key={supplier.name} className="bg-[var(--bg-tertiary)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSupplier(isExpanded ? null : supplier.name)}
                className="w-full flex items-center justify-between p-3 press-effect"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 size={14} className="text-[var(--text-tertiary)] shrink-0" />
                  <span className="text-body-small font-medium text-[var(--text-primary)] truncate">
                    {supplier.name}
                  </span>
                  <span className="text-caption text-[var(--text-tertiary)] shrink-0">
                    {supplier.items.length}개 품목
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {supplier.contact && (
                    <div className="flex gap-1">
                      <a
                        href={`tel:${supplier.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center text-success"
                      >
                        <Phone size={13} />
                      </a>
                      <a
                        href={`sms:${supplier.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500"
                      >
                        <MessageCircle size={13} />
                      </a>
                    </div>
                  )}
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
                  </motion.div>
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
                      {supplier.contact && (
                        <p className="text-caption text-[var(--text-tertiary)] py-1">{supplier.contact}</p>
                      )}
                      {supplier.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1">
                          <span className="text-caption text-[var(--text-secondary)]">{item.name}</span>
                          <span className="text-caption text-[var(--text-tertiary)]">
                            {item.unit}
                            {item.unitPrice ? ` · ₩${item.unitPrice.toLocaleString()}` : ""}
                          </span>
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
