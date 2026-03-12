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

export function OrderExport({ confirmedItems, itemsMap, orderDate }: OrderExportProps) {
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const toast = useToast((s) => s.show);

  if (confirmedItems.length === 0) return null;

  const groups = buildSupplierGroups(confirmedItems, itemsMap);
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

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
      {/* 오프스크린 캡처 영역 — 고정 너비로 겹침 방지 */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <div
          ref={captureRef}
          style={{ width: 400, padding: "28px 32px 32px", backgroundColor: "#ffffff" }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 4 }}>발주서</h2>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 20 }}>{orderDate}</p>

          {groups.map((g) => (
            <div key={g.supplierName} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#262626", marginBottom: 8 }}>
                {g.supplierName}
                {g.supplierContact && (
                  <span style={{ fontWeight: 400, color: "#a3a3a3", marginLeft: 8 }}>{g.supplierContact}</span>
                )}
              </p>
              {g.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#525252", padding: "5px 0", gap: 16 }}>
                  <span>{item.name}</span>
                  <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {item.qty}{item.unit}
                    {item.unitPrice ? ` (${formatCurrency(item.unitPrice * item.qty, { showSymbol: false })})` : ""}
                  </span>
                </div>
              ))}
              {g.total > 0 && (
                <p style={{ textAlign: "right", fontSize: 14, fontWeight: 600, color: "#262626", marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e5e5" }}>
                  {formatCurrency(g.total)}
                </p>
              )}
            </div>
          ))}

          {grandTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 12, borderTop: "2px solid #d4d4d4", gap: 16 }}>
              <span style={{ fontSize: 14, color: "#525252" }}>총 합계</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#2563eb" }}>{formatCurrency(grandTotal)}</span>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#d4d4d4", textAlign: "center", marginTop: 20 }}>사장님비서</p>
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
