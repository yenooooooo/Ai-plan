"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Share2, Download, X, Copy, MessageCircle } from "lucide-react";
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
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const toast = useToast((s) => s.show);

  if (confirmedItems.length === 0) return null;

  const groups = buildSupplierGroups(confirmedItems, itemsMap);
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

  async function generateImage(): Promise<Blob | null> {
    if (!previewRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `발주서_${orderDate}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `발주서 ${orderDate}` });
    } else {
      handleDownload(blob);
    }
  }

  function handleDownload(blob?: Blob | null) {
    if (!blob) { generateImage().then((b) => { if (b) downloadBlob(b); }); return; }
    downloadBlob(blob);
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `발주서_${orderDate}.png`; a.click();
    URL.revokeObjectURL(url);
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

      <button onClick={() => setShowPreview(true)}
        className="w-full py-3 rounded-2xl text-body-small font-medium flex items-center justify-center gap-2 press-effect
          bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
        <ImageIcon size={16} />발주서 이미지 저장 / 공유
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

              <div ref={previewRef} className="px-6 pb-6 bg-white">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">발주서</h2>
                <p className="text-sm text-neutral-500 mb-4">{orderDate}</p>
                {groups.map((g) => (
                  <div key={g.supplierName} className="mb-3">
                    <p className="text-sm font-semibold text-neutral-800 mb-1">
                      {g.supplierName}
                      {g.supplierContact && <span className="font-normal text-neutral-400 ml-2">{g.supplierContact}</span>}
                    </p>
                    {g.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-neutral-600 py-0.5">
                        <span>{item.name}</span>
                        <span>{item.qty}{item.unit}{item.unitPrice ? ` (${formatCurrency(item.unitPrice * item.qty, { showSymbol: false })})` : ""}</span>
                      </div>
                    ))}
                    {g.total > 0 && (
                      <p className="text-right text-sm font-semibold text-neutral-800 mt-1 pt-1 border-t border-neutral-200">
                        {formatCurrency(g.total)}
                      </p>
                    )}
                  </div>
                ))}
                {grandTotal > 0 && (
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-neutral-300">
                    <span className="text-sm text-neutral-600">총 합계</span>
                    <span className="text-base font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
                  </div>
                )}
                <p className="text-[10px] text-neutral-300 text-center mt-4">사장님비서</p>
              </div>

              <div className="flex gap-2 p-4 border-t border-neutral-100">
                <button onClick={handleShare} disabled={generating}
                  className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <Share2 size={16} />공유하기
                </button>
                <button onClick={() => handleDownload()} disabled={generating}
                  className="py-3 px-4 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <Download size={16} />저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
