"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { toDateString, getThisMonthRange } from "@/lib/utils/date";
import {
  buildMonthlyReport, buildProfitability,
  type MonthlyFeeReport, type ChannelProfitability,
} from "@/lib/fees/aggregateFeesData";
import type { FeeChannel, StoreFeeSettings } from "@/lib/supabase/types";

export type { MonthlyFeeReport, ChannelProfitability };

export function useFeesData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const [feeSettings, setFeeSettings] = useState<StoreFeeSettings | null>(null);
  const [feeChannels, setFeeChannels] = useState<FeeChannel[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyFeeReport | null>(null);
  const [profitability, setProfitability] = useState<ChannelProfitability[]>([]);
  const [prevProfitability, setPrevProfitability] = useState<ChannelProfitability[]>([]);
  const [recentMonths, setRecentMonths] = useState<MonthlyFeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const getMonthRange = useCallback((offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    const { start, end } = getThisMonthRange(d);
    return { start: toDateString(start), end: toDateString(end), label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  }, []);

  const loadMonthData = useCallback(async (offset: number) => {
    if (!storeId) return;
    setLoading(true);
    setError(null);

    const cur = getMonthRange(offset);
    const prev = getMonthRange(offset - 1);
    // 6개월 추이
    const sixAgo = getMonthRange(offset - 5);

    try {
      const [settingsRes, channelsConfigRes, closingsRes, chRes, prevClosingsRes, prevChRes, trendClosingsRes, trendChRes] =
        await Promise.all([
          supabase.from("sb_store_fee_settings").select("*").eq("store_id", storeId).maybeSingle(),
          supabase.from("sb_fee_channels").select("*").eq("store_id", storeId).eq("is_active", true).is("deleted_at", null).order("sort_order"),
          supabase.from("sb_daily_closing").select("*").eq("store_id", storeId).gte("date", cur.start).lte("date", cur.end).is("deleted_at", null),
          supabase.from("sb_daily_closing_channels").select("*").eq("store_id", storeId).gte("created_at", cur.start + "T00:00:00").lte("created_at", cur.end + "T23:59:59"),
          supabase.from("sb_daily_closing").select("*").eq("store_id", storeId).gte("date", prev.start).lte("date", prev.end).is("deleted_at", null),
          supabase.from("sb_daily_closing_channels").select("*").eq("store_id", storeId).gte("created_at", prev.start + "T00:00:00").lte("created_at", prev.end + "T23:59:59"),
          supabase.from("sb_daily_closing").select("*").eq("store_id", storeId).gte("date", sixAgo.start).lte("date", cur.end).is("deleted_at", null).order("date"),
          supabase.from("sb_daily_closing_channels").select("*").eq("store_id", storeId).gte("created_at", sixAgo.start + "T00:00:00").lte("created_at", cur.end + "T23:59:59"),
        ]);

      if (closingsRes.error || chRes.error) {
        setError("수수료 데이터를 불러오지 못했습니다");
        toast("수수료 데이터를 불러오지 못했습니다", "error");
        setLoading(false);
        return;
      }

      setFeeSettings(settingsRes.data);
      setFeeChannels(channelsConfigRes.data ?? []);

      // 현재 월 리포트
      const report = buildMonthlyReport(closingsRes.data ?? [], chRes.data ?? [], cur.label);
      setMonthlyReport(report);
      setProfitability(buildProfitability(closingsRes.data ?? [], chRes.data ?? []));

      // 전월 수익성 (비교용)
      setPrevProfitability(buildProfitability(prevClosingsRes.data ?? [], prevChRes.data ?? []));

      // 6개월 추이
      const trendClosings = trendClosingsRes.data ?? [];
      const trendChannels = trendChRes.data ?? [];
      const months: MonthlyFeeReport[] = [];
      for (let i = -5; i <= 0; i++) {
        const m = getMonthRange(offset + i);
        const mc = trendClosings.filter((c) => c.date >= m.start && c.date <= m.end);
        if (mc.length > 0) {
          months.push(buildMonthlyReport(mc, trendChannels, m.label));
        }
      }
      setRecentMonths(months);
    } catch {
      setError("수수료 데이터를 불러오지 못했습니다");
      toast("수수료 데이터를 불러오지 못했습니다", "error");
    }
    setLoading(false);
  }, [storeId, supabase, getMonthRange, toast]);

  useEffect(() => { loadMonthData(monthOffset); }, [loadMonthData, monthOffset]);

  const goToPrevMonth = useCallback(() => setMonthOffset((o) => o - 1), []);
  const goToNextMonth = useCallback(() => setMonthOffset((o) => Math.min(o + 1, 0)), []);

  // 수수료 설정 저장
  const saveFeeSettings = useCallback(async (data: {
    annual_revenue_tier: string; credit_card_rate: number;
    check_card_rate: number; check_card_ratio: number; card_payment_ratio: number;
  }) => {
    if (!storeId) return;
    const table = supabase.from("sb_store_fee_settings");
    const { error: err } = feeSettings
      ? await table.update(data).eq("id", feeSettings.id)
      : await table.insert({ store_id: storeId, ...data });
    if (err) { toast("수수료 설정 저장에 실패했습니다", "error"); return; }
    toast("수수료 설정이 저장되었습니다", "success");
    await loadMonthData(monthOffset);
  }, [storeId, feeSettings, supabase, loadMonthData, monthOffset, toast]);

  // 채널 추가
  const addChannel = useCallback(async (data: {
    channel_name: string; fee_type: "percentage" | "fixed"; rate: number; category: string;
  }) => {
    if (!storeId) return;
    const { error: err } = await supabase.from("sb_fee_channels").insert({
      store_id: storeId, channel_name: data.channel_name,
      fee_type: data.fee_type, rate: data.rate,
      category: data.category as "delivery", is_active: true,
    });
    if (err) { toast("채널 추가에 실패했습니다", "error"); return; }
    toast("채널이 추가되었습니다", "success");
    await loadMonthData(monthOffset);
  }, [storeId, supabase, loadMonthData, monthOffset, toast]);

  // 채널 삭제 (soft)
  const deleteChannel = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("sb_fee_channels")
      .update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
    if (err) { toast("채널 삭제에 실패했습니다", "error"); return; }
    toast("채널이 삭제되었습니다", "success");
    await loadMonthData(monthOffset);
  }, [supabase, loadMonthData, monthOffset, toast]);

  return {
    feeSettings, feeChannels, monthlyReport,
    profitability, prevProfitability, recentMonths,
    loading, error, monthOffset,
    goToPrevMonth, goToNextMonth,
    saveFeeSettings, addChannel, deleteChannel,
  };
}
