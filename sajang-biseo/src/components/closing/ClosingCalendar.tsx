"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { formatCompact } from "@/lib/utils/format";

interface CalendarDataPoint {
  date: string;
  sales: number;
}

interface ClosingCalendarProps {
  data: CalendarDataPoint[];
  monthLabel: string;
  onDateClick?: (date: string) => void;
}

const DAY_HEADERS = ["월", "화", "수", "목", "금", "토", "일"];

export function ClosingCalendar({ data, monthLabel, onDateClick }: ClosingCalendarProps) {
  const { weeks, maxSales } = useMemo(() => {
    if (data.length === 0) return { weeks: [], maxSales: 0 };

    const salesMap = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      salesMap.set(d.date, d.sales);
      if (d.sales > max) max = d.sales;
    }

    // 이번 달 날짜 그리드 생성
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();

    // 월요일 기준 시작 요일 (0=월, 6=일)
    const startDow = (firstDay.getDay() + 6) % 7;

    const cells: (null | { day: number; date: string; sales: number })[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date: dateStr, sales: salesMap.get(dateStr) ?? 0 });
    }

    // 주 단위로 분할
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return { weeks, maxSales: max };
  }, [data]);

  function getIntensity(sales: number): string {
    if (sales === 0 || maxSales === 0) return "bg-[var(--bg-tertiary)]";
    const ratio = sales / maxSales;
    if (ratio >= 0.8) return "bg-primary-500";
    if (ratio >= 0.6) return "bg-primary-400";
    if (ratio >= 0.4) return "bg-primary-300";
    if (ratio >= 0.2) return "bg-primary-200";
    return "bg-primary-100";
  }

  if (weeks.length === 0) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-primary-500" />
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">{monthLabel} 매출 달력</h3>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[10px] text-[var(--text-tertiary)] font-medium">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell, ci) => {
              if (!cell) return <div key={ci} className="aspect-square" />;
              const isToday = cell.date === todayStr;
              return (
                <button
                  key={ci}
                  onClick={() => onDateClick?.(cell.date)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors relative ${getIntensity(cell.sales)} ${
                    isToday ? "ring-2 ring-primary-500 ring-offset-1" : ""
                  } ${cell.sales > 0 ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className={`text-[10px] leading-none ${
                    cell.sales > 0 && cell.sales / maxSales >= 0.4 ? "text-white" : "text-[var(--text-secondary)]"
                  }`}>
                    {cell.day}
                  </span>
                  {cell.sales > 0 && (
                    <span className={`text-[8px] leading-none mt-0.5 font-display ${
                      cell.sales / maxSales >= 0.4 ? "text-white/80" : "text-[var(--text-tertiary)]"
                    }`}>
                      {formatCompact(cell.sales)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-[var(--text-tertiary)]">적음</span>
        {["bg-primary-100", "bg-primary-200", "bg-primary-300", "bg-primary-400", "bg-primary-500"].map((c) => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-[var(--text-tertiary)]">많음</span>
      </div>
    </motion.div>
  );
}
