/** 주간 브리핑 */
export interface WeeklyBriefing {
  id: string;
  storeId: string;
  weekStart: string; // YYYY-MM-DD (월요일)
  weekEnd: string; // YYYY-MM-DD (일요일)
  salesSummary: SalesSummary;
  feeSummary: FeeSummary;
  expenseSummary: ExpenseSummary;
  ingredientEfficiency: IngredientEfficiency;
  customerReputation: CustomerReputation;
  aiCoaching: AICoaching;
  createdAt: string;
}

/** 매출 요약 카드 */
export interface SalesSummary {
  totalSales: number;
  netSales: number;
  dailyAverage: number;
  weekOverWeekChange: number; // %
  weekOverWeekAmount: number;
  bestDay: { dayName: string; amount: number };
  worstDay: { dayName: string; amount: number };
  channelRatios: { channel: string; ratio: number }[];
}

/** 수수료 분석 카드 */
export interface FeeSummary {
  totalFees: number;
  feeRatePercent: number;
  previousFeeRate: number;
  channelFees: { channel: string; amount: number; ratio: number }[];
  insight: string;
}

/** 비용 분석 카드 */
export interface ExpenseSummary {
  totalExpenses: number;
  costRatio: number; // 원가율
  categoryBreakdown: { category: string; amount: number; ratio: number }[];
  weekOverWeekChanges: { category: string; change: number }[];
  alert: string | null;
}

/** 식자재 효율 카드 */
export interface IngredientEfficiency {
  weeklyWasteAmount: number;
  wasteRate: number;
  previousWasteRate: number;
  orderAccuracy: number;
  previousOrderAccuracy: number;
  topWasteItems: { name: string; amount: number; ratio: number }[];
  tip: string | null;
}

/** 고객 평판 카드 */
export interface CustomerReputation {
  weeklyReviewCount: number;
  previousReviewCount: number;
  averageRating: number;
  previousRating: number;
  replyCompletionRate: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
  bestReview: { content: string; platform: string; rating: number } | null;
}

/** AI 경영 코칭 카드 */
export interface AICoaching {
  insight: string;
  suggestions: { title: string; description: string }[];
  weeklyGoals: string[];
}
