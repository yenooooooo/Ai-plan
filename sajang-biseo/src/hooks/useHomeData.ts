"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString } from "@/lib/utils/date";

export interface HomeTodo {
  key: string;
  label: string;
  href: string;
  done: boolean;
  urgent?: boolean;
}

export interface HomeSummary {
  todaySales: number | null;
  yesterdaySales: number | null;
  monthlySales: number;
  monthlyDays: number;
  streak: number;
  pendingReviews: number;
  pendingOrders: boolean;
  recentExpenseTotal: number;
  todayMemo: string | null;
}

export function useHomeData() {
  const { storeId, storeName } = useStoreSettings();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<HomeSummary>({
    todaySales: null,
    yesterdaySales: null,
    monthlySales: 0,
    monthlyDays: 0,
    streak: 0,
    pendingReviews: 0,
    pendingOrders: false,
    recentExpenseTotal: 0,
    todayMemo: null,
  });

  const today = useMemo(() => toDateString(new Date()), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toDateString(d);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        // 오늘 마감 데이터
        const { data: todayClosing } = await supabase
          .from("sb_daily_closing")
          .select("total_sales, memo")
          .eq("store_id", storeId!)
          .eq("date", today)
          .maybeSingle();

        // 어제 마감 데이터
        const { data: yesterdayClosing } = await supabase
          .from("sb_daily_closing")
          .select("total_sales")
          .eq("store_id", storeId!)
          .eq("date", yesterday)
          .maybeSingle();

        // 이번 달 매출 합계
        const monthStart = today.slice(0, 7) + "-01";
        const { data: monthData } = await supabase
          .from("sb_daily_closing")
          .select("total_sales, date")
          .eq("store_id", storeId!)
          .gte("date", monthStart)
          .lte("date", today);

        const monthlySales = monthData?.reduce((s, r) => s + r.total_sales, 0) ?? 0;
        const monthlyDays = monthData?.length ?? 0;

        // 연속 마감 스트릭 (최근 30일)
        const { data: recentClosings } = await supabase
          .from("sb_daily_closing")
          .select("date")
          .eq("store_id", storeId!)
          .lte("date", today)
          .order("date", { ascending: false })
          .limit(30);

        let streak = 0;
        if (recentClosings && recentClosings.length > 0) {
          const d = new Date();
          // 오늘 아직 안 했으면 어제부터 카운트
          if (!todayClosing) d.setDate(d.getDate() - 1);
          const dateSet = new Set(recentClosings.map((r) => r.date));
          for (let i = 0; i < 30; i++) {
            const ds = toDateString(d);
            if (dateSet.has(ds)) {
              streak++;
              d.setDate(d.getDate() - 1);
            } else {
              break;
            }
          }
        }

        // 최근 경비 (이번 달)
        const expenseTotal = monthData?.reduce((s, r) => {
          const expenses = (r as Record<string, unknown>).daily_expenses as Array<{ amount: number }> | null;
          return s + (expenses?.reduce((es, e) => es + e.amount, 0) ?? 0);
        }, 0) ?? 0;

        setSummary({
          todaySales: todayClosing?.total_sales ?? null,
          yesterdaySales: yesterdayClosing?.total_sales ?? null,
          monthlySales,
          monthlyDays,
          streak,
          pendingReviews: 0,
          pendingOrders: false,
          recentExpenseTotal: expenseTotal,
          todayMemo: todayClosing?.memo ?? null,
        });
      } catch (err) {
        console.error("홈 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [storeId, today, yesterday]);

  // 오늘의 할 일
  const todos: HomeTodo[] = useMemo(() => {
    const list: HomeTodo[] = [];

    list.push({
      key: "closing",
      label: "오늘 마감 입력하기",
      href: "/closing",
      done: summary.todaySales !== null,
      urgent: true,
    });

    if (summary.yesterdaySales === null) {
      list.push({
        key: "yesterday",
        label: "어제 마감 입력 안 됨",
        href: "/closing",
        done: false,
        urgent: true,
      });
    }

    list.push({
      key: "review",
      label: "리뷰 답글 확인",
      href: "/review",
      done: false,
    });

    list.push({
      key: "briefing",
      label: "주간 브리핑 확인",
      href: "/briefing",
      done: false,
    });

    return list;
  }, [summary]);

  // 인사말
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "새벽에도 수고하세요";
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 14) return "점심 장사 파이팅";
    if (hour < 18) return "오후도 힘내세요";
    if (hour < 22) return "저녁 장사 파이팅";
    return "오늘 하루 고생하셨어요";
  }, []);

  return {
    loading,
    storeName,
    greeting,
    today,
    summary,
    todos,
  };
}
