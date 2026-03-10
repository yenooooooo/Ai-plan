"use client";

import { useState, useEffect, useCallback } from "react";
import { BookmarkPlus, Trash2, ChevronDown, ChevronUp, Plus, Check, Save, Smartphone } from "lucide-react";
import { usePresetsStore, type Preset } from "@/stores/usePresetsStore";

function PresetCard({ preset, index, canDelete }: { preset: Preset; index: number; canDelete: boolean }) {
  const { updatePreset, removePreset } = usePresetsStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(preset.name);
  const [cardRatio, setCardRatio] = useState(preset.cardRatio);
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(preset.channels.map((c) => [c.channel, c.ratio]))
  );
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setName(preset.name);
    setCardRatio(preset.cardRatio);
    setRatios(Object.fromEntries(preset.channels.map((c) => [c.channel, c.ratio])));
  }, [preset]);

  const total = Object.values(ratios).reduce((s, v) => s + v, 0);

  const handleSave = useCallback(() => {
    const channels = preset.channels.map((c) => ({ ...c, ratio: ratios[c.channel] ?? c.ratio }));
    updatePreset(index, { name, channels, cardRatio });
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
  }, [preset, ratios, name, cardRatio, index, updatePreset]);

  // #11 삭제 확인
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    removePreset(index);
  };

  return (
    <div className="border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <BookmarkPlus size={14} className="text-primary-500" />
          <span className="text-body-small font-medium text-[var(--text-primary)]">{preset.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-colors ${
                confirmDelete ? "text-danger bg-danger/10" : "text-[var(--text-tertiary)] hover:text-danger"
              }`}
              title={confirmDelete ? "한 번 더 눌러서 삭제" : "삭제"}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3 bg-[var(--bg-secondary)]">
          <div>
            <label className="text-caption text-[var(--text-tertiary)] block mb-1">프리셋 이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
                border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-caption text-[var(--text-tertiary)] block mb-1.5">채널별 비율</label>
            <div className="space-y-2">
              {preset.channels.map((c) => (
                <div key={c.channel} className="flex items-center gap-2">
                  <span className="flex-1 text-body-small text-[var(--text-secondary)]">{c.channel}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ratios[c.channel] ?? c.ratio}
                    onChange={(e) => setRatios((r) => ({ ...r, [c.channel]: parseInt(e.target.value, 10) || 0 }))}
                    className="w-16 h-8 px-2 text-right rounded-lg bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
                      border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <span className="text-caption text-[var(--text-tertiary)]">%</span>
                </div>
              ))}
            </div>
            <p className={`text-caption mt-1.5 ${total === 100 ? "text-success" : total > 100 ? "text-danger" : "text-[var(--text-tertiary)]"}`}>
              합계 {total}% {total === 100 ? "OK" : total > 100 ? "초과" : ""}
            </p>
          </div>

          <div>
            <label className="text-caption text-[var(--text-tertiary)] block mb-1">카드 결제 비율</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="100"
                value={cardRatio}
                onChange={(e) => setCardRatio(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 px-2 text-right rounded-lg bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
                  border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
              />
              <span className="text-caption text-[var(--text-tertiary)]">%</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={total !== 100 || !name.trim() || saved}
            className={`w-full h-9 rounded-xl text-white text-body-small font-medium flex items-center justify-center gap-1.5
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${saved ? "bg-success" : "bg-primary-500 hover:bg-primary-600"}`}
          >
            {saved ? <><Check size={14} />저장됨</> : <><Save size={14} />저장</>}
          </button>
        </div>
      )}
    </div>
  );
}

export function PresetsSection() {
  const { presets, addPreset, resetToDefaults } = usePresetsStore();

  const handleAdd = () => {
    addPreset({
      name: `프리셋 ${presets.length + 1}`,
      channels: [
        { channel: "홀", ratio: 60 },
        { channel: "배민", ratio: 20, deliveryCount: 10 },
        { channel: "쿠팡이츠", ratio: 10, deliveryCount: 5 },
        { channel: "포장", ratio: 10 },
      ],
      cardRatio: 90,
    });
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkPlus size={16} className="text-primary-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">채널 프리셋</h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="text-caption text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          기본값 복원
        </button>
      </div>

      <div className="space-y-2">
        {presets.map((preset, idx) => (
          <PresetCard key={idx} preset={preset} index={idx} canDelete={presets.length > 1} />
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="w-full h-9 rounded-xl border border-dashed border-[var(--border-default)] text-body-small text-[var(--text-tertiary)]
          hover:border-primary-500 hover:text-primary-500 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={14} />프리셋 추가
      </button>

      {/* #6 기기 로컬 저장 안내 */}
      <div className="flex items-center gap-1.5">
        <Smartphone size={11} className="text-[var(--text-tertiary)]" />
        <p className="text-[10px] text-[var(--text-tertiary)]">프리셋은 현재 기기에만 저장됩니다</p>
      </div>
    </div>
  );
}
