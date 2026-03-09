"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight,
  BarChart3, Table2, Lightbulb, Calendar,
} from "lucide-react";
import { useState } from "react";
import { useFeesData } from "@/hooks/useFeesData";
import { MonthlyFeeReport } from "@/components/fees/MonthlyFeeReport";
import { ProfitabilityTable } from "@/components/fees/ProfitabilityTable";
import { FeeSavingTips } from "@/components/fees/FeeSavingTips";
import { SettlementSchedule } from "@/components/fees/SettlementSchedule";

type Tab = "report" | "profitability" | "tips" | "settlement";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "report", label: "리포트", icon: BarChart3 },
  { key: "profitability", label: "수익성", icon: Table2 },
  { key: "tips", label: "절감 팁", icon: Lightbulb },
  { key: "settlement", label: "정산일", icon: Calendar },
];

export default function FeesPage() {
  const {
    monthlyReport, profitability,
    loading, monthOffset,
    goToPrevMonth, goToNextMonth,
  } = useFeesData();

  const [tab, setTab] = useState<Tab>("report");

  // 월 표시
  const monthLabel = monthlyReport?.month
    ? `${monthlyReport.month.split("-")[0]}년 ${parseInt(monthlyReport.month.split("-")[1])}월`
    : "로딩 중...";

  return (
    <div className="animate-fade-in pb-8">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">
          수수료 분석
        </h1>
        <p className="text-body-small text-[var(--text-secondary)]">
          채널별 수수료를 한눈에 확인하세요
        </p>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth}
          className="p-2 rounded-xl text-[var(--text-tertiary)] press-effect">
          <ChevronLeft size={18} />
        </button>
        <span className="text-body-small font-medium text-[var(--text-secondary)]">
          {monthLabel}
        </span>
        <button onClick={goToNextMonth}
          disabled={monthOffset >= 0}
          className="p-2 rounded-xl text-[var(--text-tertiary)] disabled:opacity-30 press-effect">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5 overflow-x-auto">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
              tab === key
                ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
                : "text-[var(--text-tertiary)]"
            }`}
          >
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
            <motion.div
              key="report"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {monthlyReport ? (
                <MonthlyFeeReport report={monthlyReport} />
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
            <motion.div
              key="profitability"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfitabilityTable data={profitability} />
            </motion.div>
          )}

          {tab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FeeSavingTips profitability={profitability} />
            </motion.div>
          )}

          {tab === "settlement" && (
            <motion.div
              key="settlement"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <SettlementSchedule profitability={profitability} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
