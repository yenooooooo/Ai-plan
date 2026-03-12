"use client";

import { useState, useRef } from "react";
import { FileText, Share2, FileDown, Loader2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import html2canvas from "html2canvas";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/stores/useToast";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ReceiptExportProps {
  receipts: Receipt[];
  categories: ReceiptCategory[];
  dateFrom: string;
  dateTo: string;
}

/* ── inline style 상수 ── */
const S = {
  root: {
    width: 420,
    padding: "28px 32px 32px",
    backgroundColor: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: "1.5",
    boxSizing: "border-box" as const,
  },
  table: {
    width: "100%" as const,
    borderCollapse: "collapse" as const,
    fontSize: 14,
    lineHeight: "1.6",
  },
  tdLabel: { padding: "5px 16px 5px 0", color: "#525252", verticalAlign: "middle" as const },
  tdValue: { padding: "5px 0", textAlign: "right" as const, whiteSpace: "nowrap" as const, verticalAlign: "middle" as const, color: "#262626" },
};

export function ReceiptExport({ receipts, categories, dateFrom, dateTo }: ReceiptExportProps) {
  const { limits } = usePlan();
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const toast = useToast((s) => s.show);

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
  const payEntries = Array.from(payMap.entries());

  const fromLabel = `${dateFrom.slice(5, 7)}/${dateFrom.slice(8)}`;
  const toLabel = `${dateTo.slice(5, 7)}/${dateTo.slice(8)}`;
  const dateLabel = `${dateFrom.slice(0, 4)}년 ${fromLabel} ~ ${toLabel}`;

  async function captureImage(): Promise<Blob | null> {
    if (!captureRef.current) return null;
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const blob = await captureImage();
      if (!blob) { toast("이미지 생성 실패", "error"); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `경비요약_${dateFrom}_${dateTo}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast("경비 요약 이미지가 저장되었습니다", "success");
    } catch {
      toast("이미지 저장 실패", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    setSaving(true);
    try {
      const blob = await captureImage();
      if (!blob) { toast("이미지 생성 실패", "error"); return; }
      const file = new File([blob], `경비요약_${dateFrom}_${dateTo}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `경비 요약 ${dateLabel}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `경비요약_${dateFrom}_${dateTo}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast("경비 요약 이미지가 저장되었습니다", "success");
      }
    } catch { /* share cancelled */ }
    finally { setSaving(false); }
  }

  return (
    <>
      {/* ── 오프스크린 캡처 영역: table 레이아웃 ── */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div ref={captureRef} style={S.root}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: "0 0 4px", lineHeight: "1.4" }}>경비 요약 리포트</p>
          <p style={{ fontSize: 14, color: "#737373", margin: "0 0 20px", lineHeight: "1.4" }}>{dateLabel}</p>

          {/* 요약 테이블 */}
          <table style={S.table}>
            <tbody>
              <tr>
                <td style={{ ...S.tdLabel, fontWeight: 600 }}>총 경비</td>
                <td style={{ ...S.tdValue, fontWeight: 700, fontSize: 16 }}>{formatCurrency(total)}</td>
              </tr>
              {vatTotal > 0 && (
                <tr>
                  <td style={S.tdLabel}>부가세 합계</td>
                  <td style={S.tdValue}>{formatCurrency(vatTotal)}</td>
                </tr>
              )}
              <tr>
                <td style={S.tdLabel}>건수</td>
                <td style={S.tdValue}>{receipts.length}건</td>
              </tr>
            </tbody>
          </table>

          {/* 카테고리별 */}
          <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12, marginTop: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#737373", marginBottom: 8, fontWeight: 500, lineHeight: "1.4" }}>카테고리별</p>
            <table style={S.table}>
              <tbody>
                {catBreakdown.map((c) => (
                  <tr key={c.label}>
                    <td style={S.tdLabel}>{c.label} ({c.count}건)</td>
                    <td style={S.tdValue}>
                      {formatCurrency(c.amount)}
                      {total > 0 && (
                        <span style={{ fontSize: 12, color: "#a3a3a3", marginLeft: 4 }}>
                          ({((c.amount / total) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 결제수단별 */}
          {payEntries.length > 1 && (
            <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#737373", marginBottom: 8, fontWeight: 500, lineHeight: "1.4" }}>결제수단별</p>
              <table style={S.table}>
                <tbody>
                  {payEntries.map(([method, amt]) => (
                    <tr key={method}>
                      <td style={S.tdLabel}>{method}</td>
                      <td style={S.tdValue}>{formatCurrency(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#d4d4d4", textAlign: "center", marginTop: 20, lineHeight: "1.4" }}>사장님비서</p>
        </div>
      </div>

      {/* 이미지 저장 / 공유 / PDF 버튼 */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
            bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {saving ? "저장 중..." : "이미지 저장"}
        </button>
        <button onClick={handleShare} disabled={saving}
          className="flex-1 py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
            bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors disabled:opacity-50">
          <Share2 size={16} />공유
        </button>
        {limits.pdfExport && (
          <button disabled={saving} onClick={async () => {
            if (!captureRef.current) return;
            const { saveAsPdf } = await import("@/lib/export/pdf");
            await saveAsPdf(captureRef.current, `경비요약_${dateFrom}_${dateTo}`);
          }}
            className="py-3 px-4 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
              bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors disabled:opacity-50">
            <FileDown size={16} />PDF
          </button>
        )}
      </div>
    </>
  );
}
