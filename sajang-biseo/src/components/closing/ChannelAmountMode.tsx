"use client";

import { useState, useEffect } from "react";
import { ChannelRatio } from "./ChannelSlider";

const DELIVERY_CHANNEL_SET = new Set(["배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문"]);

interface Props {
  channels: ChannelRatio[];
  totalSales: number;
  onChange: (channels: ChannelRatio[]) => void;
}

export function ChannelAmountMode({ channels, totalSales, onChange }: Props) {
  const [amounts, setAmounts] = useState<string[]>(() =>
    channels.map((ch) => Math.round((totalSales * ch.ratio) / 100).toString())
  );
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // 총매출 또는 채널(프리셋) 변경 시 금액 재계산
  useEffect(() => {
    setAmounts(channels.map((ch) => Math.round((totalSales * ch.ratio) / 100).toString()));
  }, [totalSales, channels]);

  const handleChange = (idx: number, raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    const newAmounts = [...amounts];
    newAmounts[idx] = cleaned;
    setAmounts(newAmounts);

    if (totalSales > 0) {
      const updated = channels.map((ch, i) => ({
        ...ch,
        ratio: Math.min(
          100,
          Math.max(0, Math.round(((parseInt(newAmounts[i], 10) || 0) / totalSales) * 1000) / 10)
        ),
      }));
      onChange(updated);
    }
  };

  const numAmounts = amounts.map((a) => parseInt(a, 10) || 0);
  const totalEntered = numAmounts.reduce((s, a) => s + a, 0);
  const remaining = totalSales - totalEntered;
  const isExact = Math.abs(remaining) < 1;
  const isOver = remaining < -1;


  return (
    <div className="space-y-3">
      {channels.map((ch, idx) => {
        const numAmt = numAmounts[idx];
        const ratio = totalSales > 0 ? Math.round((numAmt / totalSales) * 1000) / 10 : 0;
        const isDelivery = DELIVERY_CHANNEL_SET.has(ch.channel);
        const isFocused = focusedIdx === idx;

        return (
          <div key={ch.channel} className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-body-small font-medium text-[var(--text-primary)] min-w-[4rem]">
                {ch.channel}
              </span>
              <div className="flex items-center gap-1 flex-1">
                <span className="text-caption text-[var(--text-tertiary)]">₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={isFocused ? amounts[idx] : numAmt === 0 ? "" : numAmt.toLocaleString("ko-KR")}
                  onFocus={() => setFocusedIdx(idx)}
                  onBlur={() => setFocusedIdx(null)}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  placeholder="0"
                  className="flex-1 text-right rounded-xl px-3 py-2
                    bg-[var(--bg-tertiary)] border border-[var(--border-default)]
                    text-body-small font-display text-[var(--text-primary)]
                    focus:outline-none focus:border-primary-500
                    transition-colors duration-150"
                />
              </div>
              <span className="text-body-small font-display text-primary-500 min-w-[3.5rem] text-right tabular-nums">
                {ratio.toFixed(1)}%
              </span>
            </div>

            {isDelivery && (
              <div className="flex items-center gap-2 pl-[4.5rem]">
                <span className="text-caption text-[var(--text-tertiary)]">배달 건수</span>
                <input
                  type="number"
                  min={0}
                  value={ch.deliveryCount ?? 0}
                  onChange={(e) => {
                    const updated = [...channels];
                    updated[idx] = { ...updated[idx], deliveryCount: parseInt(e.target.value) || 0 };
                    onChange(updated);
                  }}
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

      {/* 합계 */}
      <div className={`flex items-center justify-between pt-2.5 border-t ${isOver ? "border-[var(--danger)]" : "border-[var(--border-default)]"}`}>
        <span className={`text-body-small font-medium ${isExact ? "text-[var(--net-income)]" : isOver ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"}`}>
          {isExact ? "합계 ✓" : isOver ? "총매출 초과" : "미배분 금액 있음"}
        </span>
        <div className="text-right">
          <p className={`text-body-small font-display font-semibold tabular-nums ${isExact ? "text-[var(--net-income)]" : isOver ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>
            ₩{totalEntered.toLocaleString("ko-KR")}
          </p>
          {!isExact && totalSales > 0 && (
            <p className={`text-caption tabular-nums ${isOver ? "text-[var(--danger)]" : "text-[var(--text-tertiary)]"}`}>
              {isOver ? "+" : "-"}₩{Math.abs(remaining).toLocaleString("ko-KR")} {isOver ? "초과" : "남음"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
