"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";

interface NumericKeypadProps {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "del"],
] as const;

const QUICK_AMOUNTS = [
  { label: "50만", value: 500_000 },
  { label: "100만", value: 1_000_000 },
  { label: "150만", value: 1_500_000 },
  { label: "200만", value: 2_000_000 },
];

export function NumericKeypad({ value, onChange, maxValue = 99_999_999 }: NumericKeypadProps) {
  function handleKey(key: string) {
    if (key === "del") {
      onChange(Math.floor(value / 10));
      return;
    }

    const digit = key === "00" ? "00" : key;
    const newStr = value.toString() + digit;
    const newVal = parseInt(newStr, 10);

    if (newVal <= maxValue) {
      onChange(newVal);
    }
  }

  function handleQuickAmount(amount: number) {
    const newVal = value + amount;
    if (newVal <= maxValue) {
      onChange(newVal);
    }
  }

  return (
    <div className="space-y-3">
      {/* 빠른 금액 칩 */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map(({ label, value: amt }) => (
          <button
            key={label}
            onClick={() => handleQuickAmount(amt)}
            className="
              flex-1 h-11 rounded-lg
              bg-primary-500/10 text-primary-500
              text-[13px] font-medium font-display
              press-effect transition-colors duration-150
              hover:bg-primary-500/20
            "
          >
            +{label}
          </button>
        ))}
      </div>

      {/* 키패드 */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.flat().map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.1 }}
            onClick={() => handleKey(key)}
            className={`
              h-16 rounded-xl
              flex items-center justify-center
              font-display text-2xl font-semibold
              transition-colors duration-100
              ${
                key === "del"
                  ? "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] active:bg-[var(--bg-elevated)]"
              }
            `}
          >
            {key === "del" ? (
              <Delete size={24} />
            ) : (
              key
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
