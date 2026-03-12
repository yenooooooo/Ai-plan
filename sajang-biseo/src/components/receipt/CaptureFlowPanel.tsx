"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, PenLine, StickyNote } from "lucide-react";
import { ReceiptCapture } from "./ReceiptCapture";
import { OcrResultCard } from "./OcrResultCard";
import { ManualEntryForm } from "./ManualEntryForm";
import { useToast } from "@/stores/useToast";
import type { ReceiptCategory } from "@/lib/supabase/types";

type CaptureMode = "receipt" | "manual" | "memo";

const CAPTURE_MODES: { key: CaptureMode; label: string; icon: typeof Camera; desc: string }[] = [
  { key: "receipt", label: "영수증 촬영", icon: Camera, desc: "영수증을 촬영하거나 사진을 선택" },
  { key: "manual", label: "수기 입력", icon: PenLine, desc: "영수증 없이 직접 입력" },
  { key: "memo", label: "메모 촬영", icon: StickyNote, desc: "노트·메모 사진으로 인식" },
];

interface CaptureFlowPanelProps {
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
    imageUrl: string;
  }) => void;
  onDone: () => void;
}

export function CaptureFlowPanel({ categories, onSave, onDone }: CaptureFlowPanelProps) {
  const toast = useToast((s) => s.show);
  const [captureMode, setCaptureMode] = useState<CaptureMode | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<{
    date: string | null;
    merchantName: string | null;
    totalAmount: number | null;
    vatAmount: number | null;
    paymentMethod: "카드" | "현금" | "이체" | null;
    cardLastFour: string | null;
    categoryCode: string | null;
    confidence: number;
  } | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function handleCaptured(storageUrl: string, previewUrl: string) {
    setCapturedImageUrl(storageUrl);
    setPreviewImageUrl(previewUrl);
    setOcrLoading(true);
    setLimitReached(false);

    try {
      const form = new FormData();
      form.append("imageUrl", storageUrl);
      if (captureMode === "memo") form.append("mode", "memo");

      const res = await fetch("/api/receipt/ocr", { method: "POST", body: form });
      const json = await res.json();

      if (json.success && json.data) {
        setOcrData(json.data);
      } else if (json.limitReached) {
        setLimitReached(true);
      } else {
        toast(json.error || "인식에 실패했습니다. 직접 입력해주세요.", "error");
        setOcrData({
          date: new Date().toISOString().split("T")[0],
          merchantName: "", totalAmount: null, vatAmount: null,
          paymentMethod: "카드", cardLastFour: null,
          categoryCode: "F99", confidence: 0,
        });
      }
    } catch {
      toast("인식 중 오류가 발생했습니다. 직접 입력해주세요.", "error");
      setOcrData({
        date: new Date().toISOString().split("T")[0],
        merchantName: "", totalAmount: null, vatAmount: null,
        paymentMethod: "카드", cardLastFour: null,
        categoryCode: "F99", confidence: 0,
      });
    } finally {
      setOcrLoading(false);
    }
  }

  function handleSaveEntry(data: {
    date: string;
    merchantName: string;
    totalAmount: number;
    vatAmount: number | null;
    paymentMethod: "카드" | "현금" | "이체";
    cardLastFour: string | null;
    categoryId: string | null;
    memo: string;
    confidence: number;
  }) {
    onSave({ ...data, imageUrl: capturedImageUrl ?? "" });
  }

  function resetCapture() {
    setCapturedImageUrl(null);
    setPreviewImageUrl(null);
    setOcrData(null);
    setLimitReached(false);
    setCaptureMode(null);
    onDone();
  }

  return (
    <div className="space-y-4">
      {/* 모드 선택 */}
      {!captureMode && !ocrData && !limitReached && (
        <div className="space-y-3">
          <p className="text-body-small text-[var(--text-secondary)]">
            경비 등록 방법을 선택하세요
          </p>
          {CAPTURE_MODES.map(({ key, label, icon: Icon, desc }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCaptureMode(key)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-left press-effect hover:border-primary-500/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-primary-500" />
              </div>
              <div>
                <p className="text-body-small font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-caption text-[var(--text-tertiary)]">{desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* 영수증 촬영 */}
      {captureMode === "receipt" && !capturedImageUrl && !ocrData && !limitReached && (
        <>
          <BackButton onClick={() => setCaptureMode(null)} />
          <ReceiptCapture onCaptured={handleCaptured} />
        </>
      )}

      {/* 메모 촬영 */}
      {captureMode === "memo" && !capturedImageUrl && !ocrData && !limitReached && (
        <>
          <BackButton onClick={() => setCaptureMode(null)} />
          <div className="glass-card p-4 mb-1">
            <p className="text-caption text-[var(--text-secondary)]">
              손글씨 메모, 노트, 수기 영수증 등을 촬영하면 AI가 내용을 인식합니다.
              글씨가 선명할수록 인식률이 높아요.
            </p>
          </div>
          <ReceiptCapture onCaptured={handleCaptured} />
        </>
      )}

      {/* 수기 입력 */}
      {captureMode === "manual" && !ocrData && (
        <>
          <BackButton onClick={() => setCaptureMode(null)} />
          <ManualEntryForm
            categories={categories}
            onSave={handleSaveEntry}
            onCancel={resetCapture}
          />
        </>
      )}

      {/* OCR 로딩 */}
      {ocrLoading && (
        <div className="glass-card p-8 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-body-small text-[var(--text-secondary)]">
            {captureMode === "memo" ? "AI가 메모를 분석 중입니다..." : "AI가 영수증을 분석 중입니다..."}
          </p>
        </div>
      )}

      {/* 사용량 초과 */}
      {limitReached && (
        <div className="glass-card p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-2xl">
            ⚡
          </div>
          <h3 className="text-heading-md text-[var(--text-primary)]">
            이번 달 무료 인식 횟수를 모두 사용했어요
          </h3>
          <p className="text-body-small text-[var(--text-secondary)]">
            무료 플랜은 월 5회까지 영수증 인식이 가능합니다.<br />
            Pro 플랜으로 업그레이드하면 월 100회까지 사용할 수 있어요.
          </p>
          <div className="flex gap-2 w-full mt-1">
            <button onClick={resetCapture}
              className="flex-1 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-body-small font-medium press-effect">
              돌아가기
            </button>
            <button onClick={() => { window.location.href = "/settings"; }}
              className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect">
              플랜 업그레이드
            </button>
          </div>
        </div>
      )}

      {/* OCR 결과 */}
      {ocrData && capturedImageUrl && (
        <OcrResultCard
          data={ocrData}
          imageUrl={previewImageUrl ?? capturedImageUrl}
          categories={categories}
          onSave={handleSaveEntry}
          onSkip={resetCapture}
        />
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="text-caption text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
      ← 다른 방법 선택
    </button>
  );
}
