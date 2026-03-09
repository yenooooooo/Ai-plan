"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Archive, ChevronLeft, ChevronRight,
  Download, Image as ImageIcon,
} from "lucide-react";
import { useBriefingData } from "@/hooks/useBriefingData";
import { BriefingCarousel } from "@/components/briefing/BriefingCarousel";
import { ArchiveList } from "@/components/briefing/ArchiveList";
import { parseDate, formatDateShort } from "@/lib/utils/date";

type Tab = "briefing" | "archive";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "briefing", label: "브리핑", icon: BarChart3 },
  { key: "archive", label: "아카이브", icon: Archive },
];

export default function BriefingPage() {
  const {
    briefing, loading, generating, archives,
    weekOffset, generateCoaching,
    goToPrevWeek, goToNextWeek, goToWeek,
  } = useBriefingData();

  const [tab, setTab] = useState<Tab>("briefing");

  const weekLabel = briefing
    ? `${formatDateShort(parseDate(briefing.weekStart))} ~ ${formatDateShort(parseDate(briefing.weekEnd))}`
    : "";

  return (
    <div className="animate-fade-in pb-8">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">
          경영 브리핑
        </h1>
        <p className="text-body-small text-[var(--text-secondary)]">
          주간 경영 성과를 한눈에 확인하세요
        </p>
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "briefing" && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 주 네비게이션 */}
            <div className="flex items-center justify-between">
              <button onClick={goToPrevWeek}
                className="p-2 rounded-xl text-[var(--text-tertiary)] press-effect">
                <ChevronLeft size={18} />
              </button>
              <span className="text-body-small font-medium text-[var(--text-secondary)]">
                {weekLabel || "로딩 중..."}
              </span>
              <button onClick={goToNextWeek}
                disabled={weekOffset >= 0}
                className="p-2 rounded-xl text-[var(--text-tertiary)] disabled:opacity-30 press-effect">
                <ChevronRight size={18} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : briefing ? (
              <>
                <BriefingCarousel
                  data={briefing}
                  generating={generating}
                  onGenerateCoaching={generateCoaching}
                />

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] flex items-center justify-center gap-1.5 press-effect">
                    <ImageIcon size={14} />
                    이미지 저장
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] flex items-center justify-center gap-1.5 press-effect">
                    <Download size={14} />
                    PDF 다운로드
                  </button>
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center">
                <BarChart3 size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                <p className="text-body-small text-[var(--text-tertiary)]">
                  해당 주의 마감 데이터가 없습니다
                </p>
              </div>
            )}
          </motion.div>
        )}

        {tab === "archive" && (
          <motion.div
            key="archive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ArchiveList archives={archives} onSelect={(s) => { goToWeek(s); setTab("briefing"); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
