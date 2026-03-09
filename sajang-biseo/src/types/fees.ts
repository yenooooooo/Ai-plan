/** 수수료 채널 설정 */
export interface FeeChannel {
  id: string;
  storeId: string;
  channelName: string;
  feeType: "percentage" | "fixed";
  rate?: number; // 비율 (%)
  fixedAmount?: number; // 건당 고정 금액 (원)
  isActive: boolean;
  category: "delivery" | "card" | "delivery_agency" | "other";
  createdAt: string;
  updatedAt: string;
}

/** 매장 수수료 설정 */
export interface StoreFeeSettings {
  id: string;
  storeId: string;
  /** 연매출 구간 */
  annualRevenueTier: string;
  /** 신용카드 수수료율 */
  creditCardRate: number;
  /** 체크카드 수수료율 */
  checkCardRate: number;
  /** 체크카드 비율 (%) */
  checkCardRatio: number;
  /** 카드 결제 비율 (%) */
  cardPaymentRatio: number;
  createdAt: string;
  updatedAt: string;
}

/** 수수료 포함/미포함 모드 */
export type FeeDisplayMode = "gross" | "net";
