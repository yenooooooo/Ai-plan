"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/review/blocks";

interface AddReviewFormProps {
  onAdd: (data: { content: string; rating: number; platform: Platform }) => void;
}

export function AddReviewForm({ onAdd }: AddReviewFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [platform, setPlatform] = useState<Platform>("배민");

  function handleAdd() {
    if (!content.trim()) return;
    onAdd({ content: content.trim(), rating, platform });
    setContent("");
    setRating(5);
    setShowForm(false);
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-default)] text-caption font-medium text-[var(--text-tertiary)] hover:text-primary-500 hover:border-primary-500/30 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus size={14} /> 리뷰 직접 등록
      </button>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 mt-2 space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      platform === p
                        ? "bg-primary-500/15 text-primary-500"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className="p-0.5">
                    <Star size={20} className={n <= rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
                  </button>
                ))}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="리뷰 내용을 붙여넣어주세요..."
                rows={3}
                className="input-field resize-none text-caption"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={!content.trim()}
                  className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-caption font-medium disabled:opacity-40 press-effect">
                  등록
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-caption text-[var(--text-tertiary)] press-effect">
                  취소
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
