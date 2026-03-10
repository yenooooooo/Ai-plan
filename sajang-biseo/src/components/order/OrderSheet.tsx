"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageSquare } from "lucide-react";
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
}

interface SupplierGroup {
  supplierName: string;
  supplierContact: string | null;
  items: { name: string; qty: number; unit: string; unitPrice: number | null }[];
  total: number;
}

export function OrderSheet({ confirmedItems, itemsMap, orderDate }: OrderSheetProps) {
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
      // fallback: textarea 방식
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <h3 className="text-heading-md text-[var(--text-primary)] mb-4">
        발주서
      </h3>

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
            <div className="space-y-1">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-caption text-[var(--text-secondary)]">
                    {item.name}
                  </span>
                  <span className="text-caption font-display text-[var(--text-primary)]">
                    {item.qty}{item.unit}
                    {item.unitPrice ? (
                      <span className="text-[var(--text-tertiary)] ml-1">
                        ({formatCurrency(item.unitPrice * item.qty, { showSymbol: false })})
                      </span>
                    ) : null}
                  </span>
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
