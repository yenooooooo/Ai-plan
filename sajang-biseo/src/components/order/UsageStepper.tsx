"use client";

import { useState, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface UsageStepperProps {
  itemId: string;
  itemName: string;
  unit: string;
  value: number;
  remainingStock?: number;
  prevValue?: number;
  onChange: (itemId: string, value: number) => void;
  step?: number;
}

export function UsageStepper({
  itemId,
  itemName,
  unit,
  value,
  remainingStock,
  prevValue,
  onChange,
  step = 0.5,
}: UsageStepperProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          onChange(itemId, Math.min(9999, Math.max(0, value + step * direction)));
        }, 100);
      }, 400);
    },
    [itemId, value, step, onChange]
  );

  const MAX_VALUE = 9999;

  const handlePress = (direction: 1 | -1) => {
    const newVal = Math.min(MAX_VALUE, Math.max(0, +(value + step * direction).toFixed(1)));
    onChange(itemId, newVal);
  };

  const startEditing = () => {
    setEditValue(value > 0 ? String(value) : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(itemId, Math.min(MAX_VALUE, +parsed.toFixed(1)));
    }
    setEditing(false);
  };

  const applyPrev = () => {
    if (prevValue !== undefined && prevValue > 0) {
      onChange(itemId, prevValue);
    }
  };

  return (
    <div className="flex items-center justify-between py-2.5 gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-body-small text-[var(--text-primary)] font-medium truncate">
            {itemName}
          </span>
          {remainingStock !== undefined && (
            <span className="text-caption text-[var(--text-tertiary)] shrink-0">
              (재고 {remainingStock}{unit})
            </span>
          )}
        </div>
        {/* 어제 사용량 참고 — 탭하면 적용 */}
        {prevValue !== undefined && prevValue > 0 && value === 0 && (
          <button
            onClick={applyPrev}
            className="text-[11px] text-primary-500/70 hover:text-primary-500 transition-colors mt-0.5"
          >
            어제 {prevValue}{unit} →적용
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
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

        {/* 값 표시 — 탭하면 직접 입력 */}
        <div className="w-20 text-center">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
              className="w-full h-8 text-center rounded-lg bg-[var(--bg-tertiary)] border border-primary-500
                text-body-small font-display font-semibold text-[var(--text-primary)] outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={startEditing}
              className="w-full h-8 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-center"
            >
              <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">
                {value}
              </span>
              <span className="text-caption text-[var(--text-tertiary)] ml-0.5">
                {unit}
              </span>
            </button>
          )}
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
