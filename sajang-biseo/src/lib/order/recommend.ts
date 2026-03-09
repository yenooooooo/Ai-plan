/**
 * 발주 추천 알고리즘
 *
 * 내일 예상 사용량 =
 *   (최근 4주 같은 요일 평균 사용량)
 *   × (날씨 보정 계수)
 *   × (매출 추세 보정)
 *
 * 권장 발주량 =
 *   max(0, 내일 예상 사용량 × 1.2 - 현재 재고)
 */

export interface UsageHistory {
  date: string;
  usedQty: number;
}

export interface RecommendationInput {
  itemId: string;
  itemName: string;
  unit: string;
  currentStock: number;
  defaultOrderQty: number;
  usageHistory: UsageHistory[]; // 최근 28일간 사용량
  weatherCondition?: "clear" | "rain" | "heat" | "cold" | "snow";
  recentSalesTrend?: number; // 최근 1주 매출 / 4주 평균 매출 비율 (1.0 = 동일)
}

export interface RecommendationResult {
  itemId: string;
  itemName: string;
  unit: string;
  currentStock: number;
  expectedUsage: number;
  recommendedQty: number;
  urgency: "high" | "medium" | "low";
  reason: string;
}

/** 날씨 보정 계수 */
const WEATHER_FACTORS: Record<string, number> = {
  clear: 1.05,
  rain: 0.90,
  heat: 0.85,
  cold: 0.90,
  snow: 0.80,
};

const WEATHER_LABELS: Record<string, string> = {
  clear: "맑음",
  rain: "비",
  heat: "폭염",
  cold: "한파",
  snow: "눈",
};

/**
 * 같은 요일의 사용량만 필터링 (최근 4주)
 */
function getSameDayOfWeekUsage(
  history: UsageHistory[],
  targetDayOfWeek: number
): number[] {
  return history
    .filter((h) => {
      const d = new Date(h.date);
      return d.getDay() === targetDayOfWeek;
    })
    .map((h) => h.usedQty);
}

/**
 * 단일 품목 발주 추천 계산
 */
export function calculateRecommendation(
  input: RecommendationInput
): RecommendationResult {
  const {
    itemId,
    itemName,
    unit,
    currentStock,
    defaultOrderQty,
    usageHistory,
    weatherCondition = "clear",
    recentSalesTrend = 1.0,
  } = input;

  // 내일 요일
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay();

  // 같은 요일 평균 사용량
  const sameDayUsages = getSameDayOfWeekUsage(usageHistory, dayOfWeek);
  const reasons: string[] = [];

  let expectedUsage: number;

  if (sameDayUsages.length > 0) {
    const avg = sameDayUsages.reduce((a, b) => a + b, 0) / sameDayUsages.length;
    expectedUsage = avg;
    reasons.push(`${sameDayUsages.length}주 같은 요일 평균 ${avg.toFixed(1)}${unit}`);
  } else if (usageHistory.length > 0) {
    // 요일 데이터 없으면 전체 평균
    expectedUsage =
      usageHistory.reduce((a, b) => a + b.usedQty, 0) / usageHistory.length;
    reasons.push(`전체 평균 ${expectedUsage.toFixed(1)}${unit}`);
  } else {
    // 사용 데이터 없으면 기본 발주량 기반
    expectedUsage = defaultOrderQty * 0.8;
    reasons.push("사용 데이터 부족, 기본값 적용");
  }

  // 날씨 보정
  const weatherFactor = WEATHER_FACTORS[weatherCondition] ?? 1.0;
  if (weatherFactor !== 1.05) {
    expectedUsage *= weatherFactor;
    const diff = Math.round((weatherFactor - 1) * 100);
    reasons.push(
      `${WEATHER_LABELS[weatherCondition]} 예보 (${diff > 0 ? "+" : ""}${diff}%)`
    );
  } else {
    expectedUsage *= weatherFactor;
  }

  // 매출 추세 보정
  if (Math.abs(recentSalesTrend - 1.0) > 0.05) {
    expectedUsage *= recentSalesTrend;
    const diff = Math.round((recentSalesTrend - 1) * 100);
    reasons.push(`매출 추세 ${diff > 0 ? "+" : ""}${diff}%`);
  }

  // 권장 발주량 = max(0, 예상사용량 × 1.2 - 재고)
  const rawRecommended = Math.max(0, expectedUsage * 1.2 - currentStock);

  // 0.5 단위 올림
  const recommendedQty = Math.ceil(rawRecommended * 2) / 2;

  // 긴급도 판단
  let urgency: "high" | "medium" | "low";
  const daysOfStock =
    expectedUsage > 0 ? currentStock / expectedUsage : Infinity;

  if (daysOfStock < 0.5) {
    urgency = "high";
  } else if (daysOfStock < 1.2) {
    urgency = "medium";
  } else {
    urgency = "low";
  }

  return {
    itemId,
    itemName,
    unit,
    currentStock,
    expectedUsage: Math.round(expectedUsage * 10) / 10,
    recommendedQty,
    urgency,
    reason: reasons.join(" / "),
  };
}

/**
 * 전체 품목 발주 추천
 */
export function generateRecommendations(
  inputs: RecommendationInput[]
): RecommendationResult[] {
  return inputs
    .map(calculateRecommendation)
    .sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
}
