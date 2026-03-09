"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Pencil, Check, X, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ReplyBlock,
  type ToneAdjustment,
  BLOCK_LABELS,
  TONE_ADJUSTMENTS,
  blocksToFullText,
} from "@/lib/review/blocks";

interface BlockEditorProps {
  versions: ReplyBlock[][];
  currentVersion: number;
  onVersionChange: (v: number) => void;
  onBlockEdit: (versionIdx: number, blockId: string, text: string) => void;
  onBlockRegenerate: (blockId: string, blockType: string, adjustment?: ToneAdjustment) => void;
  regeneratingBlockId: string | null;
}

export function BlockEditor({
  versions,
  currentVersion,
  onVersionChange,
  onBlockEdit,
  onBlockRegenerate,
  regeneratingBlockId,
}: BlockEditorProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);

  const blocks = versions[currentVersion] ?? [];
  const fullText = blocksToFullText(blocks);

  function startEdit(block: ReplyBlock) {
    setEditingBlockId(block.id);
    setEditText(block.text);
  }

  function saveEdit(blockId: string) {
    onBlockEdit(currentVersion, blockId, editText);
    setEditingBlockId(null);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-3">
      {/* 버전 전환 */}
      <div className="flex items-center justify-between">
        <button onClick={() => onVersionChange(Math.max(0, currentVersion - 1))}
          disabled={currentVersion === 0}
          className="p-2 rounded-xl text-[var(--text-tertiary)] disabled:opacity-30 press-effect">
          <ChevronLeft size={18} />
        </button>
        <span className="text-body-small font-medium text-[var(--text-secondary)]">
          버전 {currentVersion + 1}/{versions.length}
        </span>
        <button onClick={() => onVersionChange(Math.min(versions.length - 1, currentVersion + 1))}
          disabled={currentVersion >= versions.length - 1}
          className="p-2 rounded-xl text-[var(--text-tertiary)] disabled:opacity-30 press-effect">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 블록들 */}
      <div className="space-y-2">
        {blocks.map((block) => {
          const isEditing = editingBlockId === block.id;
          const isRegenerating = regeneratingBlockId === block.id;

          return (
            <motion.div
              key={block.id}
              layout
              className="glass-card overflow-hidden border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
            >
              {/* 블록 헤더 */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[11px] font-semibold text-primary-500 uppercase tracking-wider">
                  {BLOCK_LABELS[block.type]}
                </span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(block.id)}
                        className="p-1 rounded-md text-success"><Check size={14} /></button>
                      <button onClick={() => setEditingBlockId(null)}
                        className="p-1 rounded-md text-[var(--text-tertiary)]"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onBlockRegenerate(block.id, block.type)}
                        disabled={isRegenerating}
                        className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-primary-500 transition-colors">
                        <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
                      </button>
                      <button onClick={() => startEdit(block)}
                        className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-primary-500 transition-colors">
                        <Pencil size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 블록 내용 */}
              <div className="px-4 pb-3">
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    rows={3}
                    className="w-full bg-[var(--bg-tertiary)] rounded-lg p-2 text-body-small text-[var(--text-primary)] outline-none resize-none"
                  />
                ) : (
                  <p className="text-body-small text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {block.text}
                  </p>
                )}
              </div>

              {/* 톤 조절 칩 (response 블록에 특히 유용) */}
              {!isEditing && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {TONE_ADJUSTMENTS.map((adj) => (
                    <button
                      key={adj.key}
                      onClick={() => onBlockRegenerate(block.id, block.type, adj.key)}
                      disabled={isRegenerating}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[11px] text-[var(--text-tertiary)] hover:text-primary-500 hover:bg-primary-500/5 transition-colors disabled:opacity-30"
                    >
                      {adj.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 복사 버튼 */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className={`w-full py-4 rounded-2xl font-semibold text-body-small flex items-center justify-center gap-2 press-effect ${
          copied
            ? "bg-success/10 text-success"
            : "bg-primary-500 text-white"
        }`}
      >
        {copied ? (
          <><Check size={18} /> 복사됨!</>
        ) : (
          <><Copy size={18} /> 복사하기</>
        )}
      </motion.button>
    </div>
  );
}
