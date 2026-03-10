/**
 * 수수료 분석 집계
 */

import type { FeeSummaryData } from "./types";
import type { DailyClosing, DailyClosingChannel } from "@/lib/supabase/types";

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
