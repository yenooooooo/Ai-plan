"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";

interface ItemSearchProps {
  items: DBOrderItem[];
  groups: OrderItemGroup[];
  onScrollToGroup: (groupId: string) => void;
}

export function ItemSearch({ items, groups, onScrollToGroup }: ItemSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const groupNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of groups) map[g.id] = g.group_name;
    return map;
  }, [groups]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => item.item_name.toLowerCase().includes(q) || (item.supplier_name ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, items]);

  const showResults = focused && query.trim().length > 0 && results.length > 0;

  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-transparent focus-within:border-primary-500/30 transition-colors">
        <Search size={16} className="text-[var(--text-tertiary)] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="품목명 또는 거래처 검색"
          className="flex-1 bg-transparent text-body-small text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-1 rounded-md hover:bg-[var(--bg-secondary)]">
            <X size={14} className="text-[var(--text-tertiary)]" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-11 left-0 right-0 z-20 glass-card p-1 shadow-lg border border-[var(--border-subtle)] max-h-60 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onMouseDown={() => {
                if (item.group_id) onScrollToGroup(item.group_id);
                setQuery("");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
            >
              <div className="min-w-0">
                <span className="text-body-small text-[var(--text-primary)]">{item.item_name}</span>
                <span className="text-caption text-[var(--text-tertiary)] ml-2">{item.unit}</span>
              </div>
              <span className="text-caption text-[var(--text-tertiary)] shrink-0 ml-2">
                {groupNameMap[item.group_id ?? ""] ?? ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
