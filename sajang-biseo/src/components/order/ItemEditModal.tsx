"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";
import { UNITS } from "@/lib/order/templates";

interface ItemEditModalProps {
  item?: DBOrderItem | null;
  groupId: string;
  onSave: (data: {
    item_name: string;
    unit: string;
    unit_price: number | null;
    default_order_qty: number;
    shelf_life_days: number | null;
    supplier_name: string | null;
    supplier_contact: string | null;
    group_id: string;
  }) => void;
  onClose: () => void;
}

export function ItemEditModal({ item, groupId, onSave, onClose }: ItemEditModalProps) {
  const [name, setName] = useState(item?.item_name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "kg");
  const [unitPrice, setUnitPrice] = useState(item?.unit_price?.toString() ?? "");
  const [defaultQty, setDefaultQty] = useState(item?.default_order_qty?.toString() ?? "1");
  const [shelfLife, setShelfLife] = useState(item?.shelf_life_days?.toString() ?? "");
  const [supplierName, setSupplierName] = useState(item?.supplier_name ?? "");
  const [supplierContact, setSupplierContact] = useState(item?.supplier_contact ?? "");

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      item_name: name.trim(),
      unit,
      unit_price: unitPrice ? parseInt(unitPrice.replace(/,/g, "")) : null,
      default_order_qty: parseFloat(defaultQty) || 1,
      shelf_life_days: shelfLife ? parseInt(shelfLife) : null,
      supplier_name: supplierName.trim() || null,
      supplier_contact: supplierContact.trim() || null,
      group_id: groupId,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-[var(--bg-elevated)] rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-heading-md text-[var(--text-primary)]">
            {item ? "품목 수정" : "품목 추가"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-tertiary)]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 품목명 */}
          <div>
            <label className="text-caption text-[var(--text-secondary)] mb-1 block">품목명 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 삼겹살"
              autoFocus
              className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
            />
          </div>

          {/* 단위 + 가격 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">단위 *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">1단위 가격</label>
              <input
                type="text"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="₩"
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>

          {/* 기본 발주량 + 유통기한 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">기본 발주량</label>
              <input
                type="text"
                value={defaultQty}
                onChange={(e) => setDefaultQty(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">유통기한 (일)</label>
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="선택"
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>

          {/* 거래처 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">거래처명</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="선택"
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">연락처</label>
              <input
                type="text"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                placeholder="선택"
                className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-body-small press-effect disabled:opacity-40 disabled:pointer-events-none"
        >
          {item ? "수정 완료" : "추가하기"}
        </button>
      </motion.div>
    </motion.div>
  );
}
