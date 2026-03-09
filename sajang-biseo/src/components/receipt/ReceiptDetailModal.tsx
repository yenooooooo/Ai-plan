"use client";

import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ReceiptDetailModalProps {
  receipt: Receipt;
  categories: ReceiptCategory[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function ReceiptDetailModal({
  receipt,
  categories,
  onClose,
  onDelete,
}: ReceiptDetailModalProps) {
  const cat = receipt.category_id
    ? categories.find((c) => c.id === receipt.category_id)
    : null;
  const color = CATEGORY_COLORS[cat?.code ?? "F99"] ?? "#6B7280";

  const confidenceDots = Math.round(receipt.ocr_confidence * 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-[var(--bg-elevated)] rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading-md text-[var(--text-primary)]">영수증 상세</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-tertiary)]">
            <X size={20} />
          </button>
        </div>

        {/* 영수증 이미지 */}
        {receipt.image_url && (
          <div className="h-48 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receipt.image_url} alt="영수증" className="w-full h-full object-contain" />
          </div>
        )}

        {/* 정보 */}
        <div className="space-y-3">
          <InfoRow label="날짜" value={receipt.date} />
          <InfoRow label="가맹점" value={receipt.merchant_name} />
          <InfoRow label="금액" value={formatCurrency(receipt.total_amount)} highlight />
          {receipt.vat_amount && (
            <InfoRow label="부가세" value={formatCurrency(receipt.vat_amount)} />
          )}
          <InfoRow label="결제수단"
            value={`${receipt.payment_method}${receipt.card_last_four ? ` (끝자리 ${receipt.card_last_four})` : ""}`}
          />

          {/* 카테고리 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-caption text-[var(--text-tertiary)]">카테고리</span>
            <span className="flex items-center gap-2 text-body-small text-[var(--text-primary)]">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {cat ? `${cat.icon} ${cat.label}` : "미분류"}
            </span>
          </div>

          {/* 신뢰도 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-caption text-[var(--text-tertiary)]">인식 신뢰도</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${
                  i < confidenceDots ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"
                }`} />
              ))}
            </div>
          </div>

          {receipt.memo && <InfoRow label="메모" value={receipt.memo} />}
        </div>

        {/* 삭제 */}
        <button
          onClick={() => { onDelete(receipt.id); onClose(); }}
          className="w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2 bg-danger/10 text-danger text-body-small font-medium press-effect"
        >
          <Trash2 size={16} />
          삭제
        </button>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
      <span className="text-caption text-[var(--text-tertiary)]">{label}</span>
      <span className={`text-body-small ${highlight ? "font-display font-semibold text-primary-500" : "text-[var(--text-primary)]"}`}>
        {value}
      </span>
    </div>
  );
}
