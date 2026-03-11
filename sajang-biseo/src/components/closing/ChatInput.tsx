"use client";

import { useState } from "react";
import { Send, MessageSquare, Check, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { ChannelRatio } from "@/components/closing/ChannelSlider";

interface ParsedResult {
  totalSales: number | null;
  channels: { channel: string; ratio: number }[];
  memo: string;
}

interface ChatInputProps {
  onApply: (data: {
    totalSales: number;
    channels: ChannelRatio[];
    memo: string;
  }) => void;
}

export function ChatInput({ onApply }: ChatInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/closing/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        setError(json.error || "입력을 분석하지 못했습니다");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result?.totalSales) return;
    const channels: ChannelRatio[] = result.channels.map((ch) => ({
      channel: ch.channel,
      ratio: ch.ratio,
    }));
    onApply({
      totalSales: result.totalSales,
      channels: channels.length > 0 ? channels : [],
      memo: result.memo || "",
    });
    setText("");
    setResult(null);
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-caption text-[var(--text-tertiary)]">
        <MessageSquare size={14} />
        자유롭게 입력하면 AI가 매출을 분석합니다
      </div>

      {/* 입력 영역 */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 오늘 187만 홀120 배67 비오는데 장사 잘됐음"
          className="flex-1 h-20 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] text-body-small
            text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500
            resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="self-end p-3 rounded-xl bg-primary-500 text-white disabled:opacity-40 press-effect"
        >
          <Send size={18} />
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-5 h-5 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-body-small text-[var(--text-secondary)]">AI가 분석 중...</span>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-3 rounded-xl bg-danger/10 text-danger text-body-small">{error}</div>
      )}

      {/* 파싱 결과 */}
      {result && (
        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] space-y-2">
          <p className="text-caption text-[var(--text-tertiary)] font-medium">분석 결과</p>

          {result.totalSales != null && (
            <div className="flex justify-between">
              <span className="text-body-small text-[var(--text-secondary)]">총매출</span>
              <span className="text-body-small font-bold text-[var(--text-primary)]">
                {formatCurrency(result.totalSales)}
              </span>
            </div>
          )}

          {result.channels.length > 0 && (
            <div className="flex justify-between">
              <span className="text-body-small text-[var(--text-secondary)]">채널</span>
              <span className="text-body-small text-[var(--text-primary)]">
                {result.channels.map((c) => `${c.channel} ${c.ratio}%`).join(", ")}
              </span>
            </div>
          )}

          {result.memo && (
            <div className="flex justify-between">
              <span className="text-body-small text-[var(--text-secondary)]">메모</span>
              <span className="text-body-small text-[var(--text-primary)]">{result.memo}</span>
            </div>
          )}

          {!result.totalSales && (
            <p className="text-body-small text-warning">매출 금액을 인식하지 못했습니다. 다시 입력해주세요.</p>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                text-body-small font-medium flex items-center justify-center gap-1.5 press-effect">
              <RotateCcw size={14} />다시 입력
            </button>
            <button onClick={handleApply} disabled={!result.totalSales}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white
                text-body-small font-medium flex items-center justify-center gap-1.5
                disabled:opacity-40 press-effect">
              <Check size={14} />적용하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
