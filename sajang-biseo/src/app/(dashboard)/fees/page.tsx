"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight,
  BarChart3, Table2, Lightbulb, Calendar, Settings,
  Copy, CopyCheck, Share2,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useFeesData } from "@/hooks/useFeesData";
import { useFeeToggle } from "@/stores/useFeeToggle";
import { MonthlyFeeReport } from "@/components/fees/MonthlyFeeReport";
import { FeeTrendChart } from "@/components/fees/FeeTrendChart";
import { ProfitabilityTable } from "@/components/fees/ProfitabilityTable";
import { FeeSavingTips } from "@/components/fees/FeeSavingTips";
import { FeeSimulator } from "@/components/fees/FeeSimulator";
import { SettlementSchedule } from "@/components/fees/SettlementSchedule";
import { FeeSettingsEditor } from "@/components/fees/FeeSettingsEditor";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

type Tab = "report" | "profitability" | "tips" | "settlement" | "settings";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "report", label: "리포트", icon: BarChart3 },
  { key: "profitability", label: "수익성", icon: Table2 },
  { key: "tips", label: "절감 팁", icon: Lightbulb },
  { key: "settlement", label: "정산일", icon: Calendar },
  { key: "settings", label: "설정", icon: Settings },
];

function generateFeeText(report: { month: string; totalSales: number; totalFees: number; feeRate: number }): string {
  const [y, m] = report.month.split("-");
  return `[수수료 분석] ${y}년 ${parseInt(m)}월\n총매출: ${formatCurrency(report.totalSales)}\n총수수료: ${formatCurrency(report.totalFees)} (${formatPercent(report.feeRate)})`;
}

export default function FeesPage() {
  const {
    feeSettings, feeChannels, monthlyReport,
    profitability, prevProfitability, recentMonths,
    loading, monthOffset,
    goToPrevMonth, goToNextMonth,
    saveFeeSettings, addChannel, deleteChannel,
  } = useFeesData();

  const { mode, toggle } = useFeeToggle();
  const [tab, setTab] = useState<Tab>("report");
  const [copied, setCopied] = useState(false);

  const monthLabel = monthlyReport?.month
    ? `${monthlyReport.month.split("-")[0]}년 ${parseInt(monthlyReport.month.split("-")[1])}월`
    : "로딩 중...";

  const handleCopy = useCallback(async () => {
    if (!monthlyReport) return;
    try {
      await navigator.clipboard.writeText(generateFeeText(monthlyReport));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, [monthlyReport]);

  return (
    <div className="animate-fade-in pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">수수료 분석</h1>
          <p className="text-body-small text-[var(--text-secondary)]">채널별 수수료를 한눈에 확인하세요</p>
        </div>
        <button onClick={toggle}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[11px] font-medium text-[var(--text-secondary)] press-effect">
          {mode === "net" ? "순매출" : "총매출"}
        </button>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="p-2 rounded-xl text-[var(--text-tertiary)] press-effect">
          <ChevronLeft size={18} />
        </button>
        <span className="text-body-small font-medium text-[var(--text-secondary)]">{monthLabel}</span>
        <button onClick={goToNextMonth} disabled={monthOffset >= 0}
          className="p-2 rounded-xl text-[var(--text-tertiary)] disabled:opacity-30 press-effect">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5 overflow-x-auto">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
              tab === key ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm" : "text-[var(--text-tertiary)]"
            }`}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {tab === "report" && (
            <motion.div key="report" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
              {monthlyReport ? (
                <>
                  <MonthlyFeeReport report={monthlyReport} mode={mode} />
                  <FeeTrendChart data={recentMonths} />
                </>
              ) : (
                <div className="glass-card p-8 text-center space-y-2">
                  <BarChart3 size={32} className="mx-auto text-[var(--text-tertiary)]" />
                  <p className="text-body-small font-medium text-[var(--text-secondary)]">수수료 데이터가 없습니다</p>
                  <p className="text-caption text-[var(--text-tertiary)]">마감 입력을 하면 수수료가 자동 분석됩니다</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "profitability" && (
            <motion.div key="profitability" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <ProfitabilityTable data={profitability} prevData={prevProfitability} />
            </motion.div>
          )}

          {tab === "tips" && (
            <motion.div key="tips" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
              <FeeSavingTips profitability={profitability} />
              <FeeSimulator profitability={profitability} />
            </motion.div>
          )}

          {tab === "settlement" && (
            <motion.div key="settlement" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <SettlementSchedule profitability={profitability} />
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <FeeSettingsEditor
                feeSettings={feeSettings}
                feeChannels={feeChannels}
                onSaveSettings={saveFeeSettings}
                onAddChannel={addChannel}
                onDeleteChannel={deleteChannel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 공유 버튼 */}
      {monthlyReport && tab === "report" && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleCopy}
            className={`flex-1 py-2.5 rounded-xl text-body-small flex items-center justify-center gap-1.5 press-effect transition-all ${
              copied ? "bg-success/10 text-success" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500"
            }`}>
            {copied ? <><CopyCheck size={14} />복사됨!</> : <><Copy size={14} />텍스트 복사</>}
          </button>
          <button onClick={async () => {
            if (!monthlyReport || !navigator.share) return;
            try { await navigator.share({ title: "수수료 분석", text: generateFeeText(monthlyReport) }); } catch {}
          }}
            className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] hover:text-primary-500 flex items-center justify-center gap-1.5 press-effect">
            <Share2 size={14} />공유하기
          </button>
        </div>
      )}
    </div>
  );
}
