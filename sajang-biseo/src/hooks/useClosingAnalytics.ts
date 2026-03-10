"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { toDateString, addDays, getWeekStart } from "@/lib/utils/date";

interface ChartDataPoint {
  label: string;
  sales: number;
  date: string;
}

interface WeekdayDataPoint {
  day: string;
  avg: number;
}

interface DailyRecord {
  date: string;
  total_sales: number;
  total_fees: number;
  daily_expenses: { name: string; amount: number }[] | null;
  custom_fees: { name: string; amount: number }[] | null;
}

export interface CalendarDataPoint {
  date: string;
  sales: number;
}

export interface ProfitTrendDataPoint {
  date: string;
  sales: number;
  fees: number;
  expenses: number;
}

export function useClosingAnalytics() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // 전날 매출 & 같은 요일 4주 평균
  const [prevDaySales, setPrevDaySales] = useState<number | null>(null);
  const [weekdayAvg, setWeekdayAvg] = useState<number | null>(null);

  const [allData, setAllData] = useState<DailyRecord[]>([]);

  const loadAnalytics = useCallback(async () => {
    if (!storeId) { setLoading(false); return; }
    setLoading(true);

    try {
    const today = new Date();
    const ninetyDaysAgo = toDateString(addDays(today, -90));

    const { data, error } = await supabase
      .from("sb_daily_closing")
      .select("date, total_sales, total_fees, daily_expenses, custom_fees")
      .eq("store_id", storeId)
      .is("deleted_at", null)
      .gte("date", ninetyDaysAgo)
      .order("date", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      setAllData([]);
      setChartData([]);
      setWeekdayData([]);
      setPrevDaySales(null);
      setWeekdayAvg(null);
      return;
    }

    setAllData(data as unknown as DailyRecord[]);

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
    } catch (err) {
      console.error("분석 데이터 로드 실패:", err);
      toast("분석 데이터를 불러오지 못했습니다", "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, supabase, toast]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // 주간 집계
  const weeklyChartData = useMemo(() => {
    if (allData.length === 0) return [];
    const weekMap = new Map<string, { total: number; startDate: string }>();
    for (const d of allData) {
      const dt = new Date(d.date + "T00:00:00");
      const ws = getWeekStart(dt);
      const key = toDateString(ws);
      const existing = weekMap.get(key);
      if (existing) {
        existing.total += d.total_sales;
      } else {
        weekMap.set(key, { total: d.total_sales, startDate: key });
      }
    }
    return Array.from(weekMap.entries()).map(([key, val]) => {
      const dt = new Date(key + "T00:00:00");
      const endDt = addDays(dt, 6);
      return {
        label: `${dt.getMonth() + 1}/${dt.getDate()}~${endDt.getDate()}`,
        sales: val.total,
        date: key,
      };
    }).slice(-8);
  }, [allData]);

  // 월간 집계
  const monthlyChartData = useMemo(() => {
    if (allData.length === 0) return [];
    const monthMap = new Map<string, number>();
    for (const d of allData) {
      const key = d.date.substring(0, 7);
      monthMap.set(key, (monthMap.get(key) ?? 0) + d.total_sales);
    }
    return Array.from(monthMap.entries()).map(([key, total]) => ({
      label: `${parseInt(key.split("-")[1])}월`,
      sales: total,
      date: `${key}-01`,
    }));
  }, [allData]);

  // 월간 매출 합계 (allData 기반)
  const { monthStart, lastDayOfMonth, nowMonth, nowDate, nowYear } = useMemo(() => {
    const n = new Date();
    return {
      monthStart: `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`,
      lastDayOfMonth: new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(),
      nowMonth: n.getMonth(),
      nowDate: n.getDate(),
      nowYear: n.getFullYear(),
    };
  }, []);

  const monthlyCurrent = useMemo(
    () => allData.filter((d) => d.date >= monthStart).reduce((s, d) => s + d.total_sales, 0),
    [allData, monthStart]
  );

  const daysRemaining = lastDayOfMonth - nowDate;
  const monthLabel = `${nowMonth + 1}월`;

  // 이번 주 / 지난 주 매출
  const { thisWeekSales, lastWeekSales } = useMemo(() => {
    const todayDate = new Date();
    const day = todayDate.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;
    const thisMonday = new Date(todayDate);
    thisMonday.setDate(todayDate.getDate() - mondayOffset);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    const thisStart = toDateString(thisMonday);
    const lastStart = toDateString(lastMonday);
    const lastEnd = toDateString(new Date(thisMonday.getTime() - 86_400_000));

    let thisWeek = 0, lastWeek = 0;
    let hasLastWeek = false;
    for (const d of allData) {
      if (d.date >= thisStart) thisWeek += d.total_sales;
      else if (d.date >= lastStart && d.date <= lastEnd) {
        lastWeek += d.total_sales;
        hasLastWeek = true;
      }
    }
    return { thisWeekSales: thisWeek, lastWeekSales: hasLastWeek ? lastWeek : null };
  }, [allData]);

  // 지난 달 동일 시점 매출
  const lastMonthSamePeriodSales = useMemo(() => {
    if (nowMonth === 0) return null; // 1월이면 지난해 12월 — 데이터 범위 밖
    const lastMonthStart = `${nowYear}-${String(nowMonth).padStart(2, "0")}-01`;
    const lastMonthLastDay = new Date(nowYear, nowMonth, 0).getDate();
    const sameDay = Math.min(nowDate, lastMonthLastDay);
    const lastMonthSameDay = `${nowYear}-${String(nowMonth).padStart(2, "0")}-${String(sameDay).padStart(2, "0")}`;
    let total = 0;
    let hasData = false;
    for (const d of allData) {
      if (d.date >= lastMonthStart && d.date <= lastMonthSameDay) {
        total += d.total_sales;
        hasData = true;
      }
    }
    return hasData ? total : null;
  }, [allData, nowYear, nowMonth, nowDate]);

  // 달력 데이터
  const calendarData: CalendarDataPoint[] = useMemo(() => {
    return allData
      .filter((d) => d.date >= monthStart)
      .map((d) => ({ date: d.date, sales: d.total_sales }));
  }, [allData, monthStart]);

  // 수익 트렌드 데이터
  const profitTrendData: ProfitTrendDataPoint[] = useMemo(() => {
    return allData.map((d) => {
      const expArr = (d.daily_expenses as { name: string; amount: number }[] | null) ?? [];
      const customArr = (d.custom_fees as { name: string; amount: number }[] | null) ?? [];
      const totalExp = expArr.reduce((s, e) => s + e.amount, 0) + customArr.reduce((s, f) => s + f.amount, 0);
      return { date: d.date, sales: d.total_sales, fees: d.total_fees ?? 0, expenses: totalExp };
    });
  }, [allData]);

  return {
    chartData, weeklyChartData, monthlyChartData,
    weekdayData, loading,
    prevDaySales, weekdayAvg,
    monthlyCurrent, daysRemaining, monthLabel,
    thisWeekSales, lastWeekSales,
    lastMonthSamePeriodSales,
    calendarData, profitTrendData,
    reload: loadAnalytics,
  };
}
