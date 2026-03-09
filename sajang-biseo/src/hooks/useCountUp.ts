"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** 애니메이션 시작값 (기본: 0) */
  from?: number;
  /** 애니메이션 지속 시간 (ms, 기본: 600) */
  duration?: number;
  /** 소수점 자릿수 (기본: 0) */
  decimals?: number;
  /** 애니메이션 활성화 여부 (기본: true) */
  enabled?: boolean;
}

/**
 * 숫자 카운트업 애니메이션 훅
 *
 * UI_DESIGN_SYSTEM.md: "모든 숫자에 애니메이션 — 금액 변경 시 카운트업 애니메이션 필수"
 *
 * @example
 * const displayValue = useCountUp(1870000, { duration: 600 });
 * // 0 → 1870000 으로 부드럽게 카운트업
 */
export function useCountUp(
  target: number,
  options?: UseCountUpOptions
): number {
  const {
    from: initialFrom,
    duration = 600,
    decimals = 0,
    enabled = true,
  } = options ?? {};

  const [displayValue, setDisplayValue] = useState(
    enabled ? (initialFrom ?? 0) : target
  );
  const prevTargetRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }

    const startValue = prevTargetRef.current;
    prevTargetRef.current = target;

    // 같은 값이면 애니메이션 불필요
    if (startValue === target) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    const diff = target - startValue;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out 곡선: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + diff * eased;

      if (decimals === 0) {
        setDisplayValue(Math.round(currentValue));
      } else {
        const factor = Math.pow(10, decimals);
        setDisplayValue(Math.round(currentValue * factor) / factor);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, decimals, enabled]);

  return displayValue;
}
