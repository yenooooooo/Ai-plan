"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import type { ReceiptCategory } from "@/lib/supabase/types";

interface OcrData {
  date: string | null;
  merchantName: string | null;
  totalAmount: number | null;
  vatAmount: number | null;
  paymentMethod: "카드" | "현금" | "이체" | null;
  cardLastFour: string | null;
  categoryCode: string | null;
  confidence: number;
}

interface OcrResultCardProps {
  data: OcrData;
  imageUrl: string;
  categories: ReceiptCategory[];
  onSave: (data: {
    date: string;
    merchantName: string;
    totalAmount: number;
    vatAmount: number | null;
    paymentMethod: "카드" | "현금" | "이체";
    cardLastFour: string | null;
    categoryId: string | null;
    memo: string;
    confidence: number;
  }) => void;
  onSkip: () => void;
}

export function OcrResultCard({
  data,
  imageUrl,
  categories,
  onSave,
  onSkip,
}: OcrResultCardProps) {
  const [date, setDate] = useState(data.date ?? new Date().toISOString().split("T")[0]);
  const [merchant, setMerchant] = useState(data.merchantName ?? "");
  const [amount, setAmount] = useState(data.totalAmount?.toString() ?? "");
  const [vat, setVat] = useState(data.vatAmount?.toString() ?? "");
  const [payment, setPayment] = useState<"카드" | "현금" | "이체">(data.paymentMethod ?? "카드");
  const [cardLast, setCardLast] = useState(data.cardLastFour ?? "");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [showCatPicker, setShowCatPicker] = useState(false);

  // 카테고리 코드 → ID 매핑 (초기값)
  const matchedCat = categories.find((c) => c.code === data.categoryCode);
  const catId = selectedCatId ?? matchedCat?.id ?? null;
  const currentCat = categories.find((c) => c.id === catId);

  const confidenceLevel = data.confidence >= 0.8 ? "높음" : data.confidence >= 0.5 ? "보통" : "낮음";
  const confidenceDots = data.confidence >= 0.8 ? 3 : data.confidence >= 0.5 ? 2 : 1;

  function handleSave() {
    if (!merchant.trim() || !amount) return;
    onSave({
      date,
      merchantName: merchant.trim(),
      totalAmount: parseInt(amount.replace(/,/g, "")) || 0,
      vatAmount: vat ? parseInt(vat.replace(/,/g, "")) : null,
      paymentMethod: payment,
      cardLastFour: cardLast.trim() || null,
      categoryId: catId?.startsWith("default-") ? null : catId,
      memo: memo.trim(),
      confidence: data.confidence,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4 overflow-hidden"
    >
      <h3 className="text-heading-md text-[var(--text-primary)]">인식 결과</h3>

      {/* 영수증 미리보기 */}
      <div className="h-32 rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="영수증" className="w-full h-full object-contain" />
      </div>

      {/* 인식 필드 */}
      <div className="space-y-3">
        <Field label="날짜" low={data.confidence < 0.6 && !data.date}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="input-field" />
        </Field>

        <Field label="가맹점" low={data.confidence < 0.6 && !data.merchantName}>
          <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)}
            placeholder="가맹점명" className="input-field" />
        </Field>

        <Field label="금액" low={data.confidence < 0.6 && !data.totalAmount}>
          <input type="text" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="₩" className="input-field" />
        </Field>

        <Field label="부가세">
          <input type="text" value={vat}
            onChange={(e) => setVat(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="선택" className="input-field" />
        </Field>

        {/* 결제수단 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">결제수단</label>
          <div className="flex gap-2">
            {(["카드", "현금", "이체"] as const).map((m) => (
              <button key={m} onClick={() => setPayment(m)}
                className={`flex-1 py-2 rounded-xl text-caption font-medium transition-colors ${
                  payment === m
                    ? "bg-primary-500/15 text-primary-500 border border-primary-500/30"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-transparent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {payment === "카드" && (
          <Field label="카드 끝자리">
            <input type="text" value={cardLast} maxLength={4}
              onChange={(e) => setCardLast(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="1234" className="input-field" />
          </Field>
        )}

        {/* 카테고리 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">카테고리</label>
          <button
            onClick={() => setShowCatPicker(!showCatPicker)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[currentCat?.code ?? "F99"] }}
              />
              <span className="text-[var(--text-primary)]">
                {currentCat?.label ?? "카테고리 선택"}
              </span>
            </span>
            <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
          </button>

          {showCatPicker && (
            <div className="mt-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2 space-y-0.5 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCatId(cat.id); setShowCatPicker(false); }}
                  className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg text-left transition-colors ${
                    catId === cat.id ? "bg-primary-500/10" : "hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.code] ?? "#6B7280" }} />
                  <span className="text-caption text-[var(--text-primary)]">{cat.icon} {cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <Field label="메모">
          <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="선택" className="input-field" />
        </Field>
      </div>

      {/* 신뢰도 */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-caption text-[var(--text-tertiary)]">신뢰도:</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${
              i < confidenceDots ? "bg-primary-500" : "bg-[var(--bg-tertiary)]"
            }`} />
          ))}
        </div>
        <span className={`text-caption font-medium ${
          confidenceLevel === "높음" ? "text-success" : confidenceLevel === "보통" ? "text-warning" : "text-danger"
        }`}>
          {confidenceLevel}
        </span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button onClick={onSkip}
          className="flex-1 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-body-small font-medium press-effect">
          건너뛰기
        </button>
        <button onClick={handleSave} disabled={!merchant.trim() || !amount}
          className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect disabled:opacity-40">
          <span className="flex items-center justify-center gap-1">
            <Check size={16} /> 저장
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/** 입력 필드 래퍼 */
function Field({ label, low, children }: { label: string; low?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={`text-caption mb-1 block ${low ? "text-warning" : "text-[var(--text-secondary)]"}`}>
        {label} {low && "⚠️"}
      </label>
      {children}
    </div>
  );
}
