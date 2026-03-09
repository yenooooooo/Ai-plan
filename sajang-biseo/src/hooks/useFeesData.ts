"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString, getThisMonthRange } from "@/lib/utils/date";
import type { FeeChannel, StoreFeeSettings } from "@/lib/supabase/types";

export interface MonthlyFeeReport {
  month: string; // "2025-03"
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

export interface SettlementSchedule {
  channel: string;
  settlementDay: string;
  expectedAmount: number;
}

export function useFeesData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();

  const [feeSettings, setFeeSettings] = useState<StoreFeeSettings | null>(null);
  const [feeChannels, setFeeChannels] = useState<FeeChannel[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyFeeReport | null>(null);
  const [profitability, setProfitability] = useState<ChannelProfitability[]>([]);
  const [recentMonths, setRecentMonths] = useState<MonthlyFeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 월
  const [monthOffset, setMonthOffset] = useState(0);

  const getMonthRange = useCallback((offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    const { start, end } = getThisMonthRange(d);
    return { start: toDateString(start), end: toDateString(end), label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  }, []);

  // 월간 데이터 로드
  const loadMonthData = useCallback(async (offset: number) => {
    if (!storeId) return;
    setLoading(true);
    setError(null);

    const { start, end, label } = getMonthRange(offset);

    try {
    const [settingsRes, channelsConfigRes, closingsRes, closingChannelsRes] = await Promise.all([
      supabase.from("sb_store_fee_settings").select("*")
        .eq("store_id", storeId).maybeSingle(),
      supabase.from("sb_fee_channels").select("*")
        .eq("store_id", storeId).eq("is_active", true).is("deleted_at", null)
        .order("sort_order"),
      supabase.from("sb_daily_closing").select("*")
        .eq("store_id", storeId).gte("date", start).lte("date", end)
        .is("deleted_at", null),
      supabase.from("sb_daily_closing_channels").select("*")
        .eq("store_id", storeId)
        .gte("created_at", start + "T00:00:00")
        .lte("created_at", end + "T23:59:59"),
    ]);

    if (closingsRes.error || closingChannelsRes.error) {
      setError("수수료 데이터를 불러오지 못했습니다");
      setLoading(false);
      return;
    }

    setFeeSettings(settingsRes.data);
    setFeeChannels(channelsConfigRes.data ?? []);

    const closings = closingsRes.data ?? [];
    const allChannels = closingChannelsRes.data ?? [];

    // 해당 월의 closing_id 목록
    const closingIds = new Set(closings.map((c) => c.id));
    const monthChannels = allChannels.filter((ch) => closingIds.has(ch.closing_id));

    // 월간 수수료 리포트
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
      channelFees.push({ channel, amount, ratio: totalFees > 0 ? Math.round((amount / totalFees) * 1000) / 10 : 0 });
    });
    channelFees.sort((a, b) => b.amount - a.amount);

    setMonthlyReport({ month: label, totalSales, totalFees, feeRate, channelFees });

    // 채널별 수익성
    const profMap = new Map<string, { sales: number; fees: number }>();
    monthChannels.forEach((ch) => {
      const existing = profMap.get(ch.channel_name) ?? { sales: 0, fees: 0 };
      existing.sales += ch.amount;
      existing.fees += ch.platform_fee + ch.delivery_fee + ch.card_fee;
      profMap.set(ch.channel_name, existing);
    });
    const profList: ChannelProfitability[] = [];
    Array.from(profMap.entries()).forEach(([channel, { sales, fees }]) => {
      profList.push({
        channel, totalSales: sales, totalFees: fees,
        netSales: sales - fees,
        feeRate: sales > 0 ? Math.round((fees / sales) * 1000) / 10 : 0,
      });
    });
    profList.sort((a, b) => a.feeRate - b.feeRate);
    setProfitability(profList);

    // 최근 6개월 추이
    setRecentMonths([{ month: label, totalSales, totalFees, feeRate, channelFees }]);
    } catch {
      setError("수수료 데이터를 불러오지 못했습니다");
    }
    setLoading(false);
  }, [storeId, supabase, getMonthRange]);

  useEffect(() => { loadMonthData(monthOffset); }, [loadMonthData, monthOffset]);

  const goToPrevMonth = useCallback(() => setMonthOffset((o) => o - 1), []);
  const goToNextMonth = useCallback(() => setMonthOffset((o) => Math.min(o + 1, 0)), []);

  // 수수료 설정 저장
  const saveFeeSettings = useCallback(async (data: {
    annual_revenue_tier: string;
    credit_card_rate: number;
    check_card_rate: number;
    check_card_ratio: number;
    card_payment_ratio: number;
  }) => {
    if (!storeId) return;
    if (feeSettings) {
      const { error: updateErr } = await supabase.from("sb_store_fee_settings")
        .update(data).eq("id", feeSettings.id);
      if (updateErr) { console.error("수수료 설정 저장 실패:", updateErr); return; }
    } else {
      const { error: insertErr } = await supabase.from("sb_store_fee_settings")
        .insert({ store_id: storeId, ...data });
      if (insertErr) { console.error("수수료 설정 생성 실패:", insertErr); return; }
    }
    await loadMonthData(monthOffset);
  }, [storeId, feeSettings, supabase, loadMonthData, monthOffset]);

  return {
    feeSettings, feeChannels, monthlyReport,
    profitability, recentMonths, loading, error, monthOffset,
    goToPrevMonth, goToNextMonth, saveFeeSettings,
  };
}
