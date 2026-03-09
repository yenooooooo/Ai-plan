/**
 * 입력값 검증 유틸리티
 */

/**
 * 금액 유효성 검사
 * - 0 이상 정수
 * - 최대 10억 (개인 음식점 일매출 상한)
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0 && amount <= 1_000_000_000;
}

/**
 * 비율 유효성 검사 (0~100%)
 */
export function isValidRate(rate: number): boolean {
  return rate >= 0 && rate <= 100;
}

/**
 * 채널 비율 합계 검증 (100%여야 함)
 * @param rates 채널별 비율 배열
 * @param tolerance 허용 오차 (기본: 0.1)
 */
export function isValidRateSum(rates: number[], tolerance = 0.1): boolean {
  const sum = rates.reduce((acc, r) => acc + r, 0);
  return Math.abs(sum - 100) <= tolerance;
}

/**
 * 수수료 계산 (원 단위 정수 반환)
 * CLAUDE_GUIDELINES.md: "금액 관련 계산은 소수점 반올림 주의, 원화(₩) 기준 정수 처리"
 */
export function calculateFee(amount: number, ratePercent: number): number {
  return Math.round((amount * ratePercent) / 100);
}

/**
 * YYYY-MM-DD 형식 검증
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}
