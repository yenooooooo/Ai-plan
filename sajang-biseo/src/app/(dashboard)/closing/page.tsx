"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Save, Check,
  BarChart3, Keyboard, BookmarkPlus, BookmarkCheck,
} from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { ChannelSlider } from "@/components/closing/ChannelSlider";
import { PaymentRatio } from "@/components/closing/PaymentRatio";
import { FeeBreakdownView } from "@/components/closing/FeeBreakdown";
import { TodayExpenses } from "@/components/closing/TodayExpenses";
import { ProfitSummary } from "@/components/closing/ProfitSummary";
import { TagMemo } from "@/components/closing/TagMemo";
import { DailyReportCard } from "@/components/closing/DailyReportCard";
import { SalesChart } from "@/components/closing/SalesChart";
import { WeekdayHeatmap } from "@/components/closing/WeekdayHeatmap";
import { MonthlyGoal } from "@/components/closing/MonthlyGoal";
import { formatCurrency } from "@/lib/utils/format";
import { addDays } from "@/lib/utils/date";
import { useClosingData } from "@/hooks/useClosingData";

type Tab = "input" | "analytics";

function generateDummyChartData() {
  const data = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    data.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      sales: Math.round(1_500_000 + Math.random() * 1_500_000),
      date: d.toISOString().split("T")[0],
    });
  }
  return data;
}

function generateWeekdayData() {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  return days.map((day) => ({ day, avg: Math.round(1_400_000 + Math.random() * 700_000) }));
}

export default function ClosingPage() {
  const {
    mode, selectedDate, totalSales, setTotalSales,
    channels, setChannels, cardRatio, setCardRatio,
    memo, setMemo, saving, saved,
    presets, activePreset, setActivePreset,
    feeResult, animatedAmount,
    dateLabel, isToday,
    moveDate, applyPreset, handleSave,
    setFeeRateMap, setDeliveryFeePerOrder, setCardCreditRate,
    customFees, setCustomFees,
    todayExpenses, setTodayExpenses,
    tags, setTags,
  } = useClosingData();

  const [tab, setTab] = useState<Tab>("input");
  const [chartMode, setChartMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [monthlyGoal, setMonthlyGoal] = useState(40_000_000);
  const chartData = useMemo(generateDummyChartData, []);
  const weekdayData = useMemo(generateWeekdayData, []);
  const monthlyCurrent = useMemo(() => chartData.reduce((sum, d) => sum + d.sales, 0), [chartData]);

  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDayOfMonth - now.getDate();
  const monthLabel = `${now.getMonth() + 1}월`;

  return (
    <div className="animate-fade-in space-y-5 max-w-lg mx-auto">
      {/* 탭 전환 */}
      <div className="flex h-10 bg-[var(--bg-tertiary)] rounded-xl p-0.5">
        {[
          { key: "input" as const, label: "매출 입력", icon: Keyboard },
          { key: "analytics" as const, label: "분석", icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 flex items-center justify-center gap-1.5 rounded-[10px] text-[14px] font-medium transition-all duration-200 ${tab === key ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)]"}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "input" ? (
          <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
            {/* 날짜 선택 */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => moveDate(-1)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2 text-heading-md text-[var(--text-primary)]">
                <CalendarDays size={18} className="text-[var(--text-tertiary)]" />
                <span>{isToday ? `오늘 ${dateLabel}` : dateLabel}</span>
              </div>
              <button onClick={() => moveDate(1)} disabled={isToday} className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 금액 표시 */}
            <div className="text-center py-4">
              <p className="text-caption text-[var(--text-tertiary)] mb-1">{mode === "net" ? "실 수령액 (예상)" : "총매출"}</p>
              <p className="amount-hero text-[var(--text-primary)]">
                <span className="won-symbol">₩</span>
                {animatedAmount.toLocaleString("ko-KR")}
              </p>
              {totalSales > 0 && mode === "gross" && feeResult.totalFees > 0 && (
                <p className="text-body-small font-display text-[var(--text-tertiary)] mt-1">
                  수수료 후 <span className="text-[var(--net-income)]">{formatCurrency(feeResult.netSales)}</span>
                </p>
              )}
            </div>

            {/* 프리셋 */}
            <div className="flex gap-2">
              {presets.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset)} className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium transition-all duration-200 press-effect ${activePreset === preset.name ? "bg-primary-500/10 text-primary-500 border border-primary-500/30" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"}`}>
                  {activePreset === preset.name ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                  {preset.name}
                </button>
              ))}
            </div>

            <NumericKeypad value={totalSales} onChange={setTotalSales} />

            {/* 채널 분배 */}
            <div className="glass-card p-5">
              <ChannelSlider channels={channels} totalSales={totalSales} onChange={(updated) => { setChannels(updated); setActivePreset(null); }} />
            </div>

            {/* 결제수단 비율 */}
            <div className="glass-card p-5">
              <PaymentRatio cardRatio={cardRatio} onChange={(v) => { setCardRatio(v); setActivePreset(null); }} />
            </div>

            {totalSales > 0 && (
              <FeeBreakdownView
                result={feeResult}
                onPlatformRateChange={(channel, rate) =>
                  setFeeRateMap((prev) => ({ ...prev, [channel]: rate }))
                }
                onDeliveryFeeChange={setDeliveryFeePerOrder}
                onCardRateChange={setCardCreditRate}
                customFees={customFees}
                onCustomFeeAdd={(fee) => setCustomFees((prev) => [...prev, fee])}
                onCustomFeeRemove={(idx) => setCustomFees((prev) => prev.filter((_, i) => i !== idx))}
              />
            )}

            <TodayExpenses expenses={todayExpenses} onChange={setTodayExpenses} />

            {totalSales > 0 && (
              <ProfitSummary
                totalSales={totalSales}
                totalFees={feeResult.totalFees + customFees.reduce((s, f) => s + f.amount, 0)}
                totalExpenses={todayExpenses.reduce((s, e) => s + e.amount, 0)}
              />
            )}

            <TagMemo
              tags={tags}
              memo={memo}
              onTagsChange={setTags}
              onMemoChange={setMemo}
            />

            {/* 저장 버튼 */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={totalSales === 0 || saving || saved} className={`w-full h-14 rounded-[14px] font-body font-semibold text-[1rem] flex items-center justify-center gap-2 transition-all duration-300 ease-smooth ${saved ? "bg-success text-white" : "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg"} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : saved ? (<><Check size={18} />저장 완료</>) : (<><Save size={18} />마감 저장</>)}
            </motion.button>

            {saved && (
              <DailyReportCard
                totalSales={totalSales}
                feeResult={feeResult}
                prevDaySales={null}
                weekdayAvg={null}
                date={selectedDate}
                channelRatios={channels}
              />
            )}
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-5">
            <SalesChart data={chartData} mode={chartMode} onModeChange={setChartMode} />
            <WeekdayHeatmap data={weekdayData} />
            <MonthlyGoal currentSales={monthlyCurrent} goal={monthlyGoal} onGoalChange={setMonthlyGoal} daysRemaining={daysRemaining} monthLabel={monthLabel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
