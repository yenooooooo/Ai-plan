"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Package } from "lucide-react";
import { getTemplateForBusiness, type TemplateGroup } from "@/lib/order/templates";

interface TemplateSelectorProps {
  businessType: string;
  onImport: (groups: TemplateGroup[]) => Promise<void>;
  onClose: () => void;
}

export function TemplateSelector({ businessType, onImport, onClose }: TemplateSelectorProps) {
  const template = useMemo(() => getTemplateForBusiness(businessType), [businessType]);

  const [selected, setSelected] = useState<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    for (const group of template) {
      map[group.groupName] = new Set(group.items.map((i) => i.name));
    }
    return map;
  });
  const [importing, setImporting] = useState(false);

  const totalSelected = useMemo(() => {
    let count = 0;
    Object.values(selected).forEach((s) => { count += s.size; });
    return count;
  }, [selected]);

  const toggleItem = (groupName: string, itemName: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const groupSet = new Set(next[groupName] ?? []);
      if (groupSet.has(itemName)) groupSet.delete(itemName);
      else groupSet.add(itemName);
      next[groupName] = groupSet;
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const group = template.find((g) => g.groupName === groupName);
      if (!group) return next;
      const current = next[groupName] ?? new Set();
      if (current.size === group.items.length) {
        next[groupName] = new Set();
      } else {
        next[groupName] = new Set(group.items.map((i) => i.name));
      }
      return next;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    const filtered: TemplateGroup[] = template
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => (selected[g.groupName] ?? new Set()).has(i.name)),
      }))
      .filter((g) => g.items.length > 0);
    await onImport(filtered);
    setImporting(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--bg-primary)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-body-small font-semibold text-[var(--text-primary)]">품목 선택</h2>
          <p className="text-caption text-[var(--text-tertiary)]">{businessType} 기본 품목에서 필요한 것만 골라보세요</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
          <X size={20} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {template.map((group) => {
          const groupSelected = selected[group.groupName] ?? new Set();
          const allChecked = groupSelected.size === group.items.length;
          const someChecked = groupSelected.size > 0 && !allChecked;

          return (
            <div key={group.groupName} className="glass-card overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.groupName)}
                className="w-full flex items-center gap-3 p-4 press-effect"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  allChecked ? "bg-primary-500 border-primary-500" : someChecked ? "bg-primary-500/50 border-primary-500" : "border-[var(--border-default)]"
                }`}>
                  {(allChecked || someChecked) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      {allChecked
                        ? <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M3 6H9" stroke="white" strokeWidth="2" strokeLinecap="round" />}
                    </svg>
                  )}
                </div>
                <span className="text-lg">{group.icon}</span>
                <span className="text-body-small font-semibold text-[var(--text-primary)]">{group.groupName}</span>
                <span className="text-caption text-[var(--text-tertiary)] ml-auto">{groupSelected.size}/{group.items.length}</span>
              </button>

              {/* Items */}
              <div className="px-4 pb-3 space-y-1">
                {group.items.map((item) => {
                  const checked = groupSelected.has(item.name);
                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(group.groupName, item.name)}
                      className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        checked ? "bg-primary-500 border-primary-500" : "border-[var(--border-default)]"
                      }`}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-body-small ${checked ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>{item.name}</span>
                      <span className="text-caption text-[var(--text-tertiary)] ml-auto">{item.unit} · ₩{item.unitPrice.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
        <button
          onClick={handleImport}
          disabled={totalSelected === 0 || importing}
          className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-body-small flex items-center justify-center gap-2 disabled:opacity-40 press-effect"
        >
          {importing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Package size={16} />선택한 {totalSelected}개 품목 추가하기</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
