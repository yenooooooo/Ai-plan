"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { toDateString } from "@/lib/utils/date";

interface DailyNoteProps {
  initialMemo: string | null;
  readOnly?: boolean;
}

export function DailyNote({ initialMemo, readOnly = false }: DailyNoteProps) {
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(initialMemo ?? "");
  const [savedNote, setSavedNote] = useState(initialMemo ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNote(initialMemo ?? "");
    setSavedNote(initialMemo ?? "");
  }, [initialMemo]);

  async function handleSave() {
    if (!storeId || note === savedNote) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const today = toDateString(new Date());

      // 기존 마감 데이터가 있으면 memo만 업데이트, 없으면 최소 레코드 생성
      const { data: existing } = await supabase
        .from("sb_daily_closing")
        .select("id")
        .eq("store_id", storeId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("sb_daily_closing")
          .update({ memo: note || null })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("sb_daily_closing")
          .insert({
            store_id: storeId,
            date: today,
            total_sales: 0,
            card_ratio: 90,
            cash_ratio: 10,
            total_fees: 0,
            net_sales: 0,
            fee_rate: 0,
            memo: note || null,
            input_mode: "keypad" as const,
          });
      }

      setSavedNote(note);
    } catch (err) {
      console.error("메모 저장 실패:", err);
      toast("메모 저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (readOnly) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-body-small font-semibold text-[var(--text-primary)]">오늘 한 줄</h2>
        {savedNote ? (
          <p className="text-body-small text-[var(--text-secondary)] mt-2">{savedNote}</p>
        ) : (
          <p className="text-caption text-[var(--text-tertiary)] mt-2">아직 메모가 없습니다</p>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-body-small font-semibold text-[var(--text-primary)]">오늘 한 줄</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setNote(savedNote); setEditing(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-3 rounded-lg text-caption font-medium
                bg-primary-500 text-white disabled:opacity-50 press-effect"
            >
              {saving ? "..." : <Check size={14} />}
            </button>
          </div>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="오늘 장사는 어땠나요? (비 와서 손님 적었음, 신메뉴 반응 좋음...)"
          autoFocus
          rows={2}
          maxLength={200}
          className="w-full bg-[var(--bg-tertiary)] rounded-xl p-3
            text-body-small text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)]
            border border-[var(--border-default)]
            focus:outline-none focus:border-primary-500
            transition-colors resize-none"
        />
        <p className="text-[10px] text-[var(--text-tertiary)] text-right">{note.length}/200</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="glass-card p-4 w-full text-left press-effect group"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-body-small font-semibold text-[var(--text-primary)]">오늘 한 줄</h2>
        <Pencil size={14} className="text-[var(--text-tertiary)] group-hover:text-primary-500 transition-colors" />
      </div>
      {savedNote ? (
        <p className="text-body-small text-[var(--text-secondary)] mt-2">{savedNote}</p>
      ) : (
        <p className="text-caption text-[var(--text-tertiary)] mt-2">
          오늘 장사는 어땠나요? 탭해서 기록하세요
        </p>
      )}
    </button>
  );
}
