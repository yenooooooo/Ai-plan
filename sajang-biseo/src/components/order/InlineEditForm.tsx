"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";
import { UNITS } from "@/lib/order/templates";

export interface InlineEditFormProps {
  item: DBOrderItem;
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
  onCancel: () => void;
}

export function InlineEditForm({ item, groupId, onSave, onCancel }: InlineEditFormProps) {
  const [name, setName] = useState(item.item_name);
  const [unit, setUnit] = useState(item.unit);
  const [unitPrice, setUnitPrice] = useState(item.unit_price?.toString() ?? "");
  const [defaultQty, setDefaultQty] = useState(item.default_order_qty?.toString() ?? "1");
  const [shelfLife, setShelfLife] = useState(item.shelf_life_days?.toString() ?? "");
  const [supplierName, setSupplierName] = useState(item.supplier_name ?? "");
  const [supplierContact, setSupplierContact] = useState(item.supplier_contact ?? "");

  const handleSave = () => {
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
  };

  const inputCls = "w-full bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 text-body-small text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary-500/50";
  const labelCls = "text-[11px] text-[var(--text-tertiary)] mb-0.5 block";

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-2 py-3 space-y-2.5 bg-[var(--bg-secondary)] rounded-xl mx-1 mb-2">
        <div>
          <label className={labelCls}>품목명</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>단위</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>1단위 가격</label>
            <input type="text" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value.replace(/[^0-9]/g, ""))} placeholder="₩" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>기본 발주량</label>
            <input type="text" value={defaultQty} onChange={(e) => setDefaultQty(e.target.value.replace(/[^0-9.]/g, ""))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>유통기한 (일)</label>
            <input type="text" value={shelfLife} onChange={(e) => setShelfLife(e.target.value.replace(/[^0-9]/g, ""))} placeholder="선택" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>거래처명</label>
            <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="선택" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input type="text" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="선택" className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} disabled={!name.trim()}
            className="flex-1 h-9 rounded-xl bg-primary-500 text-white text-body-small font-medium flex items-center justify-center gap-1 disabled:opacity-40">
            <Check size={14} />수정 완료
          </button>
          <button onClick={onCancel}
            className="h-9 px-4 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]">
            취소
          </button>
        </div>
      </div>
    </motion.div>
  );
}
