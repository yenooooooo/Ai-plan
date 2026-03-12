"use client";

import { useState, useRef } from "react";
import { ImageIcon, Share2, Copy, MessageCircle, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/stores/useToast";

interface ExportItem {
  itemId: string;
  qty: number;
}

interface OrderExportProps {
  confirmedItems: ExportItem[];
  itemsMap: Map<string, DBOrderItem>;
  orderDate: string;
}

function buildOrderText(confirmedItems: ExportItem[], itemsMap: Map<string, DBOrderItem>, orderDate: string): string {
  const groups = buildSupplierGroups(confirmedItems, itemsMap);
  let text = `[발주서] ${orderDate}\n\n`;
  for (const g of groups) {
    text += `■ ${g.supplierName}${g.supplierContact ? ` (${g.supplierContact})` : ""}\n`;
    for (const item of g.items) {
      text += `  ${item.name}: ${item.qty}${item.unit}`;
      if (item.unitPrice) text += ` (${(item.unitPrice * item.qty).toLocaleString()}원)`;
      text += "\n";
    }
    if (g.total > 0) text += `  소계: ${g.total.toLocaleString()}원\n`;
    text += "\n";
  }
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);
  if (grandTotal > 0) text += `총 합계: ${grandTotal.toLocaleString()}원\n`;
  return text.trim();
}

/* ── 공통 inline style 상수 ── */
const S = {
  root: {
    width: 420,
    padding: "28px 32px 32px",
    backgroundColor: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: "1.5",
    boxSizing: "border-box" as const,
  },
  title: { fontSize: 18, fontWeight: 700 as const, color: "#171717", margin: "0 0 4px", lineHeight: "1.4" },
  date: { fontSize: 14, color: "#737373", margin: "0 0 20px", lineHeight: "1.4" },
  supplier: { fontSize: 14, fontWeight: 600 as const, color: "#262626", margin: "0 0 6px", lineHeight: "1.5" },
  supplierContact: { fontWeight: 400 as const, color: "#a3a3a3", marginLeft: 8 },
  table: {
    width: "100%" as const,
    borderCollapse: "collapse" as const,
    tableLayout: "fixed" as const,
    fontSize: 13,
    lineHeight: "1.6",
    color: "#525252",
  },
  tdName: { padding: "4px 8px 4px 0", verticalAlign: "top" as const, wordBreak: "break-word" as const },
  tdQty: { padding: "4px 8px 4px 0", textAlign: "right" as const, whiteSpace: "nowrap" as const, verticalAlign: "top" as const, width: 70 },
  tdPrice: { padding: "4px 0", textAlign: "right" as const, whiteSpace: "nowrap" as const, verticalAlign: "top" as const, width: 90 },
  subtotalRow: { textAlign: "right" as const, fontSize: 13, fontWeight: 600 as const, color: "#262626", padding: "8px 0 0", borderTop: "1px solid #e5e5e5" },
  totalBar: { borderTop: "2px solid #d4d4d4", marginTop: 14, paddingTop: 12 },
  totalTable: { width: "100%" as const, borderCollapse: "collapse" as const, fontSize: 14, lineHeight: "1.5" },
  totalLabel: { textAlign: "left" as const, color: "#525252", padding: 0 },
  totalValue: { textAlign: "right" as const, fontSize: 16, fontWeight: 700 as const, color: "#2563eb", padding: 0, whiteSpace: "nowrap" as const },
  watermark: { fontSize: 10, color: "#d4d4d4", textAlign: "center" as const, marginTop: 20, lineHeight: "1.4" },
};

export function OrderExport({ confirmedItems, itemsMap, orderDate }: OrderExportProps) {
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const toast = useToast((s) => s.show);

  if (confirmedItems.length === 0) return null;

  const groups = buildSupplierGroups(confirmedItems, itemsMap);
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

  async function captureImage(): Promise<Blob | null> {
    if (!captureRef.current) return null;
    // 폰트 로딩 완료 대기
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
      a.download = `발주서_${orderDate}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast("발주서 이미지가 저장되었습니다", "success");
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
      const file = new File([blob], `발주서_${orderDate}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `발주서 ${orderDate}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `발주서_${orderDate}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast("발주서 이미지가 저장되었습니다", "success");
      }
    } catch { /* share cancelled */ }
    finally { setSaving(false); }
  }

  async function handleCopyText() {
    const text = buildOrderText(confirmedItems, itemsMap, orderDate);
    await navigator.clipboard.writeText(text);
    toast("발주서가 클립보드에 복사되었습니다", "success");
  }

  function handleSMS() {
    const text = buildOrderText(confirmedItems, itemsMap, orderDate);
    const encoded = encodeURIComponent(text);
    window.open(`sms:?body=${encoded}`, "_self");
  }

  return (
    <>
      {/* ── 오프스크린 캡처 영역: table 레이아웃으로 컬럼 고정 ── */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div ref={captureRef} style={S.root}>
          <p style={S.title}>발주서</p>
          <p style={S.date}>{orderDate}</p>

          {groups.map((g) => (
            <div key={g.supplierName} style={{ marginBottom: 16 }}>
              <p style={S.supplier}>
                {g.supplierName}
                {g.supplierContact && <span style={S.supplierContact}>{g.supplierContact}</span>}
              </p>

              {/* 상품명 / 수량 / 금액 — table 레이아웃 */}
              <table style={S.table}>
                <colgroup>
                  <col />
                  <col style={{ width: 70 }} />
                  {g.items.some((it) => it.unitPrice) && <col style={{ width: 90 }} />}
                </colgroup>
                <tbody>
                  {g.items.map((item, i) => (
                    <tr key={i}>
                      <td style={S.tdName}>{item.name}</td>
                      <td style={S.tdQty}>{item.qty}{item.unit}</td>
                      {g.items.some((it) => it.unitPrice) && (
                        <td style={S.tdPrice}>
                          {item.unitPrice ? formatCurrency(item.unitPrice * item.qty, { showSymbol: false }) : ""}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {g.total > 0 && (
                <p style={S.subtotalRow}>{formatCurrency(g.total)}</p>
              )}
            </div>
          ))}

          {grandTotal > 0 && (
            <div style={S.totalBar}>
              <table style={S.totalTable}>
                <tbody>
                  <tr>
                    <td style={S.totalLabel}>총 합계</td>
                    <td style={S.totalValue}>{formatCurrency(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p style={S.watermark}>사장님비서</p>
        </div>
      </div>

      {/* 텍스트 복사 / SMS 버튼 */}
      <div className="flex gap-2">
        <button onClick={handleCopyText}
          className="flex-1 py-2.5 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 press-effect bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500">
          <Copy size={14} />텍스트 복사
        </button>
        <button onClick={handleSMS}
          className="flex-1 py-2.5 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 press-effect bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500">
          <MessageCircle size={14} />문자 전송
        </button>
      </div>

      {/* 이미지 저장 / 공유 버튼 */}
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
      </div>
    </>
  );
}

function buildSupplierGroups(confirmedItems: { itemId: string; qty: number }[], itemsMap: Map<string, DBOrderItem>) {
  const groups: { supplierName: string; supplierContact: string | null; items: { name: string; qty: number; unit: string; unitPrice: number | null }[]; total: number }[] = [];
  const noSupplier = { supplierName: "미지정", supplierContact: null as string | null, items: [] as { name: string; qty: number; unit: string; unitPrice: number | null }[], total: 0 };

  for (const ci of confirmedItems) {
    const item = itemsMap.get(ci.itemId);
    if (!item) continue;
    const entry = { name: item.item_name, qty: ci.qty, unit: item.unit, unitPrice: item.unit_price };
    const cost = (item.unit_price ?? 0) * ci.qty;

    if (item.supplier_name) {
      let g = groups.find((x) => x.supplierName.toLowerCase() === item.supplier_name!.toLowerCase());
      if (!g) { g = { supplierName: item.supplier_name, supplierContact: item.supplier_contact, items: [], total: 0 }; groups.push(g); }
      g.items.push(entry);
      g.total += cost;
    } else {
      noSupplier.items.push(entry);
      noSupplier.total += cost;
    }
  }
  if (noSupplier.items.length > 0) groups.push(noSupplier);
  return groups;
}
