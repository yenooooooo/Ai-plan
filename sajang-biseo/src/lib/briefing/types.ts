/**
 * 주간 경영 브리핑 데이터 타입
 */

/** 카드1: 매출 요약 */
export interface SalesSummaryData {
  totalSales: number;
  netSales: number;
  feeRate: number;
  dailyAvg: number;
  prevWeekTotal: number;
  changeRate: number;
  changeAmount: number;
  dailySales: { day: string; amount: number; date: string }[];
  bestDay: { day: string; amount: number };
  worstDay: { day: string; amount: number };
  channelRatio: { channel: string; ratio: number }[];
  prevChannelRatio: { channel: string; ratio: number }[];
}

/** 카드2: 수수료 분석 */
export interface FeeSummaryData {
  totalFees: number;
  feeRate: number;
  prevFeeRate: number;
  channelFees: { channel: string; amount: number; ratio: number }[];
  insight: string;
}

/** 카드3: 비용 분석 */
export interface ExpenseSummaryData {
  totalExpense: number;
  costRate: number;
  costRateNet: number;
  categories: { label: string; amount: number; ratio: number; color: string }[];
  prevComparison: { label: string; diff: number }[];
  warning: string | null;
}

/** 카드4: 식자재 효율 */
export interface IngredientEfficiencyData {
  wasteAmount: number;
  wasteRate: number;
  prevWasteRate: number;
  accuracyRate: number;
  prevAccuracyRate: number;
  wasteTop3: { name: string; amount: number; ratio: number }[];
  tip: string | null;
}

/** 카드5: 고객 평판 */
export interface CustomerReputationData {
  reviewCount: number;
  prevReviewCount: number;
  avgRating: number;
  prevAvgRating: number;
  replyRate: number;
  repliedCount: number;
  totalCount: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
  bestReview: { content: string; platform: string; rating: number } | null;
}

/** 카드6: AI 경영 코칭 */
export interface AiCoachingData {
  insight: string;
  actions: { title: string; description: string }[];
  goals: string[];
}

/** 전체 브리핑 데이터 */
export interface BriefingData {
  weekStart: string;
  weekEnd: string;
  sales: SalesSummaryData;
  fees: FeeSummaryData;
  expenses: ExpenseSummaryData;
  ingredients: IngredientEfficiencyData;
  reputation: CustomerReputationData;
  coaching: AiCoachingData;
}

/** 브리핑 카드 그라데이션 테마 */
export const CARD_GRADIENTS = [
  "from-blue-500/10 to-cyan-500/5",       // 매출
  "from-red-500/10 to-orange-500/5",        // 수수료
  "from-emerald-500/10 to-teal-500/5",     // 비용
  "from-orange-500/10 to-amber-500/5",     // 식자재
  "from-rose-500/10 to-pink-500/5",        // 평판
  "from-amber-500/15 to-yellow-500/10",    // AI 코칭 (특별)
] as const;
