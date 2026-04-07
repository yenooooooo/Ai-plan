"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerModalProps {
  selectedDate: string; // YYYY-MM-DD
  closedDates?: Set<string>; // 마감 완료된 날짜들
  onSelect: (date: string) => void;
  onClose: () => void;
}

const DAY_HEADERS = ["월", "화", "수", "목", "금", "토", "일"];

export function DatePickerModal({ selectedDate, closedDates, onSelect, onClose }: DatePickerModalProps) {
  const [year, setYear] = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [month, setMonth] = useState(() => parseInt(selectedDate.slice(5, 7)));

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    const startDow = (firstDay.getDay() + 6) % 7; // 월=0, 일=6

    const cells: (null | { day: number; date: string })[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay; d++) {
      cells.push({
        day: d,
        date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const row = cells.slice(i, i + 7);
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const now = new Date();
    const nextY = month === 12 ? year + 1 : year;
    const nextM = month === 12 ? 1 : month + 1;
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth() + 1)) return;
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const isNextDisabled = (() => {
    const now = new Date();
    const nextM = month === 12 ? 1 : month + 1;
    const nextY = month === 12 ? year + 1 : year;
    return nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth() + 1);
  })();

  function handleSelect(date: string) {
    if (date > today) return;
    onSelect(date);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        onClick={onClose}
      >
        {/* 배경 */}
        <div className="absolute inset-0 bg-black/40" />

        {/* 모달 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[320px] bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-4"
        >
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={16} />
          </button>

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-body-small font-semibold text-[var(--text-primary)] min-w-[100px] text-center">
              {year}년 {month}월
            </span>
            <button
              onClick={nextMonth}
              disabled={isNextDisabled}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-[11px] text-[var(--text-tertiary)] font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((cell, ci) => {
                  if (!cell) return <div key={ci} className="aspect-square" />;

                  const isSelected = cell.date === selectedDate;
                  const isToday = cell.date === today;
                  const isFuture = cell.date > today;
                  const isClosed = closedDates?.has(cell.date);

                  return (
                    <button
                      key={ci}
                      onClick={() => handleSelect(cell.date)}
                      disabled={isFuture}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[13px] font-medium transition-all
                        ${isSelected
                          ? "bg-primary-500 text-white"
                          : isToday
                            ? "ring-2 ring-primary-500 ring-offset-1 text-primary-500 bg-[var(--bg-tertiary)]"
                            : isFuture
                              ? "text-[var(--text-tertiary)]/30 cursor-not-allowed"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                        }`}
                    >
                      {cell.day}
                      {isClosed && !isSelected && (
                        <div className="w-1 h-1 rounded-full bg-primary-400 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 오늘 버튼 */}
          <button
            onClick={() => handleSelect(today)}
            className="w-full mt-3 py-2 rounded-xl text-caption font-medium text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 transition-colors"
          >
            오늘로 이동
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
