"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Share2, Download, X, FileDown } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import html2canvas from "html2canvas";
import { formatCurrency } from "@/lib/utils/format";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ReceiptExportProps {
  receipts: Receipt[];
  categories: ReceiptCategory[];
  dateFrom: string;
  dateTo: string;
}

export function ReceiptExport({ receipts, categories, dateFrom, dateTo }: ReceiptExportProps) {
  const { limits } = usePlan();
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (receipts.length === 0) return null;

  const total = receipts.reduce((s, r) => s + r.total_amount, 0);
  const vatTotal = receipts.reduce((s, r) => s + (r.vat_amount ?? 0), 0);

  // 카테고리별 집계
  const catMap = new Map<string, { label: string; amount: number; count: number }>();
  receipts.forEach((r) => {
    const cat = categories.find((c) => c.id === r.category_id);
    const key = cat?.id ?? "uncategorized";
    const prev = catMap.get(key);
    if (prev) { prev.amount += r.total_amount; prev.count += 1; }
    else { catMap.set(key, { label: cat?.label ?? "미분류", amount: r.total_amount, count: 1 }); }
  });
  const catBreakdown = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);

  // 결제수단별 집계
  const payMap = new Map<string, number>();
  receipts.forEach((r) => {
    payMap.set(r.payment_method, (payMap.get(r.payment_method) ?? 0) + r.total_amount);
  });

  const fromLabel = `${dateFrom.slice(5, 7)}/${dateFrom.slice(8)}`;
  const toLabel = `${dateTo.slice(5, 7)}/${dateTo.slice(8)}`;
  const dateLabel = `${dateFrom.slice(0, 4)}년 ${fromLabel} ~ ${toLabel}`;

  async function generateImage(): Promise<Blob | null> {
    if (!previewRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff", scale: 2, useCORS: true,
      });
      return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    } finally { setGenerating(false); }
  }

  async function handleShare() {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `경비요약_${dateFrom}_${dateTo}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `경비 요약 ${dateLabel}` });
    } else { downloadBlob(blob); }
  }

  async function handleDownload() {
    const blob = await generateImage();
    if (blob) downloadBlob(blob);
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `경비요약_${dateFrom}_${dateTo}.png`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button onClick={() => setShowPreview(true)}
        className="w-full py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
          bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
        <FileText size={16} />경비 요약 내보내기
      </button>

      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end p-3">
                <button onClick={() => setShowPreview(false)} className="p-1 text-neutral-400"><X size={20} /></button>
              </div>

              <div ref={previewRef} className="bg-white" style={{ minWidth: 360, padding: "24px 28px 28px" }}>
                <h2 className="text-lg font-bold text-neutral-900 mb-0.5">경비 요약 리포트</h2>
                <p className="text-sm text-neutral-500 mb-5">{dateLabel}</p>

                <div className="space-y-2.5 mb-4">
                  <Row label="총 경비" value={formatCurrency(total)} bold />
                  {vatTotal > 0 && <Row label="부가세 합계" value={formatCurrency(vatTotal)} />}
                  <Row label="건수" value={`${receipts.length}건`} />
                </div>

                <div className="border-t border-neutral-200 pt-3 mb-4">
                  <p className="text-xs text-neutral-500 mb-2.5 font-medium">카테고리별</p>
                  {catBreakdown.map((c) => (
                    <div key={c.label} className="flex justify-between items-center text-sm mb-2 gap-4">
                      <span className="text-neutral-600 shrink-0">{c.label} ({c.count}건)</span>
                      <span className="text-neutral-800 text-right whitespace-nowrap">
                        {formatCurrency(c.amount)}
                        <span className="text-xs text-neutral-400 ml-1">
                          {total > 0 ? `(${((c.amount / total) * 100).toFixed(1)}%)` : ""}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {payMap.size > 1 && (
                  <div className="border-t border-neutral-200 pt-3 mb-4">
                    <p className="text-xs text-neutral-500 mb-2.5 font-medium">결제수단별</p>
                    {Array.from(payMap.entries()).map(([method, amt]) => (
                      <div key={method} className="flex justify-between items-center text-sm mb-2 gap-4">
                        <span className="text-neutral-600 shrink-0">{method}</span>
                        <span className="text-neutral-800 text-right whitespace-nowrap">{formatCurrency(amt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-neutral-300 text-center mt-5">사장님비서</p>
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
                    await saveAsPdf(previewRef.current, `경비요약_${dateFrom}_${dateTo}`);
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm gap-4">
      <span className="text-neutral-600 shrink-0">{label}</span>
      <span className={`text-neutral-800 text-right ${bold ? "font-bold text-base" : ""}`}>{value}</span>
    </div>
  );
}
