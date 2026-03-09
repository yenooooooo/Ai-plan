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

export interface ChannelSales {
  /** 채널명 */
  channel: string;
  /** 채널 매출 (원) */
  amount: number;
  /** 배달앱 수수료율 (%) — 배달 채널만 해당 */
  feeRate?: number;
  /** 배달 건수 — 배달대행비 계산용 */
  deliveryCount?: number;
  /** 배달대행 건당 비용 (원) */
  deliveryFeePerOrder?: number;
}

export interface CardFeeConfig {
  /** 카드 결제 비율 (%) */
  cardRatio: number;
  /** 신용카드 수수료율 (%) */
  creditCardRate: number;
  /** 체크카드 비율 (%) — 나머지가 신용카드 */
  checkCardRatio: number;
  /** 체크카드 수수료율 (%) */
  checkCardRate: number;
}

export interface FeeBreakdown {
  /** 채널명 */
  channel: string;
  /** 채널 매출 */
  amount: number;
  /** 배달앱 중개 수수료 */
  platformFee: number;
  /** 중개수수료율 (%) */
  platformFeeRate?: number;
  /** 배달대행 수수료 */
  deliveryAgencyFee: number;
  /** 배달대행 건당 금액 (원) */
  deliveryFeePerOrder?: number;
  /** 배달 건수 */
  deliveryCount?: number;
  /** 카드 수수료 */
  cardFee: number;
  /** 카드 신용 수수료율 (%) */
  cardCreditRate?: number;
  /** 채널 총 수수료 */
  totalFee: number;
  /** 채널 순매출 */
  netAmount: number;
}

export interface FeeCalculationResult {
  /** 총매출 */
  grossSales: number;
  /** 채널별 수수료 상세 */
  breakdown: FeeBreakdown[];
  /** 배달앱 수수료 합계 */
  totalPlatformFee: number;
  /** 배달대행 수수료 합계 */
  totalDeliveryAgencyFee: number;
  /** 카드 수수료 합계 */
  totalCardFee: number;
  /** 총 수수료 */
  totalFees: number;
  /** 순매출 (실 수령액) */
  netSales: number;
  /** 수수료율 (%) */
  feeRatePercent: number;
}

/**
 * 수수료 전체 계산
 *
 * 주의: 배달앱 수수료와 카드 수수료 이중 적용 방지
 * - 배달앱 채널은 자체 정산이므로 카드 수수료 별도 미적용
 * - 홀/포장만 카드 수수료 적용
 */
export function calculateFees(
  channels: ChannelSales[],
  cardConfig: CardFeeConfig
): FeeCalculationResult {
  const deliveryChannels = new Set(["배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문"]);

  const breakdown: FeeBreakdown[] = channels.map((ch) => {
    const isDelivery = deliveryChannels.has(ch.channel);

    // Step 1: 배달앱 수수료
    const platformFee = isDelivery && ch.feeRate
      ? Math.round((ch.amount * ch.feeRate) / 100)
      : 0;

    // Step 2: 배달대행 수수료
    const deliveryAgencyFee =
      isDelivery && ch.deliveryCount && ch.deliveryFeePerOrder
        ? ch.deliveryCount * ch.deliveryFeePerOrder
        : 0;

    // Step 3: 카드 수수료 (배달앱 제외, 홀/포장만)
    let cardFee = 0;
    if (!isDelivery) {
      const cardAmount = Math.round((ch.amount * cardConfig.cardRatio) / 100);
      const checkAmount = Math.round(
        (cardAmount * cardConfig.checkCardRatio) / 100
      );
      const creditAmount = cardAmount - checkAmount;

      const creditFee = Math.round(
        (creditAmount * cardConfig.creditCardRate) / 100
      );
      const checkFee = Math.round(
        (checkAmount * cardConfig.checkCardRate) / 100
      );

      cardFee = creditFee + checkFee;
    }

    const totalFee = platformFee + deliveryAgencyFee + cardFee;

    return {
      channel: ch.channel,
      amount: ch.amount,
      platformFee,
      platformFeeRate: isDelivery ? ch.feeRate : undefined,
      deliveryAgencyFee,
      deliveryFeePerOrder: isDelivery ? ch.deliveryFeePerOrder : undefined,
      deliveryCount: isDelivery ? ch.deliveryCount : undefined,
      cardFee,
      cardCreditRate: !isDelivery ? cardConfig.creditCardRate : undefined,
      totalFee,
      netAmount: ch.amount - totalFee,
    };
  });

  const grossSales = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const totalPlatformFee = breakdown.reduce((sum, b) => sum + b.platformFee, 0);
  const totalDeliveryAgencyFee = breakdown.reduce(
    (sum, b) => sum + b.deliveryAgencyFee,
    0
  );
  const totalCardFee = breakdown.reduce((sum, b) => sum + b.cardFee, 0);
  const totalFees = totalPlatformFee + totalDeliveryAgencyFee + totalCardFee;
  const netSales = grossSales - totalFees;
  const feeRatePercent =
    grossSales > 0 ? Math.round((totalFees / grossSales) * 1000) / 10 : 0;

  return {
    grossSales,
    breakdown,
    totalPlatformFee,
    totalDeliveryAgencyFee,
    totalCardFee,
    totalFees,
    netSales,
    feeRatePercent,
  };
}
