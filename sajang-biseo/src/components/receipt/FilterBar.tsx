"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { ReceiptCategory } from "@/lib/supabase/types";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";

export interface ReceiptFilter {
  dateFrom: string;
  dateTo: string;
  categoryIds: string[];
  paymentMethods: string[];
  amountMin: string;
  amountMax: string;
  weekdays: number[]; // 0=일 ~ 6=토
}

interface FilterBarProps {
  filter: ReceiptFilter;
  onChange: (filter: ReceiptFilter) => void;
  categories: ReceiptCategory[];
}

const QUICK_DATES = [
  { label: "오늘", key: "today" },
  { label: "이번주", key: "week" },
  { label: "이번달", key: "month" },
  { label: "직접선택", key: "custom" },
] as const;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function FilterBar({ filter, onChange, categories }: FilterBarProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeCount = [
    filter.categoryIds.length > 0,
    filter.paymentMethods.length > 0 && filter.paymentMethods.length < 3,
    filter.amountMin || filter.amountMax,
    filter.weekdays.length > 0 && filter.weekdays.length < 7,
  ].filter(Boolean).length;

  function applyQuickDate(key: string) {
    const now = new Date();
    let from = "", to = "";
    if (key === "today") {
      from = to = now.toISOString().split("T")[0];
    } else if (key === "week") {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      from = monday.toISOString().split("T")[0];
      to = now.toISOString().split("T")[0];
    } else if (key === "month") {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      to = now.toISOString().split("T")[0];
    }
    onChange({ ...filter, dateFrom: from, dateTo: to });
  }

  function toggleCategory(id: string) {
    const next = filter.categoryIds.includes(id)
      ? filter.categoryIds.filter((c) => c !== id)
      : [...filter.categoryIds, id];
    onChange({ ...filter, categoryIds: next });
  }

  function togglePayment(m: string) {
    const next = filter.paymentMethods.includes(m)
      ? filter.paymentMethods.filter((p) => p !== m)
      : [...filter.paymentMethods, m];
    onChange({ ...filter, paymentMethods: next });
  }

  function toggleWeekday(d: number) {
    const next = filter.weekdays.includes(d)
      ? filter.weekdays.filter((w) => w !== d)
      : [...filter.weekdays, d];
    onChange({ ...filter, weekdays: next });
  }

  function clearAll() {
    onChange({
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      categoryIds: [],
      paymentMethods: [],
      amountMin: "",
      amountMax: "",
      weekdays: [],
    });
  }

  return (
    <div className="glass-card p-4 space-y-3">
      {/* 기간 */}
      <div>
        <div className="flex gap-2 mb-2">
          {QUICK_DATES.map((qd) => (
            <button
              key={qd.key}
              onClick={() => qd.key !== "custom" ? applyQuickDate(qd.key) : setExpanded("date")}
              className="px-3 py-1.5 rounded-lg text-caption font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors press-effect"
            >
              {qd.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={filter.dateFrom}
            onChange={(e) => onChange({ ...filter, dateFrom: e.target.value })}
            className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
          <span className="text-caption text-[var(--text-tertiary)]">~</span>
          <input type="date" value={filter.dateTo}
            onChange={(e) => onChange({ ...filter, dateTo: e.target.value })}
            className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
        </div>
      </div>

      {/* 활성 필터 칩 */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filter.categoryIds.map((id) => {
            const cat = categories.find((c) => c.id === id);
            return cat ? (
              <Chip key={id} label={cat.label} color={CATEGORY_COLORS[cat.code]}
                onRemove={() => toggleCategory(id)} />
            ) : null;
          })}
          {filter.paymentMethods.length > 0 && filter.paymentMethods.length < 3 &&
            filter.paymentMethods.map((m) => (
              <Chip key={m} label={m} onRemove={() => togglePayment(m)} />
            ))}
          {(filter.amountMin || filter.amountMax) && (
            <Chip label={`₩${filter.amountMin || "0"}~${filter.amountMax || "∞"}`}
              onRemove={() => onChange({ ...filter, amountMin: "", amountMax: "" })} />
          )}
          <button onClick={clearAll} className="text-caption text-danger hover:underline">
            초기화
          </button>
        </div>
      )}

      {/* 확장 필터 토글 */}
      <button
        onClick={() => setExpanded(expanded ? null : "detail")}
        className="flex items-center gap-1 text-caption text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        상세 필터
        <motion.div animate={{ rotate: expanded === "detail" ? 180 : 0 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded === "detail" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* 카테고리 */}
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">카테고리</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      filter.categoryIds.includes(cat.id)
                        ? "bg-primary-500/15 text-primary-500"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 결제수단 */}
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">결제수단</label>
              <div className="flex gap-2">
                {["카드", "현금", "이체"].map((m) => (
                  <button key={m} onClick={() => togglePayment(m)}
                    className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-colors ${
                      filter.paymentMethods.includes(m)
                        ? "bg-primary-500/15 text-primary-500"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 금액 범위 */}
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">금액 범위</label>
              <div className="flex items-center gap-2">
                <input type="text" value={filter.amountMin} placeholder="최소"
                  onChange={(e) => onChange({ ...filter, amountMin: e.target.value.replace(/[^0-9]/g, "") })}
                  className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
                <span className="text-caption text-[var(--text-tertiary)]">~</span>
                <input type="text" value={filter.amountMax} placeholder="최대"
                  onChange={(e) => onChange({ ...filter, amountMax: e.target.value.replace(/[^0-9]/g, "") })}
                  className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
              </div>
            </div>

            {/* 요일 */}
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">요일</label>
              <div className="flex gap-1.5">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button key={i} onClick={() => toggleWeekday(i)}
                    className={`w-9 h-9 rounded-lg text-caption font-medium transition-colors ${
                      filter.weekdays.includes(i)
                        ? "bg-primary-500/15 text-primary-500"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[11px] font-medium">
      {color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      {label}
      <button onClick={onRemove}><X size={10} /></button>
    </span>
  );
}
