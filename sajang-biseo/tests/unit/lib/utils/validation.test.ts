import { describe, it, expect } from "vitest";
import {
  isValidAmount, isValidRate, isValidRateSum, calculateFee, isValidDateString,
} from "@/lib/utils/validation";

describe("isValidAmount", () => {
  it("정상 금액", () => { expect(isValidAmount(1_870_000)).toBe(true); });
  it("0원", () => { expect(isValidAmount(0)).toBe(true); });
  it("최대 10억", () => { expect(isValidAmount(1_000_000_000)).toBe(true); });
  it("음수 거부", () => { expect(isValidAmount(-1)).toBe(false); });
  it("10억 초과 거부", () => { expect(isValidAmount(1_000_000_001)).toBe(false); });
  it("소수 거부", () => { expect(isValidAmount(100.5)).toBe(false); });
});

describe("isValidRate", () => {
  it("정상 비율", () => { expect(isValidRate(50)).toBe(true); });
  it("0%", () => { expect(isValidRate(0)).toBe(true); });
  it("100%", () => { expect(isValidRate(100)).toBe(true); });
  it("음수 거부", () => { expect(isValidRate(-1)).toBe(false); });
  it("100 초과 거부", () => { expect(isValidRate(101)).toBe(false); });
});

describe("isValidRateSum", () => {
  it("정확히 100%", () => { expect(isValidRateSum([60, 30, 10])).toBe(true); });
  it("오차 범위 내 (100.05)", () => { expect(isValidRateSum([60, 30, 10.05])).toBe(true); });
  it("오차 초과 거부", () => { expect(isValidRateSum([60, 30, 11])).toBe(false); });
  it("빈 배열 (합계 0)", () => { expect(isValidRateSum([])).toBe(false); });
});

describe("calculateFee", () => {
  it("기본 수수료 계산", () => {
    expect(calculateFee(1_000_000, 6.8)).toBe(68000);
  });
  it("반올림 처리", () => {
    expect(calculateFee(333_333, 1.3)).toBe(4333);
  });
  it("0원 매출", () => {
    expect(calculateFee(0, 6.8)).toBe(0);
  });
});

describe("isValidDateString", () => {
  it("유효한 날짜", () => { expect(isValidDateString("2025-03-15")).toBe(true); });
  it("2월 29일 (윤년)", () => { expect(isValidDateString("2024-02-29")).toBe(true); });
  it("2월 29일 (평년) 거부", () => { expect(isValidDateString("2025-02-29")).toBe(false); });
  it("13월 거부", () => { expect(isValidDateString("2025-13-01")).toBe(false); });
  it("형식 오류 거부", () => { expect(isValidDateString("25-3-15")).toBe(false); });
  it("빈 문자열 거부", () => { expect(isValidDateString("")).toBe(false); });
});
