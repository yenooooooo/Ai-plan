"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, RotateCcw } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/review/blocks";

interface ReviewInputProps {
  onGenerate: (data: { content: string; rating: number; platform: Platform }) => void;
  loading: boolean;
  hasResult: boolean;
  onReset: () => void;
  disabled?: boolean;
}

export function ReviewInput({ onGenerate, loading, hasResult, onReset, disabled = false }: ReviewInputProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [platform, setPlatform] = useState<Platform>("배민");

  function handleSubmit() {
    if (!content.trim()) return;
    onGenerate({ content: content.trim(), rating, platform });
  }

  function handleReset() {
    setContent("");
    setRating(5);
    onReset();
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-md text-[var(--text-primary)]">리뷰 답글 생성</h3>
        {hasResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium
              text-[var(--text-tertiary)] hover:text-primary-500 hover:bg-primary-500/5 transition-colors"
          >
            <RotateCcw size={13} />
            새 리뷰
          </button>
        )}
      </div>

      {/* 플랫폼 */}
      <div>
        <label className="text-caption text-[var(--text-secondary)] mb-1.5 block">플랫폼</label>
        <div className="flex gap-1.5 flex-wrap">
          {PLATFORMS.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-colors ${
                platform === p
                  ? "bg-primary-500/15 text-primary-500 border border-primary-500/30"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 별점 */}
      <div>
        <label className="text-caption text-[var(--text-secondary)] mb-1.5 block">별점</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className="p-0.5">
              <Star
                size={28}
                className={n <= rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"}
              />
            </button>
          ))}
          <span className="ml-2 text-body-small font-display text-[var(--text-primary)] self-center">
            {rating}점
          </span>
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div>
        <label className="text-caption text-[var(--text-secondary)] mb-1.5 block">리뷰 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="리뷰 내용을 붙여넣어주세요..."
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {/* 생성 / 재작성 버튼 */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!content.trim() || loading || disabled}
          className="flex-1 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-body-small flex items-center justify-center gap-2 press-effect disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={18} />
              {hasResult ? "재작성" : "답글 생성"}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
