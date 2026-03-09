"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { TONE_PRESETS } from "@/lib/review/blocks";
import type { StoreToneSettings } from "@/lib/supabase/types";

interface ToneSetupProps {
  settings: StoreToneSettings | null;
  onSave: (data: {
    tone_name: string;
    sample_replies: string[];
    store_name_display: string;
    signature_menus: string[];
    store_features: string[];
    frequent_phrases: string[];
    use_emoji: boolean;
  }) => void;
}

export function ToneSetup({ settings, onSave }: ToneSetupProps) {
  const [tone, setTone] = useState(settings?.tone_name ?? "friendly");
  const [samples, setSamples] = useState<string[]>(settings?.sample_replies ?? []);
  const [newSample, setNewSample] = useState("");
  const [storeName, setStoreName] = useState(settings?.store_name_display ?? "");
  const [menus, setMenus] = useState(settings?.signature_menus?.join(", ") ?? "");
  const [features, setFeatures] = useState(settings?.store_features?.join(", ") ?? "");
  const [phrases, setPhrases] = useState(settings?.frequent_phrases?.join(", ") ?? "");
  const [useEmoji, setUseEmoji] = useState(settings?.use_emoji ?? true);

  function addSample() {
    if (newSample.trim() && samples.length < 5) {
      setSamples([...samples, newSample.trim()]);
      setNewSample("");
    }
  }

  function handleSave() {
    onSave({
      tone_name: tone,
      sample_replies: samples,
      store_name_display: storeName.trim(),
      signature_menus: menus.split(",").map((s) => s.trim()).filter(Boolean),
      store_features: features.split(",").map((s) => s.trim()).filter(Boolean),
      frequent_phrases: phrases.split(",").map((s) => s.trim()).filter(Boolean),
      use_emoji: useEmoji,
    });
  }

  return (
    <div className="space-y-4">
      {/* 톤 선택 */}
      <div className="glass-card p-4">
        <h4 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">
          기본 톤 선택
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {TONE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setTone(preset.key)}
              className={`p-3 rounded-xl text-left transition-all ${
                tone === preset.key
                  ? "bg-primary-500/10 border border-primary-500/30"
                  : "bg-[var(--bg-tertiary)] border border-transparent"
              }`}
            >
              <span className="text-lg">{preset.emoji}</span>
              <p className="text-caption font-medium text-[var(--text-primary)] mt-1">
                {preset.label}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                {preset.example}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 기존 답글 학습 */}
      <div className="glass-card p-4">
        <h4 className="text-body-small font-semibold text-[var(--text-primary)] mb-1">
          기존 답글 학습
        </h4>
        <p className="text-caption text-[var(--text-tertiary)] mb-3">
          잘 쓴 답글 3~5개를 붙여넣으면 말투를 학습합니다
        </p>
        <div className="space-y-2">
          {samples.map((s, i) => (
            <div key={i} className="flex items-start gap-2 bg-[var(--bg-tertiary)] rounded-xl p-3">
              <p className="flex-1 text-caption text-[var(--text-secondary)] line-clamp-2">{s}</p>
              <button onClick={() => setSamples(samples.filter((_, j) => j !== i))}
                className="text-[var(--text-tertiary)] hover:text-danger">
                <X size={14} />
              </button>
            </div>
          ))}
          {samples.length < 5 && (
            <div className="flex gap-2">
              <textarea
                value={newSample}
                onChange={(e) => setNewSample(e.target.value)}
                placeholder="기존 답글을 붙여넣어주세요..."
                rows={2}
                className="flex-1 input-field resize-none text-caption"
              />
              <button onClick={addSample} disabled={!newSample.trim()}
                className="px-3 rounded-xl bg-primary-500/10 text-primary-500 disabled:opacity-30">
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 매장 정보 */}
      <div className="glass-card p-4 space-y-3">
        <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
          매장 정보
        </h4>
        <Field label="매장명 (답글에 표시)" value={storeName}
          onChange={setStoreName} placeholder="김사장 칼국수" />
        <Field label="대표 메뉴 (쉼표 구분)" value={menus}
          onChange={setMenus} placeholder="손칼국수, 수제비, 녹두전" />
        <Field label="매장 특징 (쉼표 구분)" value={features}
          onChange={setFeatures} placeholder="40년 전통, 직접 반죽" />
        <Field label="자주 쓰는 표현 (쉼표 구분)" value={phrases}
          onChange={setPhrases} placeholder="감사합니다~, 맛있게 드셨다니" />

        <div className="flex items-center justify-between pt-1">
          <span className="text-caption text-[var(--text-secondary)]">이모지 사용</span>
          <button onClick={() => setUseEmoji(!useEmoji)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              useEmoji ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"
            }`}>
            <motion.div animate={{ x: useEmoji ? 20 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
          </button>
        </div>
      </div>

      {/* 저장 */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
        className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-body-small flex items-center justify-center gap-2 press-effect">
        <Check size={18} /> 설정 저장
      </motion.button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-caption text-[var(--text-secondary)] mb-1 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="input-field" />
    </div>
  );
}
