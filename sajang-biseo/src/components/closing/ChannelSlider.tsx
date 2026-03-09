"use client";

import { useState } from "react";
import { ChannelRatioMode } from "./ChannelRatioMode";
import { ChannelAmountMode } from "./ChannelAmountMode";

export interface ChannelRatio {
  channel: string;
  ratio: number;
  deliveryCount?: number;
}

interface ChannelSliderProps {
  channels: ChannelRatio[];
  totalSales: number;
  onChange: (channels: ChannelRatio[]) => void;
}

type InputMode = "ratio" | "amount";

export function ChannelSlider({ channels, totalSales, onChange }: ChannelSliderProps) {
  const [inputMode, setInputMode] = useState<InputMode>("ratio");

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
        <ChannelRatioMode channels={channels} totalSales={totalSales} onChange={onChange} />
      ) : (
        <ChannelAmountMode channels={channels} totalSales={totalSales} onChange={onChange} />
      )}
    </div>
  );
}
