/**
 * 매출 요약 집계
 */

import type { SalesSummaryData } from "./types";
import type { DailyClosing, DailyClosingChannel } from "@/lib/supabase/types";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

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
