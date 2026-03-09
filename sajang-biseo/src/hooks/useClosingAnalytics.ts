"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString, addDays } from "@/lib/utils/date";

interface ChartDataPoint {
  label: string;
  sales: number;
  date: string;
}

interface WeekdayDataPoint {
  day: string;
  avg: number;
}

export function useClosingAnalytics() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // 전날 매출 & 같은 요일 4주 평균
  const [prevDaySales, setPrevDaySales] = useState<number | null>(null);
  const [weekdayAvg, setWeekdayAvg] = useState<number | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    const today = new Date();
    const thirtyDaysAgo = toDateString(addDays(today, -30));

    const { data } = await supabase
      .from("sb_daily_closing")
      .select("date, total_sales")
      .eq("store_id", storeId)
      .is("deleted_at", null)
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: true });

    if (!data || data.length === 0) {
      setChartData([]);
      setWeekdayData([]);
      setPrevDaySales(null);
      setWeekdayAvg(null);
      setLoading(false);
      return;
    }

    // 차트 데이터 (최근 14일)
    const recent14 = data.slice(-14);
    const chart: ChartDataPoint[] = recent14.map((d) => {
      const dt = new Date(d.date + "T00:00:00");
      const dayName = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
      return {
        label: `${dt.getMonth() + 1}/${dt.getDate()}(${dayName})`,
        sales: d.total_sales,
        date: d.date,
      };
    });
    setChartData(chart);

    // 요일별 평균
    const dayMap: Record<string, number[]> = {};
    const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
    for (const d of data) {
      const dt = new Date(d.date + "T00:00:00");
      const dayName = DAYS[dt.getDay()];
      if (!dayMap[dayName]) dayMap[dayName] = [];
      dayMap[dayName].push(d.total_sales);
    }
    const weekday: WeekdayDataPoint[] = ["월", "화", "수", "목", "금", "토", "일"].map((day) => ({
      day,
      avg: dayMap[day]
        ? Math.round(dayMap[day].reduce((s, v) => s + v, 0) / dayMap[day].length)
        : 0,
    }));
    setWeekdayData(weekday);

    // 전날 매출
    const todayStr = toDateString(today);
    const sorted = data.filter((d) => d.date < todayStr);
    if (sorted.length > 0) {
      setPrevDaySales(sorted[sorted.length - 1].total_sales);
    }

    // 같은 요일 4주 평균
    const todayDayName = DAYS[today.getDay()];
    const sameDayData = data.filter((d) => {
      const dt = new Date(d.date + "T00:00:00");
      return DAYS[dt.getDay()] === todayDayName && d.date !== todayStr;
    });
    if (sameDayData.length > 0) {
      const avg = Math.round(
        sameDayData.slice(-4).reduce((s, d) => s + d.total_sales, 0) /
        Math.min(sameDayData.length, 4)
      );
      setWeekdayAvg(avg);
    }

    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // 월간 매출 합계
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthlyCurrent = useMemo(
    () => chartData.filter((d) => d.date >= monthStart).reduce((s, d) => s + d.sales, 0),
    [chartData, monthStart]
  );

  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDayOfMonth - now.getDate();
  const monthLabel = `${now.getMonth() + 1}월`;

  return {
    chartData, weekdayData, loading,
    prevDaySales, weekdayAvg,
    monthlyCurrent, daysRemaining, monthLabel,
    reload: loadAnalytics,
  };
}
