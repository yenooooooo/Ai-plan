import { describe, it, expect } from "vitest";
import {
  calculateRecommendation, generateRecommendations,
  type RecommendationInput,
} from "@/lib/order/recommend";

function makeInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    itemId: "1",
    itemName: "삼겹살",
    unit: "kg",
    currentStock: 3,
    defaultOrderQty: 5,
    usageHistory: [],
    weatherCondition: "clear",
    recentSalesTrend: 1.0,
    ...overrides,
  };
}

// 특정 요일의 사용 이력 생성
function makeHistory(dayOffset: number, qty: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1); // 내일 기준
  // 같은 요일 N주 전
  d.setDate(d.getDate() - dayOffset * 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, usedQty: qty };
}

describe("calculateRecommendation", () => {
  it("사용 데이터 없으면 기본값 기반 추천", () => {
    const result = calculateRecommendation(makeInput({ defaultOrderQty: 10 }));
    // expectedUsage = 10 * 0.8 = 8, * 1.05(clear) = 8.4
    // recommended = max(0, 8.4 * 1.2 - 3) = max(0, 10.08 - 3) = 7.08 → 올림 0.5 → 7.5
    expect(result.expectedUsage).toBeGreaterThan(0);
    expect(result.recommendedQty).toBeGreaterThan(0);
    expect(result.reason).toContain("사용 데이터 부족");
  });

  it("같은 요일 이력 있으면 평균 사용", () => {
    const history = [makeHistory(1, 5), makeHistory(2, 7), makeHistory(3, 6), makeHistory(4, 6)];
    const result = calculateRecommendation(makeInput({
      usageHistory: history, currentStock: 2,
    }));
    // 평균 = (5+7+6+6)/4 = 6, * 1.05(clear) = 6.3
    // recommended = max(0, 6.3 * 1.2 - 2) = 5.56 → 6.0
    expect(result.expectedUsage).toBeCloseTo(6.3, 0);
    expect(result.recommendedQty).toBeGreaterThan(0);
  });

  it("재고 충분하면 추천량 0", () => {
    const history = [makeHistory(1, 2)];
    const result = calculateRecommendation(makeInput({
      usageHistory: history, currentStock: 100,
    }));
    expect(result.recommendedQty).toBe(0);
    expect(result.urgency).toBe("low");
  });

  it("비 오면 사용량 감소", () => {
    const history = [makeHistory(1, 10)];
    const clearResult = calculateRecommendation(makeInput({
      usageHistory: history, weatherCondition: "clear",
    }));
    const rainResult = calculateRecommendation(makeInput({
      usageHistory: history, weatherCondition: "rain",
    }));
    expect(rainResult.expectedUsage).toBeLessThan(clearResult.expectedUsage);
  });

  it("매출 상승 추세면 사용량 증가", () => {
    const history = [makeHistory(1, 10)];
    const normalResult = calculateRecommendation(makeInput({
      usageHistory: history, recentSalesTrend: 1.0,
    }));
    const upResult = calculateRecommendation(makeInput({
      usageHistory: history, recentSalesTrend: 1.2,
    }));
    expect(upResult.expectedUsage).toBeGreaterThan(normalResult.expectedUsage);
  });

  it("재고 부족 시 urgency = high", () => {
    const history = [makeHistory(1, 10)];
    const result = calculateRecommendation(makeInput({
      usageHistory: history, currentStock: 1,
    }));
    expect(result.urgency).toBe("high");
  });
});

describe("generateRecommendations", () => {
  it("긴급도 순 정렬", () => {
    const inputs = [
      makeInput({ itemId: "a", itemName: "양파", currentStock: 100, usageHistory: [makeHistory(1, 2)] }),
      makeInput({ itemId: "b", itemName: "삼겹살", currentStock: 0, usageHistory: [makeHistory(1, 10)] }),
      makeInput({ itemId: "c", itemName: "대파", currentStock: 3, usageHistory: [makeHistory(1, 5)] }),
    ];
    const results = generateRecommendations(inputs);
    expect(results[0].itemName).toBe("삼겹살"); // high urgency
    expect(results[results.length - 1].itemName).toBe("양파"); // low urgency
  });

  it("빈 입력이면 빈 배열", () => {
    expect(generateRecommendations([])).toEqual([]);
  });
});
