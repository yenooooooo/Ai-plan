"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString, addDays, getThisWeekRange } from "@/lib/utils/date";
import {
  aggregateSales,
  aggregateFees,
  aggregateExpenses,
  aggregateIngredients,
  aggregateReputation,
} from "@/lib/briefing/aggregator";
import type { BriefingData, AiCoachingData } from "@/lib/briefing/types";
import type { WeeklyBriefing } from "@/lib/supabase/types";

export function useBriefingData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();

  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [archives, setArchives] = useState<WeeklyBriefing[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 현재 선택된 주 (기본: 지난주)
  const [weekOffset, setWeekOffset] = useState(-1);

  const getWeekRange = useCallback((offset: number) => {
    const ref = addDays(new Date(), offset * 7);
    const { start, end } = getThisWeekRange(ref);
    return { start: toDateString(start), end: toDateString(end) };
  }, []);

  // 데이터 로드 및 집계
  const loadBriefing = useCallback(async (offset: number) => {
    if (!storeId) return;
    setLoading(true);
    setError(null);

    const { start, end } = getWeekRange(offset);
    const prevRange = getWeekRange(offset - 1);

    try {
    // 병렬 쿼리
    const [closingsRes, channelsRes, prevClosingsRes, receiptsRes, reviewsRes, prevReviewsRes, usagesRes, itemsRes, savedRes] =
      await Promise.all([
        supabase.from("sb_daily_closing").select("*")
          .eq("store_id", storeId).gte("date", start).lte("date", end)
          .is("deleted_at", null).order("date"),
        supabase.from("sb_daily_closing_channels").select("*")
          .eq("store_id", storeId)
          .gte("created_at", start).lte("created_at", end + "T23:59:59"),
        supabase.from("sb_daily_closing").select("*")
          .eq("store_id", storeId).gte("date", prevRange.start).lte("date", prevRange.end)
          .is("deleted_at", null),
        supabase.from("sb_receipts").select("*")
          .eq("store_id", storeId).gte("date", start).lte("date", end)
          .is("deleted_at", null),
        supabase.from("sb_reviews").select("*")
          .eq("store_id", storeId).gte("created_at", start).lte("created_at", end + "T23:59:59")
          .is("deleted_at", null),
        supabase.from("sb_reviews").select("*")
          .eq("store_id", storeId).gte("created_at", prevRange.start).lte("created_at", prevRange.end + "T23:59:59")
          .is("deleted_at", null),
        supabase.from("sb_daily_usage").select("*")
          .eq("store_id", storeId).gte("date", start).lte("date", end),
        supabase.from("sb_order_items").select("*")
          .eq("store_id", storeId).eq("is_active", true).is("deleted_at", null),
        supabase.from("sb_weekly_briefings").select("*")
          .eq("store_id", storeId).eq("week_start", start).single(),
      ]);

    // 쿼리 에러 체크
    const queryError = [closingsRes, channelsRes, prevClosingsRes, receiptsRes, reviewsRes, prevReviewsRes, usagesRes, itemsRes]
      .find((r) => r.error);
    if (queryError?.error) {
      setError("브리핑 데이터를 불러오지 못했습니다");
      setLoading(false);
      return;
    }

    const closings = closingsRes.data ?? [];
    const channels = channelsRes.data ?? [];
    const prevClosings = prevClosingsRes.data ?? [];
    const receipts = receiptsRes.data ?? [];
    const reviews = reviewsRes.data ?? [];
    const prevReviews = prevReviewsRes.data ?? [];
    const usages = usagesRes.data ?? [];
    const items = itemsRes.data ?? [];

    const sales = aggregateSales(closings, channels, prevClosings);
    const fees = aggregateFees(closings, channels, prevClosings);
    const expenses = aggregateExpenses(receipts, sales.totalSales, sales.netSales);
    const ingredients = aggregateIngredients(usages, items);
    const reputation = aggregateReputation(reviews, prevReviews);

    // 저장된 AI 코칭 사용 또는 기본값
    const savedCoaching = savedRes.data?.ai_coaching as AiCoachingData | null;
    const coaching: AiCoachingData = savedCoaching ?? {
      insight: "데이터를 분석하여 AI 코칭을 생성해보세요.",
      actions: [],
      goals: [],
    };

    setBriefing({ weekStart: start, weekEnd: end, sales, fees, expenses, ingredients, reputation, coaching });
    } catch {
      setError("브리핑 데이터를 불러오지 못했습니다");
    }
    setLoading(false);
  }, [storeId, supabase, getWeekRange]);

  // 아카이브 로드
  const loadArchives = useCallback(async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from("sb_weekly_briefings").select("*")
      .eq("store_id", storeId)
      .order("week_start", { ascending: false })
      .limit(20);
    setArchives(data ?? []);
  }, [storeId, supabase]);

  useEffect(() => { loadBriefing(weekOffset); }, [loadBriefing, weekOffset]);
  useEffect(() => { loadArchives(); }, [loadArchives]);

  // AI 코칭 생성
  const generateCoaching = useCallback(async () => {
    if (!briefing || !storeId) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/briefing/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sales: briefing.sales,
          fees: briefing.fees,
          expenses: briefing.expenses,
          ingredients: briefing.ingredients,
          reputation: briefing.reputation,
        }),
      });
      if (!res.ok) throw new Error("코칭 생성 실패");
      const json = await res.json();
      if (json.success && json.data) {
        const coaching = json.data as AiCoachingData;
        setBriefing((prev) => prev ? { ...prev, coaching } : null);

        // DB 저장
        const { start, end } = getWeekRange(weekOffset);
        const { error: upsertError } = await supabase.from("sb_weekly_briefings").upsert({
          store_id: storeId,
          week_start: start,
          week_end: end,
          sales_summary: briefing.sales as unknown as import("@/lib/supabase/types").Json,
          fee_summary: briefing.fees as unknown as import("@/lib/supabase/types").Json,
          expense_summary: briefing.expenses as unknown as import("@/lib/supabase/types").Json,
          ingredient_efficiency: briefing.ingredients as unknown as import("@/lib/supabase/types").Json,
          customer_reputation: briefing.reputation as unknown as import("@/lib/supabase/types").Json,
          ai_coaching: coaching as unknown as import("@/lib/supabase/types").Json,
        }, { onConflict: "store_id,week_start" });
        if (upsertError) console.error("브리핑 저장 실패:", upsertError);
      }
    } catch (err) {
      console.error("코칭 생성 오류:", err);
    }
    setGenerating(false);
  }, [briefing, storeId, supabase, getWeekRange, weekOffset]);

  // 주 이동
  const goToPrevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const goToNextWeek = useCallback(() => setWeekOffset((o) => Math.min(o + 1, 0)), []);
  const goToWeek = useCallback((start: string) => {
    const target = new Date(start + "T00:00:00");
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 86400000));
    setWeekOffset(diffWeeks);
  }, []);

  return {
    briefing, loading, generating, archives, error,
    weekOffset, generateCoaching,
    goToPrevWeek, goToNextWeek, goToWeek,
  };
}
