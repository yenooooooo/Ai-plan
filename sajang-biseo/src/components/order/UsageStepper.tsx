"use client";

import { useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface UsageStepperProps {
  itemId: string;
  itemName: string;
  unit: string;
  value: number;
  remainingStock?: number;
  onChange: (itemId: string, value: number) => void;
  step?: number;
}

export function UsageStepper({
  itemId,
  itemName,
  unit,
  value,
  remainingStock,
  onChange,
  step = 0.5,
}: UsageStepperProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const startLongPress = useCallback(
    (direction: 1 | -1) => {
      // 길게 누르면 빠르게 증가
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          onChange(itemId, Math.max(0, value + step * direction));
        }, 100);
      }, 400);
    },
    [itemId, value, step, onChange]
  );

  const handlePress = (direction: 1 | -1) => {
    const newVal = Math.max(0, +(value + step * direction).toFixed(1));
    onChange(itemId, newVal);
  };

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-body-small text-[var(--text-primary)] font-medium">
            {itemName}
          </span>
          {remainingStock !== undefined && (
            <span className="text-caption text-[var(--text-tertiary)]">
              (재고 {remainingStock}{unit})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* 마이너스 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onPointerDown={() => startLongPress(-1)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          onClick={() => handlePress(-1)}
          disabled={value <= 0}
          className="w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-30 press-effect"
        >
          <Minus size={16} />
        </motion.button>

        {/* 값 표시 */}
        <div className="w-20 text-center">
          <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">
            {value}
          </span>
          <span className="text-caption text-[var(--text-tertiary)] ml-0.5">
            {unit}
          </span>
        </div>

        {/* 플러스 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onPointerDown={() => startLongPress(1)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          onClick={() => handlePress(1)}
          className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 press-effect"
        >
          <Plus size={16} />
        </motion.button>
      </div>
    </div>
  );
}
