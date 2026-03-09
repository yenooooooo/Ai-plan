/**
 * 금액 포맷팅 유틸리티
 * - 모든 금액은 원 단위 정수
 * - 천 단위 쉼표 필수
 * - ₩ 기호 포함 옵션
 */

/**
 * 숫자를 원화 포맷으로 변환
 * @example formatCurrency(1870000) → "₩1,870,000"
 * @example formatCurrency(-89810) → "-₩89,810"
 * @example formatCurrency(1870000, { showSign: true }) → "+₩1,870,000"
 */
export function formatCurrency(
  amount: number,
  options?: {
    /** ₩ 기호 표시 여부 (기본: true) */
    showSymbol?: boolean;
    /** +/- 부호 항상 표시 (기본: false, 음수만 표시) */
    showSign?: boolean;
    /** 소수점 자릿수 (기본: 0, 원 단위 정수) */
    decimals?: number;
  }
): string {
  const { showSymbol = true, showSign = false, decimals = 0 } = options ?? {};

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const formatted = absAmount.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = showSymbol ? "₩" : "";
  let sign = "";

  if (isNegative) {
    sign = "-";
  } else if (showSign && amount > 0) {
    sign = "+";
  }

  return `${sign}${symbol}${formatted}`;
}

/**
 * 숫자를 축약형으로 표시
 * @example formatCompact(1870000) → "187만"
 * @example formatCompact(12450000) → "1,245만"
 * @example formatCompact(100000000) → "1억"
 */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const remainder = Math.floor((abs % 100_000_000) / 10_000);
    if (remainder === 0) return `${sign}${eok}억`;
    return `${sign}${eok}억 ${remainder.toLocaleString("ko-KR")}만`;
  }

  if (abs >= 10_000) {
    const man = Math.floor(abs / 10_000);
    return `${sign}${man.toLocaleString("ko-KR")}만`;
  }

  return `${sign}${abs.toLocaleString("ko-KR")}`;
}

/**
 * 퍼센트 포맷팅
 * @example formatPercent(4.8) → "4.8%"
 * @example formatPercent(12.34, { showSign: true }) → "+12.3%"
 */
export function formatPercent(
  value: number,
  options?: {
    /** 소수점 자릿수 (기본: 1) */
    decimals?: number;
    /** +/- 부호 항상 표시 */
    showSign?: boolean;
  }
): string {
  const { decimals = 1, showSign = false } = options ?? {};

  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 숫자에 천 단위 쉼표 추가
 * @example formatNumber(1870000) → "1,870,000"
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}
