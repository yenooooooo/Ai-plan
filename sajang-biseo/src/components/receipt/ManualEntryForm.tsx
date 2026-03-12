"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/receipt/categories";
import type { ReceiptCategory } from "@/lib/supabase/types";

interface ManualEntryFormProps {
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
  onCancel: () => void;
}

export function ManualEntryForm({ categories, onSave, onCancel }: ManualEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [vat, setVat] = useState("");
  const [payment, setPayment] = useState<"카드" | "현금" | "이체">("카드");
  const [cardLast, setCardLast] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [showCatPicker, setShowCatPicker] = useState(false);

  const currentCat = categories.find((c) => c.id === selectedCatId);

  function handleSave() {
    if (!merchant.trim() || !amount) return;
    onSave({
      date,
      merchantName: merchant.trim(),
      totalAmount: parseInt(amount.replace(/,/g, "")) || 0,
      vatAmount: vat ? parseInt(vat.replace(/,/g, "")) : null,
      paymentMethod: payment,
      cardLastFour: cardLast.trim() || null,
      categoryId: selectedCatId?.startsWith("default-") ? null : selectedCatId,
      memo: memo.trim(),
      confidence: 1.0, // 수기 입력은 신뢰도 최대
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <h3 className="text-heading-md text-[var(--text-primary)]">수기 입력</h3>
      <p className="text-caption text-[var(--text-tertiary)]">
        영수증 없이 직접 경비를 입력하세요
      </p>

      <div className="space-y-3">
        {/* 날짜 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="input-field" />
        </div>

        {/* 가맹점/사용처 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">사용처</label>
          <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)}
            placeholder="가맹점명 또는 사용 내역" className="input-field" />
        </div>

        {/* 금액 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">금액</label>
          <input type="text" inputMode="numeric" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="₩ 금액 입력" className="input-field" />
        </div>

        {/* 부가세 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">부가세 (선택)</label>
          <input type="text" inputMode="numeric" value={vat}
            onChange={(e) => setVat(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="선택" className="input-field" />
        </div>

        {/* 결제수단 */}
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">결제수단</label>
          <div className="flex gap-2">
            {(["카드", "현금", "이체"] as const).map((m) => (
              <button key={m} onClick={() => setPayment(m)}
                className={`flex-1 py-2.5 rounded-xl text-caption font-medium transition-colors ${
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

        {/* 카드 끝자리 */}
        {payment === "카드" && (
          <div>
            <label className="text-caption text-[var(--text-secondary)] mb-1 block">카드 끝자리 (선택)</label>
            <input type="text" inputMode="numeric" value={cardLast} maxLength={4}
              onChange={(e) => setCardLast(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="1234" className="input-field" />
          </div>
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
                    selectedCatId === cat.id ? "bg-primary-500/10" : "hover:bg-[var(--bg-tertiary)]"
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
        <div>
          <label className="text-caption text-[var(--text-secondary)] mb-1 block">메모 (선택)</label>
          <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="추가 메모" className="input-field" />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-body-small font-medium press-effect">
          취소
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
