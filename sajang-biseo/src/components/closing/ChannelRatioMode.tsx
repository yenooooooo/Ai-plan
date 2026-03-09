"use client";

import { useCallback, useState } from "react";
import { ChannelRatio } from "./ChannelSlider";

const DELIVERY_CHANNEL_SET = new Set(["배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문"]);

interface Props {
  channels: ChannelRatio[];
  totalSales: number;
  onChange: (channels: ChannelRatio[]) => void;
}

export function ChannelRatioMode({ channels, totalSales, onChange }: Props) {
  const [editingAmount, setEditingAmount] = useState<{ index: number; value: string } | null>(null);

  const handleRatioChange = useCallback(
    (index: number, newRatio: number) => {
      const updated = [...channels];
      const old = updated[index].ratio;
      const diff = newRatio - old;

      const othersTotal = channels.reduce(
        (sum, ch, i) => (i !== index ? sum + ch.ratio : sum),
        0
      );

      updated[index] = { ...updated[index], ratio: newRatio };

      if (othersTotal > 0) {
        for (let i = 0; i < updated.length; i++) {
          if (i !== index) {
            const proportion = updated[i].ratio / othersTotal;
            updated[i] = {
              ...updated[i],
              ratio: Math.max(0, Math.round((updated[i].ratio - diff * proportion) * 10) / 10),
            };
          }
        }
      }

      const sum = updated.reduce((s, ch) => s + ch.ratio, 0);
      if (Math.abs(sum - 100) > 0.1) {
        const largest = updated.reduce(
          (max, ch, i) => (i !== index && ch.ratio > updated[max].ratio ? i : max),
          index === 0 ? 1 : 0
        );
        updated[largest] = {
          ...updated[largest],
          ratio: Math.round((updated[largest].ratio + (100 - sum)) * 10) / 10,
        };
      }

      onChange(updated);
    },
    [channels, onChange]
  );

  const handleDeliveryCount = useCallback(
    (index: number, count: number) => {
      const updated = [...channels];
      updated[index] = { ...updated[index], deliveryCount: count };
      onChange(updated);
    },
    [channels, onChange]
  );

  const handleAmountBlur = useCallback(
    (index: number) => {
      if (editingAmount && editingAmount.index === index) {
        const amount = parseInt(editingAmount.value, 10) || 0;
        if (totalSales > 0) {
          const ratio = Math.min(100, Math.max(0, Math.round((amount / totalSales) * 1000) / 10));
          handleRatioChange(index, ratio);
        }
        setEditingAmount(null);
      }
    },
    [editingAmount, totalSales, handleRatioChange]
  );


  return (
    <div className="space-y-4">
      {channels.map((ch, idx) => {
        const amount = Math.round((totalSales * ch.ratio) / 100);
        const isDelivery = DELIVERY_CHANNEL_SET.has(ch.channel);
        const isEditingThis = editingAmount?.index === idx;

        return (
          <div key={ch.channel} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-small font-medium text-[var(--text-primary)] min-w-[3rem]">
                {ch.channel}
              </span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="flex items-center gap-1">
                  <span className="text-caption text-[var(--text-tertiary)]">₩</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={isEditingThis ? editingAmount!.value : amount.toLocaleString("ko-KR")}
                    onFocus={() => setEditingAmount({ index: idx, value: amount === 0 ? "" : amount.toString() })}
                    onChange={(e) => setEditingAmount({ index: idx, value: e.target.value.replace(/[^0-9]/g, "") })}
                    onBlur={() => handleAmountBlur(idx)}
                    placeholder="0"
                    className="w-24 text-right rounded-lg px-2 py-1
                      bg-[var(--bg-tertiary)] border border-[var(--border-default)]
                      text-body-small font-display text-[var(--text-primary)]
                      focus:outline-none focus:border-primary-500 transition-colors duration-150"
                  />
                </div>
                <div className="flex items-center gap-1 min-w-[52px] justify-end">
                  <input
                    type="number"
                    value={ch.ratio}
                    onChange={(e) => {
                      const v = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      handleRatioChange(idx, v);
                    }}
                    className="w-12 text-right bg-transparent text-body-small font-display text-primary-500 outline-none"
                  />
                  <span className="text-caption text-[var(--text-tertiary)]">%</span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={ch.ratio}
              onChange={(e) => handleRatioChange(idx, parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                bg-[var(--bg-elevated)]
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary-500
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--primary) ${ch.ratio}%, var(--bg-elevated) ${ch.ratio}%)`,
              }}
            />

            {isDelivery && (
              <div className="flex items-center gap-2 pl-2">
                <span className="text-caption text-[var(--text-tertiary)]">배달 건수</span>
                <input
                  type="number"
                  min={0}
                  value={ch.deliveryCount ?? 0}
                  onChange={(e) => handleDeliveryCount(idx, parseInt(e.target.value) || 0)}
                  className="w-14 h-7 px-2 rounded-md text-center
                    bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)]
                    border border-[var(--border-default)]
                    focus:outline-none focus:border-primary-500"
                />
                <span className="text-caption text-[var(--text-tertiary)]">건</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
