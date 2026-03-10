"use client";

import { useState } from "react";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";
import { useCategoryBudget } from "@/stores/useCategoryBudget";
import { formatCurrency } from "@/lib/utils/format";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";

interface Props {
  receipts: Receipt[];
  categories: ReceiptCategory[];
}

export default function CategoryBudget({ receipts, categories }: Props) {
  const { budgets, setBudget, removeBudget } = useCategoryBudget();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const spentMap: Record<string, number> = {};
  receipts.forEach((r) => {
    if (r.category_id && !r.deleted_at) {
      spentMap[r.category_id] = (spentMap[r.category_id] ?? 0) + (r.total_amount ?? 0);
    }
  });

  const tracked = categories.filter((c) => budgets[c.id]);
  const untracked = categories.filter((c) => !budgets[c.id]);

  const startEdit = (id: string) => {
    setEditingId(id);
    setDraft(budgets[id] ? String(budgets[id]) : "");
  };

  const commitEdit = (id: string) => {
    const val = parseInt(draft, 10);
    if (val > 0) setBudget(id, val);
    else removeBudget(id);
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      {tracked.length === 0 && (
        <p className="text-caption text-center py-4">
          카테고리를 눌러 월 예산을 설정하세요
        </p>
      )}

      {tracked.map((cat) => {
        const spent = spentMap[cat.id] ?? 0;
        const budget = budgets[cat.id];
        const pct = Math.min((spent / budget) * 100, 100);
        const over = spent > budget;
        const color = CATEGORY_COLORS[cat.code] ?? "#6B7280";

        return (
          <div key={cat.id} className="glass-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-small font-medium">
                {cat.icon} {cat.label}
              </span>
              {editingId === cat.id ? (
                <input
                  type="number"
                  className="w-28 px-2 py-1 rounded bg-white/10 text-body-small text-right outline-none"
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitEdit(cat.id)}
                  onKeyDown={(e) => e.key === "Enter" && commitEdit(cat.id)}
                />
              ) : (
                <button
                  className="text-caption hover:underline"
                  onClick={() => startEdit(cat.id)}
                >
                  {formatCurrency(spent)} / {formatCurrency(budget)}
                </button>
              )}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${over ? "bg-red-500" : ""}`}
                style={{ width: `${pct}%`, backgroundColor: over ? undefined : color }}
              />
            </div>
            {over && (
              <p className="text-caption text-red-400">
                {formatCurrency(spent - budget)} 초과
              </p>
            )}
          </div>
        );
      })}

      {untracked.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {untracked.map((cat) => (
            <button
              key={cat.id}
              className="text-caption px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition"
              onClick={() => startEdit(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {editingId && !tracked.find((c) => c.id === editingId) && (
        <div className="glass-card p-3">
          <label className="text-caption block mb-1">
            {categories.find((c) => c.id === editingId)?.label} 월 예산
          </label>
          <input
            type="number"
            className="w-full px-2 py-1 rounded bg-white/10 text-body-small outline-none"
            placeholder="금액 입력"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitEdit(editingId)}
            onKeyDown={(e) => e.key === "Enter" && commitEdit(editingId)}
          />
        </div>
      )}
    </div>
  );
}
