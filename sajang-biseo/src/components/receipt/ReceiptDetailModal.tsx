"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Edit3, Check, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";

interface ReceiptDetailModalProps {
  receipt: Receipt;
  categories: ReceiptCategory[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, data: {
    date: string;
    merchantName: string;
    totalAmount: number;
    vatAmount: number | null;
    paymentMethod: "카드" | "현금" | "이체";
    cardLastFour: string | null;
    categoryId: string | null;
    memo: string;
  }) => void;
}

export function ReceiptDetailModal({
  receipt,
  categories,
  onClose,
  onDelete,
  onUpdate,
}: ReceiptDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(receipt.date);
  const [editMerchant, setEditMerchant] = useState(receipt.merchant_name);
  const [editAmount, setEditAmount] = useState(String(receipt.total_amount));
  const [editVat, setEditVat] = useState(receipt.vat_amount ? String(receipt.vat_amount) : "");
  const [editPayment, setEditPayment] = useState<"카드" | "현금" | "이체">(receipt.payment_method as "카드" | "현금" | "이체");
  const [editCardLast, setEditCardLast] = useState(receipt.card_last_four ?? "");
  const [editCatId, setEditCatId] = useState(receipt.category_id);
  const [editMemo, setEditMemo] = useState(receipt.memo ?? "");
  const [showCatPicker, setShowCatPicker] = useState(false);

  const cat = (editing ? categories.find((c) => c.id === editCatId) : null)
    ?? (receipt.category_id ? categories.find((c) => c.id === receipt.category_id) : null);
  const color = CATEGORY_COLORS[cat?.code ?? "F99"] ?? "#6B7280";

  const confidenceLevel = receipt.ocr_confidence >= 0.8 ? "높음" : receipt.ocr_confidence >= 0.5 ? "보통" : "낮음";
  const confidenceDots = receipt.ocr_confidence >= 0.8 ? 3 : receipt.ocr_confidence >= 0.5 ? 2 : 1;

  // Supabase Storage signed URL로 이미지 로드
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!receipt.image_url) return;
    const match = receipt.image_url.match(/\/sajang-receipts\/(.+)$/);
    if (!match) return;
    const supabase = createClient();
    supabase.storage.from("sajang-receipts").createSignedUrl(match[1], 3600)
      .then(({ data }) => { if (data?.signedUrl) setSignedImageUrl(data.signedUrl); });
  }, [receipt.image_url]);

  function handleSaveEdit() {
    if (!onUpdate || !editMerchant.trim() || !editAmount) return;
    onUpdate(receipt.id, {
      date: editDate,
      merchantName: editMerchant.trim(),
      totalAmount: parseInt(editAmount.replace(/,/g, "")) || 0,
      vatAmount: editVat ? parseInt(editVat.replace(/,/g, "")) : null,
      paymentMethod: editPayment,
      cardLastFour: editCardLast.trim() || null,
      categoryId: editCatId,
      memo: editMemo.trim(),
    });
    setEditing(false);
    onClose();
  }

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
          <h3 className="text-heading-md text-[var(--text-primary)]">
            {editing ? "영수증 수정" : "영수증 상세"}
          </h3>
          <div className="flex items-center gap-1">
            {!editing && onUpdate && (
              <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-primary-500">
                <Edit3 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-tertiary)]">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 영수증 이미지 */}
        {receipt.image_url && signedImageUrl && (
          <div className="h-48 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signedImageUrl} alt="영수증" className="w-full h-full object-contain" />
          </div>
        )}

        {editing ? (
          <div className="space-y-3">
            <EditField label="날짜">
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="input-field" />
            </EditField>
            <EditField label="가맹점">
              <input type="text" value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} className="input-field" />
            </EditField>
            <EditField label="금액">
              <input type="text" value={editAmount} onChange={(e) => setEditAmount(e.target.value.replace(/[^0-9]/g, ""))} className="input-field" />
            </EditField>
            <EditField label="부가세">
              <input type="text" value={editVat} onChange={(e) => setEditVat(e.target.value.replace(/[^0-9]/g, ""))} placeholder="선택" className="input-field" />
            </EditField>
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">결제수단</label>
              <div className="flex gap-2">
                {(["카드", "현금", "이체"] as const).map((m) => (
                  <button key={m} onClick={() => setEditPayment(m)}
                    className={`flex-1 py-2 rounded-xl text-caption font-medium transition-colors ${editPayment === m ? "bg-primary-500/15 text-primary-500 border border-primary-500/30" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {editPayment === "카드" && (
              <EditField label="카드 끝자리">
                <input type="text" value={editCardLast} maxLength={4} onChange={(e) => setEditCardLast(e.target.value.replace(/[^0-9]/g, ""))} className="input-field" />
              </EditField>
            )}
            <div>
              <label className="text-caption text-[var(--text-secondary)] mb-1 block">카테고리</label>
              <button onClick={() => setShowCatPicker(!showCatPicker)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[var(--text-primary)]">{cat ? `${cat.icon} ${cat.label}` : "카테고리 선택"}</span>
                </span>
                <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
              </button>
              {showCatPicker && (
                <div className="mt-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2 space-y-0.5 max-h-48 overflow-y-auto">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => { setEditCatId(c.id); setShowCatPicker(false); }}
                      className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg text-left transition-colors ${editCatId === c.id ? "bg-primary-500/10" : "hover:bg-[var(--bg-tertiary)]"}`}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.code] ?? "#6B7280" }} />
                      <span className="text-caption text-[var(--text-primary)]">{c.icon} {c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <EditField label="메모">
              <input type="text" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} placeholder="선택" className="input-field" />
            </EditField>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]">취소</button>
              <button onClick={handleSaveEdit} disabled={!editMerchant.trim() || !editAmount}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect disabled:opacity-40">
                <span className="flex items-center justify-center gap-1"><Check size={16} />저장</span>
              </button>
            </div>
          </div>
        ) : (
          <>
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
              <div className="flex items-center justify-between py-2">
                <span className="text-caption text-[var(--text-tertiary)]">카테고리</span>
                <span className="flex items-center gap-2 text-body-small text-[var(--text-primary)]">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  {cat ? `${cat.icon} ${cat.label}` : "미분류"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-caption text-[var(--text-tertiary)]">인식 신뢰도</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < confidenceDots ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"}`} />
                  ))}
                  <span className={`text-[11px] font-medium ml-1 ${confidenceLevel === "높음" ? "text-success" : confidenceLevel === "보통" ? "text-warning" : "text-danger"}`}>
                    {confidenceLevel}
                  </span>
                </div>
              </div>
              {receipt.memo && <InfoRow label="메모" value={receipt.memo} />}
            </div>

            {/* 삭제 */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2 bg-danger/10 text-danger text-body-small font-medium press-effect"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </>
        )}

        <ConfirmDialog
          open={confirmDelete}
          title="영수증 삭제"
          message="이 영수증을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
          confirmLabel="삭제"
          danger
          onConfirm={() => { onDelete(receipt.id); onClose(); }}
          onCancel={() => setConfirmDelete(false)}
        />
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

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-caption text-[var(--text-secondary)] mb-1 block">{label}</label>
      {children}
    </div>
  );
}
