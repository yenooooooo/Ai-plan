"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Save, Check,
  BarChart3, Keyboard, BookmarkPlus, BookmarkCheck, Copy, CopyCheck,
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
import { useClosingData } from "@/hooks/useClosingData";
import { useClosingAnalytics } from "@/hooks/useClosingAnalytics";

type Tab = "input" | "analytics";

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
    copyFromPreviousDay, generateReportText,
  } = useClosingData();

  const analytics = useClosingAnalytics();

  const [tab, setTab] = useState<Tab>("input");
  const [chartMode, setChartMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [monthlyGoal, setMonthlyGoal] = useState(40_000_000);
  const [reportCopied, setReportCopied] = useState(false);

  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    } catch { /* fallback */ }
  }

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

            {/* 프리셋 + 전날복사 */}
            <div className="flex gap-2 flex-wrap">
              {presets.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset)} className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium transition-all duration-200 press-effect ${activePreset === preset.name ? "bg-primary-500/10 text-primary-500 border border-primary-500/30" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent hover:text-[var(--text-secondary)]"}`}>
                  {activePreset === preset.name ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                  {preset.name}
                </button>
              ))}
              {!saved && totalSales === 0 && (
                <button
                  onClick={copyFromPreviousDay}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium
                    bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent
                    hover:text-primary-500 hover:border-primary-500/30 transition-all press-effect"
                >
                  <Copy size={13} />
                  전날 복사
                </button>
              )}
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
              <>
                <DailyReportCard
                  totalSales={totalSales}
                  feeResult={feeResult}
                  prevDaySales={analytics.prevDaySales}
                  weekdayAvg={analytics.weekdayAvg}
                  date={selectedDate}
                  channelRatios={channels}
                />
                {/* 리포트 공유 버튼 */}
                <button
                  onClick={handleCopyReport}
                  className={`w-full py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect transition-all ${
                    reportCopied
                      ? "bg-success/10 text-success"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500"
                  }`}
                >
                  {reportCopied ? <><CopyCheck size={16} />복사됨!</> : <><Copy size={16} />리포트 복사 (카카오톡/문자)</>}
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-5">
            {analytics.loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {analytics.chartData.length > 0 ? (
                  <SalesChart data={analytics.chartData} mode={chartMode} onModeChange={setChartMode} />
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
                <MonthlyGoal currentSales={analytics.monthlyCurrent} goal={monthlyGoal} onGoalChange={setMonthlyGoal} daysRemaining={analytics.daysRemaining} monthLabel={analytics.monthLabel} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
