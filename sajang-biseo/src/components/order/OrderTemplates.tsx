"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkPlus, BookmarkCheck, Trash2, Save } from "lucide-react";
import { useOrderTemplates, type OrderTemplate } from "@/stores/useOrderTemplates";

interface OrderTemplatesProps {
  /** 현재 확정된 발주 (itemId → qty) */
  currentOrderMap: Record<string, number>;
  onApplyTemplate: (items: Record<string, number>) => void;
}

export function OrderTemplates({ currentOrderMap, onApplyTemplate }: OrderTemplatesProps) {
  const { templates, addTemplate, removeTemplate } = useOrderTemplates();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const hasCurrentItems = Object.values(currentOrderMap).some((qty) => qty > 0);

  function handleSave() {
    if (!templateName.trim() || !hasCurrentItems) return;
    addTemplate({
      name: templateName.trim(),
      items: { ...currentOrderMap },
      createdAt: new Date().toISOString(),
    });
    setTemplateName("");
    setShowSaveForm(false);
  }

  function handleApply(template: OrderTemplate) {
    onApplyTemplate(template.items);
    setActiveTemplate(template.name);
  }

  return (
    <div className="space-y-2">
      {/* 저장된 템플릿 목록 */}
      {templates.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {templates.map((t) => (
            <div key={t.name} className="flex items-center gap-0.5">
              <button
                onClick={() => handleApply(t)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium transition-all press-effect ${
                  activeTemplate === t.name
                    ? "bg-primary-500/10 text-primary-500 border border-primary-500/30"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"
                }`}
              >
                {activeTemplate === t.name ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                {t.name}
                <span className="text-[10px] opacity-60">({Object.keys(t.items).length})</span>
              </button>
              <button
                onClick={() => removeTemplate(t.name)}
                className="p-1 text-[var(--text-tertiary)] hover:text-danger transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 현재 발주를 템플릿으로 저장 */}
      <AnimatePresence>
        {showSaveForm ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setShowSaveForm(false); }}
                placeholder="템플릿 이름"
                className="flex-1 h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                  border border-primary-500 focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={!templateName.trim()}
                className="px-4 h-9 rounded-xl bg-primary-500 text-white text-body-small font-medium disabled:opacity-40
                  flex items-center gap-1"
              >
                <Save size={13} />저장
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-3 h-9 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]"
              >
                취소
              </button>
            </div>
          </motion.div>
        ) : hasCurrentItems ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium
              bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)]
              hover:text-primary-500 hover:border-primary-500/30 transition-all press-effect"
          >
            <BookmarkPlus size={14} />
            현재 발주를 템플릿으로 저장
          </button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
