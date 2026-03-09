"use client";

import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import { formatCurrency } from "@/lib/utils/format";
import { parseDate, getDayName } from "@/lib/utils/date";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ReceiptListProps {
  receipts: Receipt[];
  categories: ReceiptCategory[];
  groupBy: "date" | "category";
  onItemClick: (receipt: Receipt) => void;
}

interface DateGroup {
  date: string;
  label: string;
  subtotal: number;
  items: Receipt[];
}

interface CategoryGroup {
  categoryId: string | null;
  label: string;
  icon: string;
  color: string;
  subtotal: number;
  count: number;
  items: Receipt[];
}

export function ReceiptList({ receipts, categories, groupBy, onItemClick }: ReceiptListProps) {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  if (receipts.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-body-small text-[var(--text-tertiary)]">
          아직 영수증이 없어요.
          <br />
          첫 영수증을 촬영해보세요!
        </p>
      </div>
    );
  }

  if (groupBy === "date") {
    return <DateGroupView receipts={receipts} catMap={catMap} onItemClick={onItemClick} />;
  }
  return <CategoryGroupView receipts={receipts} catMap={catMap} onItemClick={onItemClick} />;
}

/** 날짜별 그룹 뷰 */
function DateGroupView({
  receipts,
  catMap,
  onItemClick,
}: {
  receipts: Receipt[];
  catMap: Map<string, ReceiptCategory>;
  onItemClick: (r: Receipt) => void;
}) {
  // 날짜별 그룹핑
  const groups: DateGroup[] = [];
  const dateMap = new Map<string, Receipt[]>();

  for (const r of receipts) {
    const arr = dateMap.get(r.date) ?? [];
    arr.push(r);
    dateMap.set(r.date, arr);
  }

  Array.from(dateMap.entries()).forEach(([date, items]) => {
    const d = parseDate(date);
    const dayName = getDayName(d);
    groups.push({
      date,
      label: `${d.getMonth() + 1}/${d.getDate()} (${dayName})`,
      subtotal: items.reduce((s, i) => s + i.total_amount, 0),
      items,
    });
  });

  groups.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.date}>
          {/* 날짜 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-small font-semibold text-[var(--text-primary)]">
              {group.label}
            </span>
            <span className="text-caption font-display text-[var(--text-secondary)]">
              소계 {formatCurrency(group.subtotal)}
            </span>
          </div>
          <div className="space-y-1.5">
            {group.items.map((item, i) => (
              <ReceiptRow key={item.id} receipt={item} catMap={catMap} onClick={() => onItemClick(item)} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 카테고리별 그룹 뷰 */
function CategoryGroupView({
  receipts,
  catMap,
  onItemClick,
}: {
  receipts: Receipt[];
  catMap: Map<string, ReceiptCategory>;
  onItemClick: (r: Receipt) => void;
}) {
  const groups: CategoryGroup[] = [];
  const cMap = new Map<string | null, Receipt[]>();

  for (const r of receipts) {
    const key = r.category_id;
    const arr = cMap.get(key) ?? [];
    arr.push(r);
    cMap.set(key, arr);
  }

  Array.from(cMap.entries()).forEach(([catId, items]) => {
    const cat = catId ? catMap.get(catId) : null;
    groups.push({
      categoryId: catId,
      label: cat?.label ?? "미분류",
      icon: cat?.icon ?? "📋",
      color: CATEGORY_COLORS[cat?.code ?? "F99"] ?? "#6B7280",
      subtotal: items.reduce((s, i) => s + i.total_amount, 0),
      count: items.length,
      items,
    });
  });

  groups.sort((a, b) => b.subtotal - a.subtotal);
  const total = receipts.reduce((s, r) => s + r.total_amount, 0);

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const pct = total > 0 ? ((group.subtotal / total) * 100).toFixed(1) : "0";
        return (
          <div key={group.categoryId ?? "null"} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b border-[var(--border-subtle)]">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: group.color }} />
              <div className="flex-1">
                <span className="text-body-small font-semibold text-[var(--text-primary)]">
                  {group.icon} {group.label}
                </span>
                <span className="text-caption text-[var(--text-tertiary)] ml-2">{group.count}건</span>
              </div>
              <div className="text-right">
                <p className="text-body-small font-display text-[var(--text-primary)]">
                  {formatCurrency(group.subtotal)}
                </p>
                <p className="text-caption text-[var(--text-tertiary)]">{pct}%</p>
              </div>
            </div>
            <div className="px-3 py-1">
              {group.items.slice(0, 5).map((item, i) => (
                <ReceiptRow key={item.id} receipt={item} catMap={catMap} onClick={() => onItemClick(item)} index={i} compact />
              ))}
              {group.items.length > 5 && (
                <p className="text-caption text-[var(--text-tertiary)] text-center py-2">
                  +{group.items.length - 5}건 더
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 영수증 한 줄 */
function ReceiptRow({
  receipt,
  catMap,
  onClick,
  index,
  compact,
}: {
  receipt: Receipt;
  catMap: Map<string, ReceiptCategory>;
  onClick: () => void;
  index: number;
  compact?: boolean;
}) {
  const cat = receipt.category_id ? catMap.get(receipt.category_id) : null;
  const color = CATEGORY_COLORS[cat?.code ?? "F99"] ?? "#6B7280";

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
    >
      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <span className="text-body-small text-[var(--text-primary)] truncate block">
          {receipt.merchant_name}
        </span>
        {!compact && (
          <span className="text-caption text-[var(--text-tertiary)]">
            {cat?.label ?? "미분류"} · {receipt.payment_method}
          </span>
        )}
      </div>
      <span className="text-body-small font-display text-[var(--text-primary)] flex-shrink-0">
        {formatCurrency(receipt.total_amount)}
      </span>
    </motion.button>
  );
}
