"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";
import { UNITS } from "@/lib/order/templates";

interface ItemGroupAccordionProps {
  group: OrderItemGroup;
  items: DBOrderItem[];
  onAddItem: (groupId: string) => void;
  onEditItem: (item: DBOrderItem) => void;
  onSaveItem: (data: {
    item_name: string;
    unit: string;
    unit_price: number | null;
    default_order_qty: number;
    shelf_life_days: number | null;
    supplier_name: string | null;
    supplier_contact: string | null;
    group_id: string;
  }) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string, isActive: boolean) => void;
  editingItemId: string | null;
  onSetEditingItemId: (id: string | null) => void;
}

/** 인라인 수정 폼 */
function InlineEditForm({
  item,
  groupId,
  onSave,
  onCancel,
}: {
  item: DBOrderItem;
  groupId: string;
  onSave: ItemGroupAccordionProps["onSaveItem"];
  onCancel: () => void;
}) {
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
        {/* 품목명 */}
        <div>
          <label className={labelCls}>품목명</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus className={inputCls} />
        </div>

        {/* 단위 + 가격 */}
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

        {/* 기본발주량 + 유통기한 */}
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

        {/* 거래처 */}
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

        {/* 버튼 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-9 rounded-xl bg-primary-500 text-white text-body-small font-medium flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Check size={14} />수정 완료
          </button>
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]"
          >
            취소
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ItemGroupAccordion({
  group,
  items,
  onAddItem,
  onSaveItem,
  onDeleteItem,
  onToggleItem,
  editingItemId,
  onSetEditingItemId,
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
                <div key={item.id}>
                  <div
                    className={`flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                      editingItemId === item.id ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-tertiary)]"
                    }`}
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
                        onClick={() => onSetEditingItemId(editingItemId === item.id ? null : item.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          editingItemId === item.id
                            ? "text-primary-500"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        }`}
                      >
                        {editingItemId === item.id ? <X size={14} /> : <Pencil size={14} />}
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 인라인 수정 패널 */}
                  <AnimatePresence>
                    {editingItemId === item.id && (
                      <InlineEditForm
                        item={item}
                        groupId={item.group_id ?? group.id}
                        onSave={(data) => {
                          onSaveItem(data);
                          onSetEditingItemId(null);
                        }}
                        onCancel={() => onSetEditingItemId(null)}
                      />
                    )}
                  </AnimatePresence>
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
