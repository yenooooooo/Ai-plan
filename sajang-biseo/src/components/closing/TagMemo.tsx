"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

const PRESET_TAGS = ["비옴", "맑음", "흐림", "눈/한파", "근처행사", "명절연휴", "재료부족", "직원결근", "기념일", "할인행사"];
const CUSTOM_TAGS_KEY = "sajang-custom-tags";

interface TagMemoProps {
  tags: string[];
  memo: string;
  onTagsChange: (tags: string[]) => void;
  onMemoChange: (memo: string) => void;
}

export function TagMemo({ tags, memo, onTagsChange, onMemoChange }: TagMemoProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_TAGS_KEY);
    if (saved) { try { setCustomTags(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  const allTags = [...PRESET_TAGS, ...customTags];

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || allTags.includes(trimmed)) { setNewTag(""); return; }
    const updated = [...customTags, trimmed];
    setCustomTags(updated);
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updated));
    onTagsChange([...tags, trimmed]);
    setNewTag("");
    setShowInput(false);
  };

  const removeCustomTag = (tag: string) => {
    const updated = customTags.filter((t) => t !== tag);
    setCustomTags(updated);
    localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(updated));
    if (tags.includes(tag)) onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-body-small font-medium text-[var(--text-secondary)]">오늘 메모</h3>

      {/* 태그 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">오늘 특이사항</p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = tags.includes(tag);
            const isCustom = customTags.includes(tag);
            return (
              <div key={tag} className="relative group">
                <button
                  onClick={() => toggleTag(tag)}
                  className={`px-3 h-7 rounded-full text-[13px] font-medium transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-primary-500/15 text-primary-500 border border-primary-500/40"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"
                  } ${isCustom ? "pr-6" : ""}`}
                >
                  {tag}
                </button>
                {isCustom && (
                  <button onClick={(e) => { e.stopPropagation(); removeCustomTag(tag); }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}
          {showInput ? (
            <div className="flex items-center gap-1">
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCustomTag(); if (e.key === "Escape") setShowInput(false); }}
                placeholder="태그 입력"
                autoFocus
                className="w-24 h-7 px-2 rounded-full text-[13px] bg-[var(--bg-tertiary)] border border-primary-500/30 text-[var(--text-primary)] outline-none" />
              <button onClick={addCustomTag} className="h-7 px-2 rounded-full bg-primary-500/10 text-primary-500 text-[13px] font-medium">추가</button>
            </div>
          ) : (
            <button onClick={() => setShowInput(true)}
              className="px-3 h-7 rounded-full text-[13px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] hover:text-primary-500 hover:border-primary-500/30 transition-colors flex items-center gap-1">
              <Plus size={12} />추가
            </button>
          )}
        </div>
      </div>

      {/* 자유 메모 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">자유 메모 (선택)</p>
        <textarea
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          placeholder="그 외 특이사항을 자유롭게 기록하세요"
          rows={2}
          className="w-full bg-[var(--bg-tertiary)] rounded-xl px-4 py-3
            text-body-default text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500
            resize-none transition-colors duration-200"
        />
      </div>
    </div>
  );
}
