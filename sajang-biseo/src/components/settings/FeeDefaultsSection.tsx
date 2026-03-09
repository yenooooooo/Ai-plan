"use client";

import { CreditCard, Truck, Check, Save } from "lucide-react";
import { CARD_FEE_TIERS } from "@/lib/fees/presets";
import type { DeliveryChannelSetting } from "@/hooks/useSettingsData";

interface FeeDefaultsSectionProps {
  deliveryChannels: DeliveryChannelSetting[];
  deliveryFeePerOrder: number;
  cardTierIndex: number;
  saving: boolean;
  saved: boolean;
  onChannelRateChange: (id: string, rate: number) => void;
  onChannelActiveToggle: (id: string, active: boolean) => void;
  onDeliveryFeeChange: (v: number) => void;
  onCardTierChange: (idx: number) => void;
  onSave: () => void;
}

export function FeeDefaultsSection({
  deliveryChannels, deliveryFeePerOrder, cardTierIndex,
  saving, saved,
  onChannelRateChange, onChannelActiveToggle, onDeliveryFeeChange,
  onCardTierChange, onSave,
}: FeeDefaultsSectionProps) {
  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Truck size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">수수료 기본값</h3>
      </div>

      {/* 배달앱 수수료 */}
      {deliveryChannels.length > 0 && (
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-2">배달앱 중개수수료율</p>
          <div className="space-y-2">
            {deliveryChannels.map((ch) => (
              <div key={ch.id} className="flex items-center gap-3">
                <button
                  onClick={() => onChannelActiveToggle(ch.id, !ch.is_active)}
                  className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    ch.is_active
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "bg-[var(--bg-tertiary)] border-[var(--border-default)]"
                  }`}
                >
                  {ch.is_active && <Check size={11} strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-body-small ${ch.is_active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                  {ch.channel_name}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={ch.rate}
                    onChange={(e) => onChannelRateChange(ch.id, parseFloat(e.target.value) || 0)}
                    disabled={!ch.is_active}
                    className="w-16 h-8 px-2 text-right rounded-lg bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
                      border border-[var(--border-default)] focus:outline-none focus:border-primary-500 disabled:opacity-40 transition-colors"
                  />
                  <span className="text-caption text-[var(--text-tertiary)]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 배달대행비 */}
      <div>
        <p className="text-caption text-[var(--text-tertiary)] mb-2">배달대행비 (건당)</p>
        <div className="flex items-center gap-2">
          <span className="text-body-small text-[var(--text-tertiary)]">₩</span>
          <input
            type="number"
            step="100"
            min="0"
            value={deliveryFeePerOrder}
            onChange={(e) => onDeliveryFeeChange(parseInt(e.target.value, 10) || 0)}
            className="w-32 h-9 px-3 text-right rounded-xl bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
              border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
          />
          <span className="text-caption text-[var(--text-tertiary)]">원 / 건</span>
        </div>
      </div>

      {/* 카드 수수료 구간 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={13} className="text-[var(--text-tertiary)]" />
          <p className="text-caption text-[var(--text-tertiary)]">카드 수수료 구간 (연매출 기준)</p>
        </div>
        <div className="space-y-1.5">
          {CARD_FEE_TIERS.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => onCardTierChange(idx)}
              className={`w-full h-10 px-4 rounded-xl flex items-center justify-between border transition-all duration-150 press-effect ${
                cardTierIndex === idx
                  ? "bg-primary-500/10 border-primary-500"
                  : "bg-[var(--bg-tertiary)] border-transparent hover:border-[var(--border-default)]"
              }`}
            >
              <span className={`text-body-small font-medium ${cardTierIndex === idx ? "text-primary-500" : "text-[var(--text-secondary)]"}`}>
                {tier.label}
              </span>
              <span className={`text-body-small font-display ${cardTierIndex === idx ? "text-primary-500" : "text-[var(--text-tertiary)]"}`}>
                {tier.rate}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving || saved}
        className={`w-full h-10 rounded-xl font-medium text-body-small flex items-center justify-center gap-2 transition-all duration-200
          ${saved ? "bg-[var(--success)] text-white" : "bg-primary-500 text-white hover:bg-primary-600"}
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {saved ? <><Check size={15} />저장됨</> : saving ? "저장 중..." : <><Save size={15} />저장</>}
      </button>
    </div>
  );
}
