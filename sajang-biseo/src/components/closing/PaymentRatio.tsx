"use client";

interface PaymentRatioProps {
  cardRatio: number;
  onChange: (cardRatio: number) => void;
}

export function PaymentRatio({ cardRatio, onChange }: PaymentRatioProps) {
  const cashRatio = 100 - cardRatio;

  return (
    <div className="space-y-2">
      <label className="text-body-small text-[var(--text-secondary)]">
        결제수단 비율
      </label>

      <div className="flex items-center gap-3">
        <span className="text-caption text-[var(--text-tertiary)] w-8">카드</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={cardRatio}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
          "
          style={{
            background: `linear-gradient(to right, var(--primary) ${cardRatio}%, var(--bg-elevated) ${cardRatio}%)`,
          }}
        />
        <span className="text-caption text-[var(--text-tertiary)] w-8">현금</span>
      </div>

      <div className="flex justify-between">
        <span className="text-caption font-display text-primary-500">{cardRatio}%</span>
        <span className="text-caption font-display text-[var(--text-tertiary)]">{cashRatio}%</span>
      </div>
    </div>
  );
}
