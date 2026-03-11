import { describe, it, expect } from "vitest";
import { calculateFees } from "@/lib/fees/calculator";
import type { ChannelSales, CardFeeConfig } from "@/lib/fees/calculatorTypes";

const defaultCardConfig: CardFeeConfig = {
  cardRatio: 90,
  creditCardRate: 1.3,
  checkCardRatio: 20,
  checkCardRate: 0.8,
};

describe("calculateFees", () => {
  it("빈 채널이면 모든 값 0", () => {
    const result = calculateFees([], defaultCardConfig);
    expect(result.grossSales).toBe(0);
    expect(result.totalFees).toBe(0);
    expect(result.netSales).toBe(0);
    expect(result.feeRatePercent).toBe(0);
  });

  it("홀 단일 채널 — 카드 수수료만 발생", () => {
    const channels: ChannelSales[] = [
      { channel: "홀", amount: 1_000_000, isDelivery: false },
    ];
    const result = calculateFees(channels, defaultCardConfig);

    expect(result.grossSales).toBe(1_000_000);
    // 카드 매출 = 1,000,000 * 90% = 900,000
    // 체크카드 = 900,000 * 20% = 180,000 → 수수료 180,000 * 0.8% = 1,440
    // 신용카드 = 720,000 → 수수료 720,000 * 1.3% = 9,360
    // 총 카드 수수료 = 10,800
    expect(result.totalCardFee).toBe(10800);
    expect(result.totalPlatformFee).toBe(0);
    expect(result.totalDeliveryAgencyFee).toBe(0);
    expect(result.netSales).toBe(1_000_000 - 10800);
  });

  it("배민 채널 — 플랫폼 수수료 + 배달대행 수수료", () => {
    const channels: ChannelSales[] = [
      {
        channel: "배민", amount: 500_000, isDelivery: true,
        feeRate: 6.8, deliveryCount: 10, deliveryFeePerOrder: 3300,
      },
    ];
    const result = calculateFees(channels, defaultCardConfig);

    // 플랫폼 수수료 = 500,000 * 6.8% = 34,000
    expect(result.totalPlatformFee).toBe(34000);
    // 배달대행 = 10 * 3,300 = 33,000
    expect(result.totalDeliveryAgencyFee).toBe(33000);
    // 배달앱은 카드 수수료 없음
    expect(result.totalCardFee).toBe(0);
    expect(result.totalFees).toBe(34000 + 33000);
  });

  it("홀 + 배민 복합 채널 계산", () => {
    const channels: ChannelSales[] = [
      { channel: "홀", amount: 1_200_000, isDelivery: false },
      {
        channel: "배민", amount: 520_000, isDelivery: true,
        feeRate: 6.8, deliveryCount: 9, deliveryFeePerOrder: 3300,
      },
    ];
    const result = calculateFees(channels, defaultCardConfig);

    expect(result.grossSales).toBe(1_720_000);
    // 배민 플랫폼 = 520,000 * 6.8% = 35,360
    expect(result.totalPlatformFee).toBe(35360);
    // 배민 배달대행 = 9 * 3,300 = 29,700
    expect(result.totalDeliveryAgencyFee).toBe(29700);
    // 홀 카드 수수료 계산
    expect(result.totalCardFee).toBeGreaterThan(0);
    expect(result.netSales).toBe(result.grossSales - result.totalFees);
  });

  it("수수료율 퍼센트 정확도", () => {
    const channels: ChannelSales[] = [
      { channel: "홀", amount: 1_000_000, isDelivery: false },
    ];
    const result = calculateFees(channels, defaultCardConfig);
    // feeRatePercent = totalFees / grossSales * 100, 소수 1자리
    expect(result.feeRatePercent).toBeCloseTo(1.1, 0);
  });

  it("배달 건수 없으면 배달대행 수수료 0", () => {
    const channels: ChannelSales[] = [
      { channel: "배민", amount: 300_000, isDelivery: true, feeRate: 6.8 },
    ];
    const result = calculateFees(channels, defaultCardConfig);
    expect(result.totalDeliveryAgencyFee).toBe(0);
    expect(result.totalPlatformFee).toBe(Math.round(300_000 * 6.8 / 100));
  });

  it("100% 현금이면 카드 수수료 0", () => {
    const channels: ChannelSales[] = [
      { channel: "홀", amount: 500_000, isDelivery: false },
    ];
    const cashConfig: CardFeeConfig = { ...defaultCardConfig, cardRatio: 0 };
    const result = calculateFees(channels, cashConfig);
    expect(result.totalCardFee).toBe(0);
  });
});
