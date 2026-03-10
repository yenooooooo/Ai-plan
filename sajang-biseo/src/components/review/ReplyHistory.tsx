"use client";

import { motion } from "framer-motion";
import { Clock, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatDateShort, parseDate } from "@/lib/utils/date";
import type { ReviewReply } from "@/lib/supabase/types";

interface ReplyHistoryProps {
  replies: ReviewReply[];
}

export function ReplyHistory({ replies }: ReplyHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (replies.length === 0) return null;

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
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-[var(--text-tertiary)]" />
        <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
          답글 히스토리 ({replies.length}건)
        </h4>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {replies.map((reply, i) => {
          const d = parseDate(reply.created_at.split("T")[0]);
          const isCopied = copiedId === reply.id;

          return (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--bg-tertiary)] rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    v{reply.version}
                  </span>
                  {d && (
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {formatDateShort(d)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(reply.full_text, reply.id)}
                  className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-primary-500 transition-colors"
                >
                  {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-caption text-[var(--text-secondary)] line-clamp-3 whitespace-pre-wrap">
                {reply.full_text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
