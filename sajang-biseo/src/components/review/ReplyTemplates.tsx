"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Copy, Check, Trash2, X } from "lucide-react";
import { useReplyTemplates } from "@/stores/useReplyTemplates";

export function ReplyTemplates({ readOnly = false }: { readOnly?: boolean }) {
  const { templates, removeTemplate } = useReplyTemplates();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (templates.length === 0) return null;

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <Bookmark size={14} className="text-warning" />
          <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
            저장된 템플릿 ({templates.length})
          </h4>
        </div>
        <X size={14} className={`text-[var(--text-tertiary)] transition-transform ${expanded ? "" : "rotate-45"}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
              {templates.map((tpl) => {
                const isCopied = copiedId === tpl.id;
                return (
                  <div key={tpl.id} className="bg-[var(--bg-tertiary)] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-caption font-medium text-[var(--text-primary)]">{tpl.label}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCopy(tpl.fullText, tpl.id)}
                          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-primary-500">
                          {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                        {!readOnly && (
                          <button onClick={() => removeTemplate(tpl.id)}
                            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-danger">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2">{tpl.fullText}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
