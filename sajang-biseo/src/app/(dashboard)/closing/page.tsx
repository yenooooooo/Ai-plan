"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Save,
  BarChart3, Keyboard, BookmarkPlus, BookmarkCheck, Copy, CopyCheck,
  LayoutGrid, CreditCard, Receipt, Tag, Wallet, Edit3, MessageSquare,
} from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { ChannelSlider } from "@/components/closing/ChannelSlider";
import { PaymentRatio } from "@/components/closing/PaymentRatio";
import { FeeBreakdownView } from "@/components/closing/FeeBreakdown";
import { TodayExpenses } from "@/components/closing/TodayExpenses";
import { ProfitSummary } from "@/components/closing/ProfitSummary";
import { TagMemo } from "@/components/closing/TagMemo";
import { DailyReportCard } from "@/components/closing/DailyReportCard";
import { AccordionSection } from "@/components/closing/AccordionSection";
import { StickyProfitBar } from "@/components/closing/StickyProfitBar";
import { ClosingExport } from "@/components/closing/ClosingExport";
import { RecurringExpenses } from "@/components/closing/RecurringExpenses";
import { ClosingAnalyticsTab } from "@/components/closing/ClosingAnalyticsTab";
import { VoiceInput } from "@/components/closing/VoiceInput";
import { ChatInput } from "@/components/closing/ChatInput";
import { WeekdayInsight } from "@/components/closing/WeekdayInsight";
import { MonthEndSummary } from "@/components/closing/MonthEndSummary";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import { formatCurrency } from "@/lib/utils/format";
import { formatDateShort, parseDate } from "@/lib/utils/date";
import { useClosingData } from "@/hooks/useClosingData";
import { useClosingAnalytics } from "@/hooks/useClosingAnalytics";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useRecurringExpenses } from "@/stores/useRecurringExpenses";
import { useUIState } from "@/stores/useUIState";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/stores/useToast";

type Tab = "input" | "analytics";

export default function ClosingPage() {
  const {
    mode, selectedDate, totalSales, setTotalSales,
    channels, setChannels, cardRatio, setCardRatio,
    memo, setMemo, saving, saved, setSaved,
    presets, activePreset, setActivePreset,
    feeResult, animatedAmount,
    dateLabel, isToday,
    moveDate, goToDate, applyPreset, handleSave,
    setFeeRateMap, setDeliveryFeePerOrder, setCardCreditRate,
    customFees, setCustomFees,
    todayExpenses, setTodayExpenses,
    tags, setTags,
    copyFromPreviousDay, previousClosingDate, generateReportText,
  } = useClosingData();

  const analytics = useClosingAnalytics();
  const { monthlyGoal, setMonthlyGoal } = useStoreSettings();
  const { expenses: recurringExpenses, setExpenses: setRecurringExpenses } = useRecurringExpenses();
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const closingTab = useUIState((s) => s.closingTab);
  const setClosingTab = useUIState((s) => s.setClosingTab);
  const tab = closingTab as Tab;
  const setTab = setClosingTab;
  const [reportCopied, setReportCopied] = useState(false);
  const [showMonthSummary, setShowMonthSummary] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // 미저장 경고
  const isDirty = !saved && (totalSales > 0 || memo !== "" || tags.length > 0 || todayExpenses.length > 0);
  useUnsavedGuard(isDirty);

  function handleCalendarDateClick(date: string) {
    goToDate(date);
    setTab("input");
  }

  async function handleImportReceipts() {
    if (!storeId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("sb_receipts")
      .select("merchant_name, total_amount")
      .eq("store_id", storeId)
      .eq("date", selectedDate)
      .is("deleted_at", null);
    if (!data || data.length === 0) {
      toast("해당 날짜의 영수증 경비가 없습니다", "info");
      return;
    }
    const existing = new Set(todayExpenses.map((e) => `${e.name}_${e.amount}`));
    const newItems = data
      .filter((r) => !existing.has(`${r.merchant_name}_${r.total_amount}`))
      .map((r) => ({ name: r.merchant_name, amount: r.total_amount }));
    if (newItems.length === 0) {
      toast("이미 모든 영수증 경비가 반영되어 있습니다", "info");
      return;
    }
    setTodayExpenses((prev: { name: string; amount: number }[]) => [...prev, ...newItems]);
    toast(`영수증 ${newItems.length}건 경비가 추가되었습니다`, "success");
  }

  // 아코디언 상태
  const openSections = useUIState((s) => s.closingSections);
  const setClosingSection = useUIState((s) => s.setClosingSection);

  function toggleSection(key: string) {
    setClosingSection(key, !openSections[key]);
  }

  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    } catch { /* fallback */ }
  }

  // 아코디언 요약 텍스트
  const channelSummary = channels.filter((c) => c.ratio > 0).map((c) => `${c.channel} ${c.ratio}%`).join(" / ");
  const paymentSummary = `카드 ${cardRatio}% / 현금 ${100 - cardRatio}%`;
  const feeSummary = feeResult.totalFees > 0 ? `수수료 ${formatCurrency(feeResult.totalFees)}` : "";
  const expenseSummary = todayExpenses.length > 0
    ? `${todayExpenses.length}건 ${formatCurrency(todayExpenses.reduce((s, e) => s + e.amount, 0))}`
    : "없음";
  const tagSummary = tags.length > 0 ? tags.join(", ") : memo ? "메모 있음" : "";

  const totalFeesAll = feeResult.totalFees + customFees.reduce((s, f) => s + f.amount, 0);
  const totalExp = todayExpenses.reduce((s, e) => s + e.amount, 0);

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
          <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3 pb-20">
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
            <div className="text-center py-3">
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
                  {previousClosingDate
                    ? `${formatDateShort(parseDate(previousClosingDate))} 복사`
                    : "이전 복사"}
                </button>
              )}
            </div>

            {/* 키패드 + 음성/대화 입력 */}
            <NumericKeypad value={totalSales} onChange={setTotalSales} />
            <div className="flex gap-2">
              <VoiceInput onResult={setTotalSales} />
              <button onClick={() => setShowChat((v) => !v)}
                className={`h-10 px-4 rounded-xl text-body-small font-medium flex items-center gap-2 press-effect transition-all ${showChat ? "bg-primary-500/10 text-primary-500 border border-primary-500/30" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-transparent hover:text-primary-500"}`}>
                <MessageSquare size={16} />대화 입력
              </button>
            </div>
            {showChat && (
              <ChatInput onApply={({ totalSales: sales, channels: chs, memo: m }) => {
                setTotalSales(sales);
                if (chs.length > 0) { setChannels(chs); setActivePreset(null); }
                if (m) setMemo(m);
                setShowChat(false);
              }} />
            )}

            {/* ── 아코디언 섹션들 ── */}

            {/* 채널 분배 */}
            <AccordionSection
              title="채널 분배"
              summary={channelSummary}
              icon={<LayoutGrid size={15} className="text-primary-500" />}
              open={openSections.channel}
              onToggle={() => toggleSection("channel")}
            >
              <ChannelSlider channels={channels} totalSales={totalSales} onChange={(updated) => { setChannels(updated); setActivePreset(null); }} />
            </AccordionSection>

            {/* 결제수단 */}
            <AccordionSection
              title="결제수단"
              summary={paymentSummary}
              icon={<CreditCard size={15} className="text-primary-500" />}
              open={openSections.payment}
              onToggle={() => toggleSection("payment")}
            >
              <PaymentRatio cardRatio={cardRatio} totalSales={totalSales} onChange={(v) => { setCardRatio(v); setActivePreset(null); }} />
            </AccordionSection>

            {/* 수수료 */}
            {totalSales > 0 && (
              <AccordionSection
                title="수수료"
                summary={feeSummary}
                icon={<Receipt size={15} className="text-primary-500" />}
                open={openSections.fee}
                onToggle={() => toggleSection("fee")}
              >
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
              </AccordionSection>
            )}

            {/* 지출 */}
            <AccordionSection
              title="오늘 지출"
              summary={expenseSummary}
              icon={<Wallet size={15} className="text-primary-500" />}
              open={openSections.expense}
              onToggle={() => toggleSection("expense")}
            >
              <TodayExpenses expenses={todayExpenses} onChange={setTodayExpenses} />
              <button onClick={handleImportReceipts}
                className="w-full mt-2 py-2 rounded-xl text-caption font-medium text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 transition-colors press-effect flex items-center justify-center gap-1.5">
                <Receipt size={13} />영수증 경비 불러오기
              </button>
            </AccordionSection>

            {/* 고정 경비 */}
            <RecurringExpenses
              recurring={recurringExpenses}
              onRecurringChange={(updated) => {
                // 삭제된 항목 찾아서 오늘 지출에서도 제거
                const removedNames = recurringExpenses
                  .filter((old) => !updated.some((u) => u.name === old.name && u.amount === old.amount))
                  .map((r) => r.name);
                if (removedNames.length > 0) {
                  setTodayExpenses((prev) => prev.filter((e) => !removedNames.includes(e.name)));
                }
                setRecurringExpenses(updated);
              }}
              onApplyToday={(items) => setTodayExpenses((prev) => {
                const existingNames = new Set(prev.map((e) => e.name));
                const newItems = items
                  .filter((e) => !existingNames.has(e.name))
                  .map((e) => ({ name: e.name, amount: e.amount }));
                return [...prev, ...newItems];
              })}
              dayOfMonth={new Date().getDate()}
            />

            {/* 태그/메모 */}
            <AccordionSection
              title="태그 / 메모"
              summary={tagSummary}
              icon={<Tag size={15} className="text-primary-500" />}
              open={openSections.tag}
              onToggle={() => toggleSection("tag")}
            >
              <TagMemo
                tags={tags}
                memo={memo}
                date={selectedDate}
                onTagsChange={setTags}
                onMemoChange={setMemo}
              />
            </AccordionSection>

            {/* 순이익 상세 (펼쳐서 볼 수 있음) */}
            {totalSales > 0 && (
              <ProfitSummary
                totalSales={totalSales}
                totalFees={totalFeesAll}
                totalExpenses={totalExp}
              />
            )}

            {/* 저장 / 수정 버튼 */}
            {saved ? (
              <button
                onClick={() => setSaved(false)}
                className="w-full h-14 rounded-[14px] font-body font-semibold text-[1rem] flex items-center justify-center gap-2 transition-all
                  bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 hover:border-primary-500/30 border border-transparent press-effect"
              >
                <Edit3 size={18} />수정하기
              </button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { await handleSave(); analytics.reload(); }} disabled={totalSales === 0 || saving} className="w-full h-14 rounded-[14px] font-body font-semibold text-[1rem] flex items-center justify-center gap-2 transition-all duration-300 ease-smooth bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (<><Save size={18} />마감 저장</>)}
              </motion.button>
            )}

            {saved && (
              <>
                <WeekdayInsight
                  selectedDate={selectedDate}
                  totalSales={totalSales}
                  weekdayAvg={analytics.weekdayAvg}
                  prevDaySales={analytics.prevDaySales}
                />
                <DailyReportCard
                  totalSales={totalSales}
                  feeResult={feeResult}
                  prevDaySales={analytics.prevDaySales}
                  weekdayAvg={analytics.weekdayAvg}
                  date={selectedDate}
                  channelRatios={channels}
                  totalExpenses={totalExp}
                  totalCustomFees={customFees.reduce((s, f) => s + f.amount, 0)}
                />
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
                <ClosingExport
                  totalSales={totalSales}
                  feeResult={feeResult}
                  todayExpenses={todayExpenses}
                  customFees={customFees}
                  channels={channels.map((c) => ({ channel: c.channel, ratio: c.ratio }))}
                  cardRatio={cardRatio}
                  date={selectedDate}
                  tags={tags}
                  memo={memo}
                />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-5">
            <ClosingAnalyticsTab
              analytics={analytics}
              todaySales={totalSales}
              monthlyGoal={monthlyGoal}
              onGoalChange={setMonthlyGoal}
              onDateClick={handleCalendarDateClick}
              onShowMonthSummary={() => setShowMonthSummary(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky 순이익 바 (매출 입력 시) */}
      {tab === "input" && !saved && (
        <StickyProfitBar
          totalSales={totalSales}
          totalFees={totalFeesAll}
          totalExpenses={totalExp}
        />
      )}

      {/* 월간 요약 팝업 */}
      {showMonthSummary && (
        <MonthEndSummary
          selectedMonth={selectedDate.slice(0, 7)}
          onClose={() => setShowMonthSummary(false)}
        />
      )}
    </div>
  );
}
