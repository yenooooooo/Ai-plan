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
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
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
      {/* 오프스크린 캡처 영역 — 고정 너비로 겹침 방지 */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <div
          ref={captureRef}
          style={{ width: 400, padding: "28px 32px 32px", backgroundColor: "#ffffff" }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 2 }}>경비 요약 리포트</h2>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 20 }}>{dateLabel}</p>

          <ExportRow label="총 경비" value={formatCurrency(total)} bold />
          {vatTotal > 0 && <ExportRow label="부가세 합계" value={formatCurrency(vatTotal)} />}
          <ExportRow label="건수" value={`${receipts.length}건`} />

          <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12, marginTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#737373", marginBottom: 10, fontWeight: 500 }}>카테고리별</p>
            {catBreakdown.map((c) => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, marginBottom: 8, gap: 16 }}>
                <span style={{ color: "#525252" }}>{c.label} ({c.count}건)</span>
                <span style={{ color: "#262626", textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatCurrency(c.amount)}
                  {total > 0 && (
                    <span style={{ fontSize: 12, color: "#a3a3a3", marginLeft: 4 }}>
                      ({((c.amount / total) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {payEntries.length > 1 && (
            <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#737373", marginBottom: 10, fontWeight: 500 }}>결제수단별</p>
              {payEntries.map(([method, amt]) => (
                <div key={method} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, marginBottom: 8, gap: 16 }}>
                  <span style={{ color: "#525252" }}>{method}</span>
                  <span style={{ color: "#262626", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 10, color: "#d4d4d4", textAlign: "center", marginTop: 20 }}>사장님비서</p>
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

function ExportRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", gap: 16 }}>
      <span style={{ fontSize: 14, color: "#525252" }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 400, color: "#262626", textAlign: "right" }}>{value}</span>
    </div>
  );
}
