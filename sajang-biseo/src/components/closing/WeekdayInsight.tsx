"use client";

import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const WEEKDAY_TIPS: Record<number, string> = {
  0: "일요일은 가족 외식 수요가 많습니다. 세트 메뉴를 강조해보세요.",
  1: "월요일은 보통 매출이 낮은 편입니다. 재고 정리에 좋은 날이에요.",
  2: "화요일은 평일 중 가장 안정적인 날입니다.",
  3: "수요일은 주중 반환점! 중간 점검하기 좋은 타이밍입니다.",
  4: "목요일부터 주말 준비를 시작하세요. 식자재 발주 체크!",
  5: "금요일은 매출 피크 시작! 재료 충분히 준비하세요.",
  6: "토요일은 최고 매출일입니다. 인력과 재료 모두 충분히!",
};

interface WeekdayInsightProps {
  selectedDate: string;
  totalSales: number;
  weekdayAvg: number | null;
  prevDaySales: number | null;
}

export function WeekdayInsight({ selectedDate, totalSales, weekdayAvg, prevDaySales }: WeekdayInsightProps) {
  if (totalSales === 0) return null;

  const dayOfWeek = new Date(selectedDate + "T00:00:00").getDay();
  const dayName = DAY_NAMES[dayOfWeek];
  const tip = WEEKDAY_TIPS[dayOfWeek];

  const vsAvg = weekdayAvg && weekdayAvg > 0
    ? ((totalSales - weekdayAvg) / weekdayAvg) * 100
    : null;

  const vsPrev = prevDaySales && prevDaySales > 0
    ? ((totalSales - prevDaySales) / prevDaySales) * 100
    : null;

  return (
    <div className="glass-card p-4 space-y-2 animate-fade-in">
      <div className="flex items-center gap-1.5 text-body-small font-medium text-[var(--text-secondary)]">
        <Lightbulb size={14} className="text-warning" />
        {dayName}요일 인사이트
      </div>

      <div className="flex flex-wrap gap-3 text-caption">
        {vsAvg !== null && (
          <div className={`flex items-center gap-1 ${vsAvg > 5 ? "text-success" : vsAvg < -5 ? "text-danger" : "text-[var(--text-tertiary)]"}`}>
            {vsAvg > 5 ? <TrendingUp size={13} /> : vsAvg < -5 ? <TrendingDown size={13} /> : <Minus size={13} />}
            <span>{dayName}요일 평균 대비 {vsAvg >= 0 ? "+" : ""}{vsAvg.toFixed(1)}%</span>
          </div>
        )}
        {vsPrev !== null && (
          <div className={`flex items-center gap-1 ${vsPrev > 0 ? "text-success" : vsPrev < 0 ? "text-danger" : "text-[var(--text-tertiary)]"}`}>
            {vsPrev > 0 ? <TrendingUp size={13} /> : vsPrev < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
            <span>전일 대비 {vsPrev >= 0 ? "+" : ""}{vsPrev.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {tip && (
        <p className="text-caption text-[var(--text-tertiary)] leading-relaxed">{tip}</p>
      )}
    </div>
  );
}
