/**
 * 수수료 데이터 집계 헬퍼
 */

import type { DailyClosing, DailyClosingChannel } from "@/lib/supabase/types";

export interface MonthlyFeeReport {
  month: string;
  totalSales: number;
  totalFees: number;
  feeRate: number;
  channelFees: { channel: string; amount: number; ratio: number }[];
}

export interface ChannelProfitability {
  channel: string;
  totalSales: number;
  totalFees: number;
  netSales: number;
  feeRate: number;
}

/** 마감 데이터 + 채널 데이터 → 월간 리포트 */
export function buildMonthlyReport(
  closings: DailyClosing[],
  channels: DailyClosingChannel[],
  month: string
): MonthlyFeeReport {
  const closingIds = new Set(closings.map((c) => c.id));
  const monthChannels = channels.filter((ch) => closingIds.has(ch.closing_id));

  const totalSales = closings.reduce((s, c) => s + c.total_sales, 0);
  const totalFees = closings.reduce((s, c) => s + c.total_fees, 0);
  const feeRate = totalSales > 0 ? Math.round((totalFees / totalSales) * 1000) / 10 : 0;

  const feeMap = new Map<string, number>();
  monthChannels.forEach((ch) => {
    const fee = ch.platform_fee + ch.delivery_fee + ch.card_fee;
    feeMap.set(ch.channel_name, (feeMap.get(ch.channel_name) ?? 0) + fee);
  });

  const channelFees: MonthlyFeeReport["channelFees"] = [];
  Array.from(feeMap.entries()).forEach(([channel, amount]) => {
    channelFees.push({
      channel,
      amount,
      ratio: totalFees > 0 ? Math.round((amount / totalFees) * 1000) / 10 : 0,
    });
  });
  channelFees.sort((a, b) => b.amount - a.amount);

  return { month, totalSales, totalFees, feeRate, channelFees };
}

/** 채널 데이터 → 수익성 테이블 */
export function buildProfitability(
  closings: DailyClosing[],
  channels: DailyClosingChannel[]
): ChannelProfitability[] {
  const closingIds = new Set(closings.map((c) => c.id));
  const monthChannels = channels.filter((ch) => closingIds.has(ch.closing_id));

  const profMap = new Map<string, { sales: number; fees: number }>();
  monthChannels.forEach((ch) => {
    const existing = profMap.get(ch.channel_name) ?? { sales: 0, fees: 0 };
    existing.sales += ch.amount;
    existing.fees += ch.platform_fee + ch.delivery_fee + ch.card_fee;
    profMap.set(ch.channel_name, existing);
  });

  const result: ChannelProfitability[] = [];
  Array.from(profMap.entries()).forEach(([channel, { sales, fees }]) => {
    result.push({
      channel,
      totalSales: sales,
      totalFees: fees,
      netSales: sales - fees,
      feeRate: sales > 0 ? Math.round((fees / sales) * 1000) / 10 : 0,
    });
  });
  result.sort((a, b) => a.feeRate - b.feeRate);
  return result;
}
