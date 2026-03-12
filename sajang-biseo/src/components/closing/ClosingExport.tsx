"use client";

import { useState, useRef } from "react";
import { ImageIcon, Share2, FileDown, Loader2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import html2canvas from "html2canvas";
import { formatCurrency } from "@/lib/utils/format";
import { parseDate } from "@/lib/utils/date";
import { useToast } from "@/stores/useToast";
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
  tdValue: { padding: "5px 0", textAlign: "right" as const, whiteSpace: "nowrap" as const, verticalAlign: "middle" as const },
};

export function ClosingExport({
  totalSales, feeResult, todayExpenses, customFees,
  channels, cardRatio, date, tags, memo,
}: ClosingExportProps) {
  const { limits } = usePlan();
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const toast = useToast((s) => s.show);

  const dateObj = parseDate(date);
  const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
  const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${dayName})`;

  const totalExp = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const customTotal = customFees.reduce((s, f) => s + f.amount, 0);
  const netProfit = feeResult.netSales - totalExp - customTotal;
  const activeChannels = channels.filter((c) => c.ratio > 0);
  const profitRate = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0";

  async function captureImage(): Promise<Blob | null> {
    if (!captureRef.current) return null;
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const blob = await captureImage();
      if (!blob) { toast("이미지 생성 실패", "error"); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `마감리포트_${date}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast("마감 리포트 이미지가 저장되었습니다", "success");
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
      const file = new File([blob], `마감리포트_${date}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `마감 리포트 ${dateLabel}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `마감리포트_${date}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast("마감 리포트 이미지가 저장되었습니다", "success");
      }
    } catch { /* share cancelled */ }
    finally { setSaving(false); }
  }

  // 행 데이터 구성
  const rows: { label: string; value: string; color?: string; bold?: boolean }[] = [
    { label: "총매출", value: formatCurrency(totalSales) },
  ];
  if (feeResult.totalFees > 0) rows.push({ label: "수수료", value: `-${formatCurrency(feeResult.totalFees)}`, color: "#ef4444" });
  if (customTotal > 0) rows.push({ label: "추가 수수료", value: `-${formatCurrency(customTotal)}`, color: "#ef4444" });
  if (totalExp > 0) rows.push({ label: "경비", value: `-${formatCurrency(totalExp)}`, color: "#ef4444" });

  return (
    <>
      {/* ── 오프스크린 캡처 영역: table 레이아웃 ── */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div ref={captureRef} style={S.root}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: "0 0 4px", lineHeight: "1.4" }}>마감 리포트</p>
          <p style={{ fontSize: 14, color: "#737373", margin: "0 0 20px", lineHeight: "1.4" }}>{dateLabel}</p>

          {/* 매출/수수료/경비 테이블 */}
          <table style={S.table}>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td style={S.tdLabel}>{r.label}</td>
                  <td style={{ ...S.tdValue, color: r.color ?? "#262626" }}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 순이익 구분선 */}
          <div style={{ borderTop: "2px solid #d4d4d4", paddingTop: 12, marginTop: 14, marginBottom: 20 }}>
            <table style={S.table}>
              <tbody>
                <tr>
                  <td style={S.tdLabel}>순이익</td>
                  <td style={{ ...S.tdValue, fontSize: 16, fontWeight: 700, color: netProfit >= 0 ? "#2563eb" : "#ef4444" }}>
                    {formatCurrency(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
            {totalSales > 0 && (
              <p style={{ fontSize: 12, color: "#a3a3a3", textAlign: "right", marginTop: 4, lineHeight: "1.4" }}>
                수익률 {profitRate}%
              </p>
            )}
          </div>

          {/* 채널 */}
          {activeChannels.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#737373", marginBottom: 6, lineHeight: "1.4" }}>채널</p>
              <p style={{ fontSize: 14, color: "#404040", lineHeight: "1.5" }}>
                {activeChannels.map((c) => `${c.channel} ${c.ratio}%`).join(" / ")}
              </p>
            </div>
          )}

          {/* 결제 */}
          <p style={{ fontSize: 12, color: "#737373", marginBottom: 6, lineHeight: "1.4" }}>결제</p>
          <p style={{ fontSize: 14, color: "#404040", marginBottom: 16, lineHeight: "1.5" }}>카드 {cardRatio}% / 현금 {100 - cardRatio}%</p>

          {tags.length > 0 && <p style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 6, lineHeight: "1.4" }}>#{tags.join(" #")}</p>}
          {memo && <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: "1.4" }}>{memo}</p>}

          <p style={{ fontSize: 10, color: "#d4d4d4", textAlign: "center", marginTop: 20, lineHeight: "1.4" }}>사장님비서</p>
        </div>
      </div>

      {/* 이미지 저장 / 공유 / PDF 버튼 */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
            bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
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
            await saveAsPdf(captureRef.current, `마감리포트_${date}`);
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
