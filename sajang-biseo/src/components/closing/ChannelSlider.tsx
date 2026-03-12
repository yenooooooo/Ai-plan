"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { ChannelRatioMode } from "./ChannelRatioMode";
import { ChannelAmountMode } from "./ChannelAmountMode";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";

export interface ChannelRatio {
  channel: string;
  ratio: number;
  deliveryCount?: number;
}

interface ChannelSliderProps {
  channels: ChannelRatio[];
  totalSales: number;
  onChange: (channels: ChannelRatio[]) => void;
  readOnly?: boolean;
}

type InputMode = "ratio" | "amount";

const COMMON_CHANNELS = ["홀", "배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문", "포장", "기타"];

export function ChannelSlider({ channels, totalSales, onChange, readOnly = false }: ChannelSliderProps) {
  const [inputMode, setInputMode] = useState<InputMode>("ratio");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [savedChannelNames, setSavedChannelNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { storeId } = useStoreSettings();

  // 설정에서 등록된 채널 목록 불러오기
  useEffect(() => {
    if (!storeId) return;
    const supabase = createClient();
    supabase
      .from("sb_fee_channels")
      .select("channel_name")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .then(({ data }) => {
        if (data) setSavedChannelNames(data.map((d) => d.channel_name));
      });
  }, [storeId]);

  // 추천 채널: 설정 채널 + 공통 채널 중 현재 없는 것
  const existingNames = new Set(channels.map((ch) => ch.channel));
  const allNames = new Set([...savedChannelNames, ...COMMON_CHANNELS]);
  const suggestions = Array.from(allNames).filter((name) => !existingNames.has(name));

  function handleAdd(name: string) {
    const trimmed = name.trim();
    if (!trimmed || existingNames.has(trimmed)) return;
    onChange([...channels, { channel: trimmed, ratio: 0 }]);
    setNewName("");
    setShowAdd(false);
  }

  function handleRemove(index: number) {
    if (channels.length <= 1) return;
    const removed = channels[index];
    const updated = channels.filter((_, i) => i !== index);
    // 삭제된 비율을 첫 번째 채널에 분배
    if (removed.ratio > 0 && updated.length > 0) {
      updated[0] = { ...updated[0], ratio: Math.round((updated[0].ratio + removed.ratio) * 10) / 10 };
    }
    onChange(updated);
  }

  useEffect(() => {
    if (showAdd && inputRef.current) inputRef.current.focus();
  }, [showAdd]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-body-small text-[var(--text-secondary)]">채널별 매출 분배</label>
        <div className="flex h-7 bg-[var(--bg-elevated)] rounded-lg p-0.5 gap-0.5">
          {[
            { key: "ratio" as const, label: "비율" },
            { key: "amount" as const, label: "금액" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setInputMode(key)}
              className={`px-3 rounded-md text-[12px] font-medium transition-all duration-200 ${
                inputMode === key
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {inputMode === "ratio" ? (
        <ChannelRatioMode channels={channels} totalSales={totalSales} onChange={onChange} onRemove={handleRemove} />
      ) : (
        <ChannelAmountMode channels={channels} totalSales={totalSales} onChange={onChange} onRemove={handleRemove} />
      )}

      {/* 채널 추가 */}
      {readOnly ? null : showAdd ? (
        <div className="space-y-2">
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => handleAdd(name)}
                  className="px-2.5 py-1 rounded-lg text-caption font-medium
                    bg-[var(--bg-tertiary)] text-[var(--text-secondary)]
                    hover:bg-primary-500/10 hover:text-primary-500
                    border border-transparent hover:border-primary-500/30
                    transition-all press-effect"
                >
                  + {name}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(newName); }}
              placeholder="채널 이름 입력"
              className="flex-1 h-8 px-3 rounded-lg text-body-small
                bg-[var(--bg-tertiary)] border border-[var(--border-default)]
                text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
                focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              onClick={() => handleAdd(newName)}
              disabled={!newName.trim()}
              className="h-8 px-3 rounded-lg text-caption font-medium
                bg-primary-500 text-white disabled:opacity-40 press-effect"
            >
              추가
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(""); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg
                text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2 rounded-xl text-caption font-medium
            text-[var(--text-tertiary)] hover:text-primary-500
            border border-dashed border-[var(--border-default)] hover:border-primary-500/30
            transition-all press-effect flex items-center justify-center gap-1"
        >
          <Plus size={14} />
          채널 추가
        </button>
      )}
    </div>
  );
}
