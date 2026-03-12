"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageSquare, Minus, Plus, X, RotateCcw } from "lucide-react";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils/format";

interface ConfirmedItem {
  itemId: string;
  qty: number;
}

interface OrderSheetProps {
  confirmedItems: ConfirmedItem[];
  itemsMap: Map<string, DBOrderItem>;
  orderDate: string;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQty?: (itemId: string, qty: number) => void;
  onClearAll?: () => void;
}

interface SupplierGroup {
  supplierName: string;
  supplierContact: string | null;
  items: { itemId: string; name: string; qty: number; unit: string; unitPrice: number | null }[];
  total: number;
}

export function OrderSheet({ confirmedItems, itemsMap, orderDate, onRemoveItem, onUpdateQty, onClearAll }: OrderSheetProps) {
  const [copied, setCopied] = useState(false);

  // 거래처별 그룹핑
  const supplierGroups: SupplierGroup[] = [];
  const noSupplierItems: SupplierGroup = {
    supplierName: "미지정",
    supplierContact: null,
    items: [],
    total: 0,
  };

  for (const ci of confirmedItems) {
    const item = itemsMap.get(ci.itemId);
    if (!item) continue;

    const entry = {
      itemId: ci.itemId,
      name: item.item_name,
      qty: ci.qty,
      unit: item.unit,
      unitPrice: item.unit_price,
    };
    const cost = (item.unit_price ?? 0) * ci.qty;

    if (item.supplier_name) {
      let group = supplierGroups.find((g) => g.supplierName.toLowerCase() === item.supplier_name!.toLowerCase());
      if (!group) {
        group = {
          supplierName: item.supplier_name!,
          supplierContact: item.supplier_contact,
          items: [],
          total: 0,
        };
        supplierGroups.push(group);
      }
      group.items.push(entry);
      group.total += cost;
    } else {
      noSupplierItems.items.push(entry);
      noSupplierItems.total += cost;
    }
  }

  if (noSupplierItems.items.length > 0) {
    supplierGroups.push(noSupplierItems);
  }

  const grandTotal = supplierGroups.reduce((s, g) => s + g.total, 0);
  const totalItemCount = confirmedItems.length;

  // 텍스트 생성
  function generateText(): string {
    const lines: string[] = [];
    for (const group of supplierGroups) {
      lines.push(`[거래처: ${group.supplierName}] ${orderDate} 발주`);
      for (const item of group.items) {
        const price = item.unitPrice ? ` (${formatCurrency(item.unitPrice * item.qty, { showSymbol: true })})` : "";
        lines.push(`- ${item.name} ${item.qty}${item.unit}${price}`);
      }
      if (group.total > 0) {
        lines.push(`합계: ${formatCurrency(group.total)}`);
      }
      lines.push("");
    }
    if (grandTotal > 0) {
      lines.push(`총 합계: ${formatCurrency(grandTotal)}`);
    }
    return lines.join("\n");
  }

  async function handleCopy() {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (confirmedItems.length === 0) return null;

  // 수량 변경 핸들러 (recalc totals reactively)
  const handleQtyChange = (itemId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, +(currentQty + delta).toFixed(1));
    onUpdateQty?.(itemId, newQty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      {/* 헤더: 발주서 타이틀 + 전체 초기화 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-md text-[var(--text-primary)]">
          발주서
          <span className="ml-2 text-caption font-normal text-[var(--text-tertiary)]">
            {totalItemCount}개 품목
          </span>
        </h3>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-caption text-[var(--text-tertiary)] hover:text-danger hover:bg-danger/5 transition-colors press-effect"
          >
            <RotateCcw size={12} />
            전체 초기화
          </button>
        )}
      </div>

      <div className="space-y-4">
        {supplierGroups.map((group) => (
          <div key={group.supplierName} className="bg-[var(--bg-tertiary)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-small font-semibold text-[var(--text-primary)]">
                {group.supplierName}
              </span>
              {group.supplierContact && (
                <a
                  href={`tel:${group.supplierContact}`}
                  className="text-caption text-primary-500"
                >
                  {group.supplierContact}
                </a>
              )}
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div key={item.itemId} className="flex items-center gap-2">
                  {/* 품목명 */}
                  <span className="flex-1 min-w-0 truncate text-caption text-[var(--text-secondary)]">
                    {item.name}
                  </span>

                  {/* 수량 조절 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleQtyChange(item.itemId, item.qty, -1)}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors press-effect"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-14 text-center text-caption font-display font-semibold text-[var(--text-primary)]">
                      {item.qty}{item.unit}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.itemId, item.qty, 1)}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 transition-colors press-effect"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* 금액 (있을 때만) */}
                  {item.unitPrice ? (
                    <span className="shrink-0 text-caption text-[var(--text-tertiary)] w-16 text-right tabular-nums">
                      {formatCurrency(item.unitPrice * item.qty, { showSymbol: false })}
                    </span>
                  ) : null}

                  {/* 삭제 버튼 */}
                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.itemId)}
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-danger hover:bg-danger/5 transition-colors press-effect shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {group.total > 0 && (
              <div className="flex justify-end mt-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">
                  {formatCurrency(group.total)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 총 합계 */}
      {grandTotal > 0 && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--border-default)]">
          <span className="text-body-small text-[var(--text-secondary)]">총 합계</span>
          <span className="text-heading-md font-display text-primary-500">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      )}

      {/* 복사 버튼 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-medium press-effect"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span>복사됨!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>카카오톡 / 문자 복사</span>
            </>
          )}
        </button>
        <button
          onClick={handleCopy}
          className="w-12 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] press-effect"
        >
          <MessageSquare size={18} />
        </button>
      </div>
    </motion.div>
  );
}
