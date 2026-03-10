"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Share2, Download, X, FileDown } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import html2canvas from "html2canvas";
import { formatCurrency } from "@/lib/utils/format";
import { parseDate } from "@/lib/utils/date";
import type { FeeCalculationResult } from "@/lib/fees/calculator";

interface ClosingExportProps {
  totalSales: number;
  feeResult: FeeCalculationResult;
  todayExpenses: { name: string; amount: number }[];
  customFees: { name: string; amount: number }[];
  channels: { channel: string; ratio: number }[];
  cardRatio: number;
  date: string;
  tags: string[];
  memo: string;
}

export function ClosingExport({
  totalSales, feeResult, todayExpenses, customFees,
  channels, cardRatio, date, tags, memo,
}: ClosingExportProps) {
  const { limits } = usePlan();
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const dateObj = parseDate(date);
  const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
  const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${dayName})`;

  const totalExp = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const customTotal = customFees.reduce((s, f) => s + f.amount, 0);
  const netProfit = feeResult.netSales - totalExp - customTotal;

  async function generateImage(): Promise<Blob | null> {
    if (!previewRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff", scale: 2, useCORS: true,
      });
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `마감리포트_${date}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `마감 리포트 ${dateLabel}` });
    } else {
      downloadBlob(blob);
    }
  }

  async function handleDownload() {
    const blob = await generateImage();
    if (blob) downloadBlob(blob);
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `마감리포트_${date}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button onClick={() => setShowPreview(true)}
        className="w-full py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
          bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
        <ImageIcon size={16} />마감 리포트 이미지 저장
      </button>

      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end p-3">
                <button onClick={() => setShowPreview(false)} className="p-1 text-neutral-400"><X size={20} /></button>
              </div>

              {/* 캡처 대상 */}
              <div ref={previewRef} className="px-6 pb-6 bg-white">
                <h2 className="text-lg font-bold text-neutral-900 mb-0.5">마감 리포트</h2>
                <p className="text-sm text-neutral-500 mb-4">{dateLabel}</p>

                <div className="space-y-1 mb-3">
                  <Row label="총매출" value={formatCurrency(totalSales)} />
                  {feeResult.totalFees > 0 && <Row label="수수료" value={`-${formatCurrency(feeResult.totalFees)}`} color="red" />}
                  {customTotal > 0 && <Row label="추가 수수료" value={`-${formatCurrency(customTotal)}`} color="red" />}
                  {totalExp > 0 && <Row label="경비" value={`-${formatCurrency(totalExp)}`} color="red" />}
                </div>

                <div className="border-t-2 border-neutral-300 pt-2 mb-4">
                  <Row label="순이익" value={formatCurrency(netProfit)} bold color={netProfit >= 0 ? "blue" : "red"} />
                  {totalSales > 0 && (
                    <p className="text-xs text-neutral-400 text-right">수익률 {((netProfit / totalSales) * 100).toFixed(1)}%</p>
                  )}
                </div>

                {channels.filter((c) => c.ratio > 0).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-500 mb-1">채널</p>
                    <p className="text-sm text-neutral-700">
                      {channels.filter((c) => c.ratio > 0).map((c) => `${c.channel} ${c.ratio}%`).join(" / ")}
                    </p>
                  </div>
                )}

                <p className="text-xs text-neutral-500 mb-1">결제</p>
                <p className="text-sm text-neutral-700 mb-3">카드 {cardRatio}% / 현금 {100 - cardRatio}%</p>

                {tags.length > 0 && <p className="text-xs text-neutral-400 mb-1">#{tags.join(" #")}</p>}
                {memo && <p className="text-xs text-neutral-400">{memo}</p>}

                <p className="text-[10px] text-neutral-300 text-center mt-4">사장님비서</p>
              </div>

              <div className="flex gap-2 p-4 border-t border-neutral-100">
                <button onClick={handleShare} disabled={generating}
                  className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <Share2 size={16} />공유
                </button>
                <button onClick={handleDownload} disabled={generating}
                  className="py-3 px-4 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <Download size={16} />이미지
                </button>
                {limits.pdfExport && (
                  <button disabled={generating} onClick={async () => {
                    if (!previewRef.current) return;
                    const { saveAsPdf } = await import("@/lib/export/pdf");
                    await saveAsPdf(previewRef.current, `마감리포트_${date}`);
                  }}
                    className="py-3 px-4 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    <FileDown size={16} />PDF
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  const colorCls = color === "red" ? "text-red-500" : color === "blue" ? "text-blue-600" : "text-neutral-800";
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={`${colorCls} ${bold ? "font-bold text-base" : ""}`}>{value}</span>
    </div>
  );
}
