/**
 * 수수료 계산 엔진 타입 정의
 */

export interface ChannelSales {
  channel: string;
  amount: number;
  isDelivery?: boolean;
  feeRate?: number;
  deliveryCount?: number;
  deliveryFeePerOrder?: number;
}

export interface CardFeeConfig {
  cardRatio: number;
  creditCardRate: number;
  checkCardRatio: number;
  checkCardRate: number;
}

export interface FeeBreakdown {
  channel: string;
  amount: number;
  platformFee: number;
  platformFeeRate?: number;
  deliveryAgencyFee: number;
  deliveryFeePerOrder?: number;
  deliveryCount?: number;
  cardFee: number;
  cardCreditRate?: number;
  totalFee: number;
  netAmount: number;
}

export interface FeeCalculationResult {
  grossSales: number;
  breakdown: FeeBreakdown[];
  totalPlatformFee: number;
  totalDeliveryAgencyFee: number;
  totalCardFee: number;
  totalFees: number;
  netSales: number;
  feeRatePercent: number;
}
