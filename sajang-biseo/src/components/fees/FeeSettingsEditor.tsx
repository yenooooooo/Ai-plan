"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Trash2, Save } from "lucide-react";
import { CARD_FEE_TIERS } from "@/lib/fees/presets";
import type { StoreFeeSettings, FeeChannel } from "@/lib/supabase/types";

interface FeeSettingsEditorProps {
  feeSettings: StoreFeeSettings | null;
  feeChannels: FeeChannel[];
  onSaveSettings: (data: {
    annual_revenue_tier: string;
    credit_card_rate: number;
    check_card_rate: number;
    check_card_ratio: number;
    card_payment_ratio: number;
  }) => Promise<void>;
  onAddChannel: (data: { channel_name: string; fee_type: "percentage" | "fixed"; rate: number; category: string }) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  readOnly?: boolean;
}

export function FeeSettingsEditor({
  feeSettings, feeChannels,
  onSaveSettings, onAddChannel, onDeleteChannel,
  readOnly = false,
}: FeeSettingsEditorProps) {
  const [tier, setTier] = useState(feeSettings?.annual_revenue_tier ?? "3억 이하 (영세)");
  const [checkRatio, setCheckRatio] = useState(feeSettings?.check_card_ratio ?? 30);
  const [cardRatio, setCardRatio] = useState(feeSettings?.card_payment_ratio ?? 70);
  const [saving, setSaving] = useState(false);

  // 새 채널 추가
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

  const selectedTier = CARD_FEE_TIERS.find((t) => t.label === tier) ?? CARD_FEE_TIERS[0];

  const handleSaveSettings = async () => {
    setSaving(true);
    await onSaveSettings({
      annual_revenue_tier: tier,
      credit_card_rate: selectedTier.rate,
      check_card_rate: selectedTier.checkRate,
      check_card_ratio: checkRatio,
      card_payment_ratio: cardRatio,
    });
    setSaving(false);
  };

  const handleAddChannel = async () => {
    if (!newName.trim() || !newRate) return;
    await onAddChannel({
      channel_name: newName.trim(),
      fee_type: "percentage",
      rate: Number(newRate),
      category: "delivery",
    });
    setNewName("");
    setNewRate("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      {/* 카드 수수료 설정 */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-primary-500" />
          <h4 className="text-heading-md text-[var(--text-primary)]">카드 수수료 설정</h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-caption text-[var(--text-tertiary)] mb-1 block">연매출 구간</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl px-3 py-2.5 text-body-small text-[var(--text-primary)]"
            >
              {CARD_FEE_TIERS.map((t) => (
                <option key={t.label} value={t.label}>{t.label} — 신용 {t.rate}% / 체크 {t.checkRate}%</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-[var(--text-tertiary)] mb-1 block">체크카드 비율 (%)</label>
              <input type="number" value={checkRatio} onChange={(e) => setCheckRatio(Number(e.target.value))}
                className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl px-3 py-2.5 text-body-small text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="text-caption text-[var(--text-tertiary)] mb-1 block">카드 결제 비율 (%)</label>
              <input type="number" value={cardRatio} onChange={(e) => setCardRatio(Number(e.target.value))}
                className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl px-3 py-2.5 text-body-small text-[var(--text-primary)]" />
            </div>
          </div>

          <button onClick={handleSaveSettings} disabled={saving || readOnly}
            className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium flex items-center justify-center gap-1.5 press-effect disabled:opacity-50">
            <Save size={14} />
            {saving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>

      {/* 채널 수수료 관리 */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-heading-md text-[var(--text-primary)]">채널 수수료 관리</h4>
          {!readOnly && (
            <button onClick={() => setShowAdd(!showAdd)}
              className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 press-effect">
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* 새 채널 추가 폼 */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[11px] text-[var(--text-tertiary)] mb-0.5 block">채널명</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="예: 배민"
                className="w-full bg-[var(--bg-tertiary)] border-none rounded-lg px-2.5 py-2 text-caption text-[var(--text-primary)]" />
            </div>
            <div className="w-20">
              <label className="text-[11px] text-[var(--text-tertiary)] mb-0.5 block">수수료(%)</label>
              <input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="6.8"
                className="w-full bg-[var(--bg-tertiary)] border-none rounded-lg px-2.5 py-2 text-caption text-[var(--text-primary)]" />
            </div>
            <button onClick={handleAddChannel}
              className="px-3 py-2 rounded-lg bg-primary-500 text-white text-caption press-effect">추가</button>
          </motion.div>
        )}

        {/* 채널 목록 */}
        <div className="space-y-1.5">
          {feeChannels.length === 0 && (
            <p className="text-caption text-[var(--text-tertiary)] text-center py-3">
              등록된 채널이 없습니다
            </p>
          )}
          {feeChannels.map((ch) => (
            <div key={ch.id} className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded-xl px-3 py-2.5">
              <div>
                <span className="text-body-small text-[var(--text-primary)]">{ch.channel_name}</span>
                <span className="text-[11px] text-[var(--text-tertiary)] ml-2">
                  {ch.fee_type === "percentage" ? `${ch.rate}%` : `₩${ch.fixed_amount?.toLocaleString()}/건`}
                </span>
              </div>
              {!readOnly && (
                <button onClick={() => onDeleteChannel(ch.id)}
                  className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-danger press-effect">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
