/**
 * 주간 경영 브리핑 데이터 집계 로직
 * - 각 모듈 데이터를 주 단위로 합산
 */

import type {
  SalesSummaryData,
  FeeSummaryData,
  ExpenseSummaryData,
  IngredientEfficiencyData,
  CustomerReputationData,
} from "./types";
import type {
  DailyClosing,
  DailyClosingChannel,
  Receipt,
  Review,
  DailyUsage,
  OrderItem,
} from "@/lib/supabase/types";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/** 매출 요약 집계 */
export function aggregateSales(
  closings: DailyClosing[],
  channels: DailyClosingChannel[],
  prevClosings: DailyClosing[]
): SalesSummaryData {
  const totalSales = closings.reduce((s, c) => s + c.total_sales, 0);
  const netSales = closings.reduce((s, c) => s + c.net_sales, 0);
  const totalFees = closings.reduce((s, c) => s + c.total_fees, 0);
  const feeRate = totalSales > 0 ? Math.round((totalFees / totalSales) * 1000) / 10 : 0;
  const dailyAvg = closings.length > 0 ? Math.round(totalSales / closings.length) : 0;

  const prevTotal = prevClosings.reduce((s, c) => s + c.total_sales, 0);
  const changeAmount = totalSales - prevTotal;
  const changeRate = prevTotal > 0 ? ((totalSales - prevTotal) / prevTotal) * 100 : 0;

  const dailySales = closings.map((c) => {
    const d = new Date(c.date + "T00:00:00");
    return { day: DAY_NAMES[d.getDay()], amount: c.total_sales, date: c.date };
  });

  const sorted = [...dailySales].sort((a, b) => b.amount - a.amount);
  const bestDay = sorted[0] ?? { day: "-", amount: 0 };
  const worstDay = sorted[sorted.length - 1] ?? { day: "-", amount: 0 };

  // 채널별 비율
  const channelMap = new Map<string, number>();
  channels.forEach((ch) => {
    channelMap.set(ch.channel_name, (channelMap.get(ch.channel_name) ?? 0) + ch.amount);
  });
  const channelRatio: { channel: string; ratio: number }[] = [];
  Array.from(channelMap.entries()).forEach(([channel, amount]) => {
    channelRatio.push({ channel, ratio: totalSales > 0 ? Math.round((amount / totalSales) * 1000) / 10 : 0 });
  });

  return {
    totalSales, netSales, feeRate, dailyAvg,
    prevWeekTotal: prevTotal, changeRate, changeAmount,
    dailySales, bestDay, worstDay,
    channelRatio, prevChannelRatio: [],
  };
}

/** 수수료 분석 집계 */
export function aggregateFees(
  closings: DailyClosing[],
  channels: DailyClosingChannel[],
  prevClosings: DailyClosing[]
): FeeSummaryData {
  const totalSales = closings.reduce((s, c) => s + c.total_sales, 0);
  const totalFees = closings.reduce((s, c) => s + c.total_fees, 0);
  const feeRate = totalSales > 0 ? Math.round((totalFees / totalSales) * 1000) / 10 : 0;

  const prevTotal = prevClosings.reduce((s, c) => s + c.total_sales, 0);
  const prevFees = prevClosings.reduce((s, c) => s + c.total_fees, 0);
  const prevFeeRate = prevTotal > 0 ? Math.round((prevFees / prevTotal) * 1000) / 10 : 0;

  // 채널별 수수료 합산 (platform_fee + delivery_fee는 채널에, card_fee는 "카드"로 분리)
  const feeMap = new Map<string, number>();
  channels.forEach((ch) => {
    const platformAndDelivery = ch.platform_fee + ch.delivery_fee;
    if (platformAndDelivery > 0) {
      feeMap.set(ch.channel_name, (feeMap.get(ch.channel_name) ?? 0) + platformAndDelivery);
    }
    if (ch.card_fee > 0) {
      feeMap.set("카드", (feeMap.get("카드") ?? 0) + ch.card_fee);
    }
  });

  const channelFees: FeeSummaryData["channelFees"] = [];
  Array.from(feeMap.entries()).forEach(([channel, amount]) => {
    channelFees.push({ channel, amount, ratio: totalFees > 0 ? Math.round((amount / totalFees) * 1000) / 10 : 0 });
  });
  channelFees.sort((a, b) => b.amount - a.amount);

  const diff = Math.round((feeRate - prevFeeRate) * 10) / 10;
  const insight = diff > 0
    ? `수수료율이 전주 대비 ${Math.abs(diff)}%p 상승했습니다.`
    : diff < 0
      ? `수수료율이 전주 대비 ${Math.abs(diff)}%p 개선되었습니다.`
      : "수수료율이 전주와 동일합니다.";

  return { totalFees, feeRate, prevFeeRate, channelFees, insight };
}

/** 비용 분석 집계 */
export function aggregateExpenses(
  receipts: Receipt[],
  totalSales: number,
  netSales: number
): ExpenseSummaryData {
  const totalExpense = receipts.reduce((s, r) => s + r.total_amount, 0);
  const costRate = totalSales > 0 ? (totalExpense / totalSales) * 100 : 0;
  const costRateNet = netSales > 0 ? (totalExpense / netSales) * 100 : 0;

  const EXPENSE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#F97316", "#EC4899"];
  const catMap = new Map<string, number>();
  receipts.forEach((r) => {
    const label = "경비";
    catMap.set(label, (catMap.get(label) ?? 0) + r.total_amount);
  });

  const categories: ExpenseSummaryData["categories"] = [];
  let idx = 0;
  Array.from(catMap.entries()).forEach(([label, amount]) => {
    categories.push({
      label, amount,
      ratio: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
    });
    idx++;
  });

  return {
    totalExpense, costRate, costRateNet,
    categories,
    prevComparison: [],
    warning: null,
  };
}

/** 식자재 효율 집계 */
export function aggregateIngredients(
  usages: DailyUsage[],
  items: OrderItem[]
): IngredientEfficiencyData {
  const totalUsed = usages.reduce((s, u) => s + u.used_qty, 0);
  const totalWaste = usages.reduce((s, u) => s + u.waste_qty, 0);
  const wasteRate = totalUsed + totalWaste > 0
    ? (totalWaste / (totalUsed + totalWaste)) * 100 : 0;

  // 폐기 금액 계산 (품목별 단가 적용)
  const priceMap = new Map<string, number>();
  items.forEach((item) => {
    priceMap.set(item.id, item.unit_price ?? 0);
  });

  const wasteByItem = new Map<string, { name: string; amount: number }>();
  usages.forEach((u) => {
    if (u.waste_qty > 0) {
      const price = priceMap.get(u.item_id) ?? 0;
      const item = items.find((i) => i.id === u.item_id);
      const name = item?.item_name ?? "기타";
      const existing = wasteByItem.get(u.item_id) ?? { name, amount: 0 };
      existing.amount += u.waste_qty * price;
      wasteByItem.set(u.item_id, existing);
    }
  });

  const wasteList = Array.from(wasteByItem.values()).sort((a, b) => b.amount - a.amount);
  const wasteAmount = wasteList.reduce((s, w) => s + w.amount, 0);

  const wasteTop3 = wasteList.slice(0, 3).map((w) => ({
    name: w.name,
    amount: w.amount,
    ratio: wasteAmount > 0 ? (w.amount / wasteAmount) * 100 : 0,
  }));

  return {
    wasteAmount, wasteRate, prevWasteRate: 0,
    accuracyRate: 0, prevAccuracyRate: 0,
    wasteTop3, tip: null,
  };
}

/** 고객 평판 집계 */
export function aggregateReputation(
  reviews: Review[],
  prevReviews: Review[]
): CustomerReputationData {
  const reviewCount = reviews.length;
  const prevReviewCount = prevReviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const prevAvgRating = prevReviewCount > 0
    ? prevReviews.reduce((s, r) => s + r.rating, 0) / prevReviewCount : 0;

  const replied = reviews.filter((r) => r.reply_status === "replied").length;
  const replyRate = reviewCount > 0 ? (replied / reviewCount) * 100 : 0;

  // 베스트 리뷰 (5점 중 가장 긴 리뷰)
  const fiveStars = reviews.filter((r) => r.rating === 5).sort((a, b) => b.content.length - a.content.length);
  const bestReview = fiveStars[0]
    ? { content: fiveStars[0].content, platform: fiveStars[0].platform, rating: 5 }
    : null;

  return {
    reviewCount, prevReviewCount,
    avgRating: Math.round(avgRating * 10) / 10,
    prevAvgRating: Math.round(prevAvgRating * 10) / 10,
    replyRate: Math.round(replyRate),
    repliedCount: replied, totalCount: reviewCount,
    positiveKeywords: [], negativeKeywords: [],
    bestReview,
  };
}
