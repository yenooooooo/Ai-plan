"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Archive, ChevronLeft, ChevronRight,
  Copy, CopyCheck, Share2, Image as ImageIcon,
  FileDown, Mail, Loader2,
} from "lucide-react";
import { useBriefingData } from "@/hooks/useBriefingData";
import { usePlan } from "@/hooks/usePlan";
import { BriefingCarousel } from "@/components/briefing/BriefingCarousel";
import { ArchiveList } from "@/components/briefing/ArchiveList";
import { useToast } from "@/stores/useToast";
import { parseDate, formatDateShort } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/format";
import type { BriefingData } from "@/lib/briefing/types";

type Tab = "briefing" | "archive";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "briefing", label: "브리핑", icon: BarChart3 },
  { key: "archive", label: "아카이브", icon: Archive },
];

function generateBriefingText(data: BriefingData): string {
  const lines: string[] = [];
  const start = formatDateShort(parseDate(data.weekStart));
  const end = formatDateShort(parseDate(data.weekEnd));
  lines.push(`[주간 경영 브리핑] ${start} ~ ${end}`);
  lines.push("");
  lines.push(`총매출: ${formatCurrency(data.sales.totalSales)}`);
  lines.push(`실수령: ${formatCurrency(data.sales.netSales)} (수수료율 ${data.sales.feeRate.toFixed(1)}%)`);
  lines.push(`일 평균: ${formatCurrency(data.sales.dailyAvg)}`);

  if (data.sales.prevWeekTotal > 0) {
    const sign = data.sales.changeRate >= 0 ? "+" : "";
    lines.push(`전주 대비: ${sign}${data.sales.changeRate.toFixed(1)}% (${sign}${formatCurrency(data.sales.changeAmount)})`);
  }

  lines.push("");
  lines.push(`최고 매출: ${data.sales.bestDay.day} ${formatCurrency(data.sales.bestDay.amount)}`);
  lines.push(`최저 매출: ${data.sales.worstDay.day} ${formatCurrency(data.sales.worstDay.amount)}`);

  if (data.fees.totalFees > 0) {
    lines.push("");
    lines.push(`총 수수료: ${formatCurrency(data.fees.totalFees)} (${data.fees.feeRate.toFixed(1)}%)`);
  }

  if (data.expenses.totalExpense > 0) {
    lines.push(`총 비용: ${formatCurrency(data.expenses.totalExpense)} (매출비 ${data.expenses.costRate.toFixed(1)}%)`);
  }

  if (data.coaching.insight) {
    lines.push("");
    lines.push(`AI 코칭: ${data.coaching.insight}`);
  }

  return lines.join("\n");
}

export default function BriefingPage() {
  const {
    briefing, briefingDbId, loading, generating, archives, prevCoaching,
    weekOffset, generateCoaching,
    goToPrevWeek, goToNextWeek, goToWeek,
  } = useBriefingData();

  const toast = useToast((s) => s.show);
  const { limits } = usePlan();
  const [tab, setTab] = useState<Tab>("briefing");
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const saveAsPdf = useCallback(async () => {
    if (!carouselRef.current) return;
    try {
      const { saveAsPdf: exportPdf } = await import("@/lib/export/pdf");
      await exportPdf(carouselRef.current, `briefing-${briefing?.weekStart ?? "week"}`);
      toast("PDF가 저장되었습니다.", "success");
    } catch { toast("PDF 저장에 실패했습니다.", "error"); }
  }, [briefing?.weekStart, toast]);

  const sendEmail = useCallback(async () => {
    if (!briefingDbId) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/briefing/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId: briefingDbId }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error, "error"); return; }
      toast("이메일이 발송되었습니다.", "success");
    } catch { toast("이메일 발송 실패", "error"); }
    finally { setEmailSending(false); }
  }, [briefingDbId, toast]);

  const saveAsImage = useCallback(async () => {
    if (!carouselRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(carouselRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `briefing-${briefing?.weekStart ?? "week"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast("이미지가 저장되었습니다.", "success");
    } catch {
      toast("이미지 저장에 실패했습니다.", "error");
    }
  }, [briefing?.weekStart, toast]);

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
                <div ref={carouselRef}>
                  <BriefingCarousel
                    data={briefing}
                    generating={generating}
                    onGenerateCoaching={generateCoaching}
                    prevCoaching={prevCoaching}
                  />
                </div>

                {/* 공유 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!briefing) return;
                      try {
                        await navigator.clipboard.writeText(generateBriefingText(briefing));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch { /* fallback */ }
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-body-small flex items-center justify-center gap-1.5 press-effect transition-all ${
                      copied
                        ? "bg-success/10 text-success"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500"
                    }`}
                  >
                    {copied ? <><CopyCheck size={14} />복사됨!</> : <><Copy size={14} />텍스트 복사</>}
                  </button>
                  <button
                    onClick={async () => {
                      if (!briefing || !navigator.share) return;
                      try {
                        await navigator.share({
                          title: "주간 경영 브리핑",
                          text: generateBriefingText(briefing),
                        });
                      } catch { /* cancelled */ }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] hover:text-primary-500 flex items-center justify-center gap-1.5 press-effect"
                  >
                    <Share2 size={14} />
                    공유하기
                  </button>
                  <button
                    onClick={saveAsImage}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] hover:text-primary-500 flex items-center justify-center gap-1.5 press-effect"
                  >
                    <ImageIcon size={14} />
                    이미지
                  </button>
                </div>
                <div className="flex gap-2">
                  {limits.pdfExport && (
                    <button onClick={saveAsPdf}
                      className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] hover:text-primary-500 flex items-center justify-center gap-1.5 press-effect">
                      <FileDown size={14} /> PDF 저장
                    </button>
                  )}
                  {limits.emailBriefing && (
                    <button onClick={sendEmail} disabled={emailSending}
                      className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)] hover:text-primary-500 flex items-center justify-center gap-1.5 press-effect disabled:opacity-50">
                      {emailSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                      {emailSending ? "발송 중..." : "이메일 발송"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center space-y-2">
                <BarChart3 size={32} className="mx-auto text-[var(--text-tertiary)]" />
                <p className="text-body-small font-medium text-[var(--text-secondary)]">
                  해당 주의 마감 데이터가 없습니다
                </p>
                <p className="text-caption text-[var(--text-tertiary)]">
                  마감 입력에서 매출을 기록하면 주간 브리핑이 자동 생성됩니다
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
