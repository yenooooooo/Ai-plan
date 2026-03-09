"use client";

const PRESET_TAGS = ["비옴", "맑음", "흐림", "눈/한파", "근처행사", "명절연휴", "재료부족", "직원결근", "기념일", "할인행사"];

interface TagMemoProps {
  tags: string[];
  memo: string;
  onTagsChange: (tags: string[]) => void;
  onMemoChange: (memo: string) => void;
}

export function TagMemo({ tags, memo, onTagsChange, onMemoChange }: TagMemoProps) {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-body-small font-medium text-[var(--text-secondary)]">오늘 메모</h3>

      {/* 태그 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">오늘 특이사항</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 h-7 rounded-full text-[13px] font-medium transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? "bg-primary-500/15 text-primary-500 border border-primary-500/40"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"
                }`}
              >
                {tag}
              </button>
            );
          })}
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
