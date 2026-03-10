"use client";

import { useState } from "react";
import { BarChart3, CalendarDays } from "lucide-react";
import { SalesChart } from "@/components/closing/SalesChart";
import { WeekdayHeatmap } from "@/components/closing/WeekdayHeatmap";
import { MonthlyGoal } from "@/components/closing/MonthlyGoal";
import { GoalAlertBanner } from "@/components/closing/GoalAlertBanner";
import { SalesComparison } from "@/components/closing/SalesComparison";
import { ClosingCalendar } from "@/components/closing/ClosingCalendar";
import { ProfitTrend } from "@/components/closing/ProfitTrend";

interface ClosingAnalyticsTabProps {
  analytics: {
    chartData: { label: string; sales: number; date: string }[];
    weeklyChartData: { label: string; sales: number; date: string }[];
    monthlyChartData: { label: string; sales: number; date: string }[];
    weekdayData: { day: string; avg: number }[];
    loading: boolean;
    prevDaySales: number | null;
    monthlyCurrent: number;
    daysRemaining: number;
    monthLabel: string;
    thisWeekSales: number;
    lastWeekSales: number | null;
    lastMonthSamePeriodSales: number | null;
    calendarData: { date: string; sales: number }[];
    profitTrendData: { date: string; sales: number; fees: number; expenses: number }[];
  };
  todaySales: number;
  monthlyGoal: number;
  onGoalChange: (goal: number) => void;
}

export function ClosingAnalyticsTab({ analytics, todaySales, monthlyGoal, onGoalChange }: ClosingAnalyticsTabProps) {
  const [chartMode, setChartMode] = useState<"daily" | "weekly" | "monthly">("daily");

  if (analytics.loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <GoalAlertBanner
        currentSales={analytics.monthlyCurrent}
        goal={monthlyGoal}
        daysRemaining={analytics.daysRemaining}
        monthLabel={analytics.monthLabel}
      />

      {analytics.chartData.length > 0 ? (
        <SalesChart
          data={
            chartMode === "weekly" ? analytics.weeklyChartData
            : chartMode === "monthly" ? analytics.monthlyChartData
            : analytics.chartData
          }
          mode={chartMode}
          onModeChange={setChartMode}
        />
      ) : (
        <div className="glass-card p-8 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-body-small text-[var(--text-secondary)] font-medium">매출 추이</p>
          <p className="text-caption text-[var(--text-tertiary)] mt-1">마감 데이터가 쌓이면 매출 그래프가 표시됩니다</p>
        </div>
      )}

      {analytics.weekdayData.length > 0 && analytics.weekdayData.some((d) => d.avg > 0) ? (
        <WeekdayHeatmap data={analytics.weekdayData} />
      ) : (
        <div className="glass-card p-8 text-center">
          <CalendarDays size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-body-small text-[var(--text-secondary)] font-medium">요일별 매출</p>
          <p className="text-caption text-[var(--text-tertiary)] mt-1">일주일 이상의 데이터가 필요합니다</p>
        </div>
      )}

      <SalesComparison
        todaySales={todaySales}
        prevDaySales={analytics.prevDaySales}
        thisWeekSales={analytics.thisWeekSales}
        lastWeekSales={analytics.lastWeekSales}
        thisMonthSales={analytics.monthlyCurrent}
        lastMonthSales={analytics.lastMonthSamePeriodSales}
      />

      <ClosingCalendar data={analytics.calendarData} monthLabel={analytics.monthLabel} />

      <ProfitTrend
        data={analytics.profitTrendData}
        monthLabel={analytics.monthLabel}
        daysRemaining={analytics.daysRemaining}
      />

      <MonthlyGoal
        currentSales={analytics.monthlyCurrent}
        goal={monthlyGoal}
        onGoalChange={onGoalChange}
        daysRemaining={analytics.daysRemaining}
        monthLabel={analytics.monthLabel}
      />
    </>
  );
}
