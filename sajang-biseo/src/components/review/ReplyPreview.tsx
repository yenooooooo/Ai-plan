"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import type { ReplyBlock } from "@/lib/review/blocks";
import { blocksToFullText } from "@/lib/review/blocks";

interface ReplyPreviewProps {
  blocks: ReplyBlock[];
}

export function ReplyPreview({ blocks }: ReplyPreviewProps) {
  const fullText = blocksToFullText(blocks);
  const charCount = fullText.length;
  const lineCount = fullText.split("\n").filter((l) => l.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-primary-500" />
          <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
            미리보기
          </h4>
        </div>
        <div className="flex items-center gap-3 text-caption text-[var(--text-tertiary)]">
          <span>{charCount}자</span>
          <span>{lineCount}줄</span>
        </div>
      </div>

      <div className="bg-[var(--bg-tertiary)] rounded-xl p-4">
        <p className="text-body-small text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
          {fullText}
        </p>
      </div>
    </motion.div>
  );
}
