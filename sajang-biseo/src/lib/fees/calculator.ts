/**
 * 수수료 계산 엔진
 *
 * CLAUDE_GUIDELINES.md 7.1 계산 순서:
 * 1. 채널별 매출 분배
 * 2. 각 채널 수수료율 적용 → 채널별 수수료 계산
 * 3. 카드 수수료 별도 계산 (배달앱은 자체 정산이라 카드 수수료 별도 미적용)
 * 4. 배달대행 수수료 계산 (건당 고정 금액 × 건수)
 * 5. 모든 수수료 합산 → 총 수수료
 * 6. 총매출 - 총 수수료 = 순매출(실 수령액)
 */

import type {
  ChannelSales,
  CardFeeConfig,
  FeeBreakdown,
  FeeCalculationResult,
} from "./calculatorTypes";

export type { ChannelSales, CardFeeConfig, FeeBreakdown, FeeCalculationResult };

const DEFAULT_DELIVERY = new Set(["배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문"]);

export function calculateFees(
  channels: ChannelSales[],
  cardConfig: CardFeeConfig
): FeeCalculationResult {
  const breakdown: FeeBreakdown[] = channels.map((ch) => {
    const isDelivery = ch.isDelivery ?? DEFAULT_DELIVERY.has(ch.channel);

    const platformFee = isDelivery && ch.feeRate
      ? Math.round((ch.amount * ch.feeRate) / 100) : 0;

    const deliveryAgencyFee =
      isDelivery && ch.deliveryCount && ch.deliveryFeePerOrder
        ? ch.deliveryCount * ch.deliveryFeePerOrder : 0;

    let cardFee = 0;
    if (!isDelivery) {
      const cardAmount = Math.round((ch.amount * cardConfig.cardRatio) / 100);
      const checkAmount = Math.round((cardAmount * cardConfig.checkCardRatio) / 100);
      const creditAmount = cardAmount - checkAmount;
      cardFee = Math.round((creditAmount * cardConfig.creditCardRate) / 100)
        + Math.round((checkAmount * cardConfig.checkCardRate) / 100);
    }

    const totalFee = platformFee + deliveryAgencyFee + cardFee;
    return {
      channel: ch.channel, amount: ch.amount,
      platformFee, platformFeeRate: isDelivery ? ch.feeRate : undefined,
      deliveryAgencyFee,
      deliveryFeePerOrder: isDelivery ? ch.deliveryFeePerOrder : undefined,
      deliveryCount: isDelivery ? ch.deliveryCount : undefined,
      cardFee, cardCreditRate: !isDelivery ? cardConfig.creditCardRate : undefined,
      totalFee, netAmount: ch.amount - totalFee,
    };
  });

  const grossSales = breakdown.reduce((s, b) => s + b.amount, 0);
  const totalPlatformFee = breakdown.reduce((s, b) => s + b.platformFee, 0);
  const totalDeliveryAgencyFee = breakdown.reduce((s, b) => s + b.deliveryAgencyFee, 0);
  const totalCardFee = breakdown.reduce((s, b) => s + b.cardFee, 0);
  const totalFees = totalPlatformFee + totalDeliveryAgencyFee + totalCardFee;
  const netSales = grossSales - totalFees;
  const feeRatePercent = grossSales > 0 ? Math.round((totalFees / grossSales) * 1000) / 10 : 0;

  return {
    grossSales, breakdown,
    totalPlatformFee, totalDeliveryAgencyFee, totalCardFee,
    totalFees, netSales, feeRatePercent,
  };
}
