/** 일일 마감 데이터 */
export interface DailyClosing {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  totalSales: number; // 원 단위 정수
  channels: ChannelSales[];
  cardRatio: number; // 카드 결제 비율 (%)
  cashRatio: number; // 현금 결제 비율 (%)
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 채널별 매출 */
export interface ChannelSales {
  channel: string;
  amount: number; // 원 단위 정수
  ratio: number; // 비율 (%)
  deliveryCount?: number; // 배달 건수
}

/** 마감 입력 모드 */
export type ClosingInputMode = "keypad" | "voice" | "chat";

/** 마감 리포트 */
export interface ClosingReport {
  closing: DailyClosing;
  /** 전일 대비 증감률 */
  dailyChangeRate: number;
  /** 전일 대비 증감액 */
  dailyChangeAmount: number;
  /** 같은 요일 4주 평균 대비 */
  weekdayAvgComparison: number;
  /** 총 수수료 */
  totalFees: number;
  /** 순매출 */
  netSales: number;
  /** 수수료율 */
  feeRate: number;
}
