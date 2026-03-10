/**
 * 날짜 유틸리티
 * - 한국어 요일, 기간 필터, 포맷팅
 */

const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DAY_NAMES_FULL_KO = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

/**
 * Date를 YYYY-MM-DD 문자열로 변환
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD로 반환
 */
export function today(): string {
  return toDateString(new Date());
}

/**
 * 한국어 요일 반환
 * @example getDayName(new Date()) → "토"
 */
export function getDayName(date: Date): string {
  return DAY_NAMES_KO[date.getDay()];
}

/**
 * 한국어 요일 (풀네임) 반환
 * @example getDayNameFull(new Date()) → "토요일"
 */
export function getDayNameFull(date: Date): string {
  return DAY_NAMES_FULL_KO[date.getDay()];
}

/**
 * 날짜를 "3/15 (토)" 형식으로 포맷
 */
export function formatDateShort(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = getDayName(date);
  return `${m}/${d} (${day})`;
}

/**
 * 날짜를 "2025년 3월 15일 (토)" 형식으로 포맷
 */
export function formatDateFull(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = getDayName(date);
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

/**
 * 날짜를 "3월 15일" 형식으로 포맷
 */
export function formatDateMedium(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}월 ${d}일`;
}

/**
 * YYYY-MM-DD 문자열을 Date로 변환
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 날짜 차이 (일 수)
 */
export function diffDays(from: Date, to: Date): number {
  const msPerDay = 86_400_000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

/**
 * N일 전/후 날짜 반환
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 이번 주 월요일~일요일 범위 반환
 */
export function getThisWeekRange(referenceDate?: Date): {
  start: Date;
  end: Date;
} {
  const date = referenceDate ?? new Date();
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

/**
 * 이번 달 1일~마지막일 범위 반환
 */
export function getThisMonthRange(referenceDate?: Date): {
  start: Date;
  end: Date;
} {
  const date = referenceDate ?? new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

/**
 * 주어진 날짜가 속한 주의 월요일 반환
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/**
 * 상대적 날짜 표시
 * @example getRelativeDate(yesterday) → "어제"
 * @example getRelativeDate(twoDaysAgo) → "2일 전"
 */
export function getRelativeDate(date: Date): string {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diff = diffDays(targetStart, todayStart);

  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  if (diff === -1) return "내일";
  if (diff > 0 && diff <= 7) return `${diff}일 전`;
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)}일 후`;

  return formatDateShort(date);
}
