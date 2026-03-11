"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { calculateFees, type ChannelSales, type CardFeeConfig } from "@/lib/fees/calculator";
import { toDateString, parseDate, addDays, formatDateShort } from "@/lib/utils/date";
import { useCountUp } from "@/hooks/useCountUp";
import { useFeeToggle } from "@/stores/useFeeToggle";
import { useToast } from "@/stores/useToast";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { usePresetsStore, DEFAULT_PRESETS, type Preset } from "@/stores/usePresetsStore";
import type { ChannelRatio } from "@/components/closing/ChannelSlider";

const DRAFT_KEY = "sajang-closing-draft";

export type { ChannelRatio };
export type { Preset } from "@/stores/usePresetsStore";
export { DEFAULT_PRESETS };

export function useClosingData() {
  const { mode } = useFeeToggle();
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [totalSales, setTotalSales] = useState(0);
  const [channels, setChannels] = useState<ChannelRatio[]>(DEFAULT_PRESETS[0].channels);
  const [cardRatio, setCardRatio] = useState(90);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { presets } = usePresetsStore();
  const [activePreset, setActivePreset] = useState<string | null>("평일 기본");

  // ── 수수료 채널 설정 (DB) ──
  const [feeRateMap, setFeeRateMap] = useState<Record<string, number>>({
    배민: 6.8, 쿠팡이츠: 9.8, 요기요: 12.5, 땡겨요: 2.0,
  });
  const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(3300);
  const [cardCreditRate, setCardCreditRate] = useState(1.3);
  const [customFees, setCustomFees] = useState<{ name: string; amount: number }[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<{ name: string; amount: number }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [previousClosingDate, setPreviousClosingDate] = useState<string | null>(null);
  const [deliveryChannelSet, setDeliveryChannelSet] = useState<Set<string>>(
    new Set(["배민", "쿠팡이츠", "요기요", "땡겨요", "네이버주문"])
  );

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sb_fee_channels")
          .select("channel_name, rate, fixed_amount, category")
          .eq("store_id", storeId)
          .eq("is_active", true)
          .is("deleted_at", null);

        if (error) throw error;
        if (data && data.length > 0) {
          const map: Record<string, number> = {};
          const deliverySet = new Set<string>();
          data.forEach((ch) => {
            if (ch.category === "delivery") {
              deliverySet.add(ch.channel_name);
              if (ch.rate) map[ch.channel_name] = ch.rate;
            }
          });
          if (deliverySet.size > 0) setDeliveryChannelSet(deliverySet);
          setFeeRateMap((prev) => ({ ...prev, ...map }));
          const deliveryAgency = data.find((ch) => ch.category === "delivery_agency" && ch.fixed_amount);
          if (deliveryAgency) setDeliveryFeePerOrder(deliveryAgency.fixed_amount!);
        }
      } catch (err) {
        console.error("수수료 채널 로드 실패:", err);
        toast("수수료 설정을 불러오지 못했습니다", "error");
      }
    })();
  }, [storeId, toast]);

  // ── 기존 마감 데이터 로드 ──
  const loadClosingData = useCallback(
    async (date: string) => {
      if (!storeId) return;
      try {
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("sb_daily_closing")
        .select("*, sb_daily_closing_channels(*)")
        .eq("store_id", storeId)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        setTotalSales(existing.total_sales);
        setCardRatio(existing.card_ratio);
        setMemo(existing.memo ?? "");
        setTags((existing.tags as string[]) ?? []);
        setTodayExpenses((existing.daily_expenses as { name: string; amount: number }[]) ?? []);
        setCustomFees((existing.custom_fees as { name: string; amount: number }[]) ?? []);
        setSaved(true);
        setPreviousClosingDate(null);

        const chData = (existing as Record<string, unknown>).sb_daily_closing_channels as Array<{
          channel_name: string; ratio: number; delivery_count: number | null;
        }> | null;

        if (chData && chData.length > 0) {
          setChannels(chData.map((ch) => ({
            channel: ch.channel_name, ratio: ch.ratio, deliveryCount: ch.delivery_count ?? undefined,
          })));
        }
        setActivePreset(null);
        return;
      }

      // 이전 영업일 비율
      const { data: prev } = await supabase
        .from("sb_daily_closing")
        .select("date, card_ratio, sb_daily_closing_channels(channel_name, ratio, delivery_count)")
        .eq("store_id", storeId)
        .lt("date", date)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prev) {
        setPreviousClosingDate(prev.date);
        setCardRatio(prev.card_ratio);
        const prevChannels = (prev as Record<string, unknown>).sb_daily_closing_channels as Array<{
          channel_name: string; ratio: number; delivery_count: number | null;
        }> | null;

        if (prevChannels && prevChannels.length > 0) {
          setChannels(prevChannels.map((ch) => ({
            channel: ch.channel_name, ratio: ch.ratio, deliveryCount: ch.delivery_count ?? undefined,
          })));
          setActivePreset(null);
        }
      } else {
        setPreviousClosingDate(null);
      }
      } catch (err) {
        console.error("마감 데이터 로드 실패:", err);
        toast("마감 데이터를 불러오지 못했습니다", "error");
      }
    },
    [storeId, toast]
  );

  useEffect(() => { loadClosingData(selectedDate); }, [selectedDate, loadClosingData]);

  // ── 수수료 계산 ──
  const cardConfig: CardFeeConfig = useMemo(
    () => ({ cardRatio, creditCardRate: cardCreditRate, checkCardRatio: 20, checkCardRate: 0.8 }),
    [cardRatio, cardCreditRate]
  );

  const feeResult = useMemo(() => {
    if (totalSales === 0) return calculateFees([], cardConfig);
    const channelSales: ChannelSales[] = channels
      .filter((ch) => ch.ratio > 0)
      .map((ch) => ({
        channel: ch.channel,
        amount: Math.round((totalSales * ch.ratio) / 100),
        isDelivery: deliveryChannelSet.has(ch.channel),
        feeRate: feeRateMap[ch.channel],
        deliveryCount: ch.deliveryCount,
        deliveryFeePerOrder: ch.deliveryCount ? deliveryFeePerOrder : 0,
      }));
    return calculateFees(channelSales, cardConfig);
  }, [totalSales, channels, cardConfig, feeRateMap, deliveryFeePerOrder, deliveryChannelSet]);

  const displayAmount = mode === "net" ? feeResult.netSales : totalSales;
  const animatedAmount = useCountUp(displayAmount);

  // ── 오프라인: 임시저장 (localStorage) ──
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (saved || totalSales === 0) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          date: selectedDate, totalSales, channels, cardRatio,
          memo, tags, todayExpenses, customFees, ts: Date.now(),
        }));
      } catch { /* quota exceeded 등 무시 */ }
    }, 1000);
    return () => clearTimeout(draftTimerRef.current);
  }, [selectedDate, totalSales, channels, cardRatio, memo, tags, todayExpenses, customFees, saved]);

  // 드래프트 복원 (DB 데이터 없을 때만)
  const draftRestored = useRef(false);
  useEffect(() => {
    if (draftRestored.current || saved) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      // 같은 날짜 + 1시간 이내 드래프트만 복원
      if (draft.date === selectedDate && Date.now() - draft.ts < 3600_000) {
        setTotalSales(draft.totalSales);
        setChannels(draft.channels);
        setCardRatio(draft.cardRatio);
        setMemo(draft.memo ?? "");
        setTags(draft.tags ?? []);
        setTodayExpenses(draft.todayExpenses ?? []);
        setCustomFees(draft.customFees ?? []);
        toast("이전에 작성 중이던 마감 데이터를 복원했습니다", "info");
        draftRestored.current = true;
      }
    } catch { /* 파싱 실패 무시 */ }
  }, [selectedDate, saved, toast]);

  // 저장 성공 시 드래프트 삭제
  useEffect(() => {
    if (saved) {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
  }, [saved]);

  // ── 날짜 이동 ──
  function moveDate(days: number) {
    const d = parseDate(selectedDate);
    setSelectedDate(toDateString(addDays(d, days)));
    setSaved(false);
    setTotalSales(0);
    setMemo("");
    setTags([]);
    setTodayExpenses([]);
    setCustomFees([]);
    setPreviousClosingDate(null);
    setChannels(DEFAULT_PRESETS[0].channels);
    setCardRatio(90);
    setActivePreset("평일 기본");
  }

  function goToDate(date: string) {
    setSelectedDate(date);
    setSaved(false);
    setTotalSales(0);
    setMemo("");
    setTags([]);
    setTodayExpenses([]);
    setCustomFees([]);
    setPreviousClosingDate(null);
    setChannels(DEFAULT_PRESETS[0].channels);
    setCardRatio(90);
    setActivePreset("평일 기본");
  }

  function applyPreset(preset: Preset) {
    setChannels(preset.channels);
    setCardRatio(preset.cardRatio);
    setActivePreset(preset.name);
  }

  // ── 저장 ──
  async function handleSave() {
    if (totalSales === 0 || !storeId) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: closing, error: closingError } = await supabase
        .from("sb_daily_closing")
        .upsert(
          {
            store_id: storeId, date: selectedDate,
            total_sales: totalSales, card_ratio: cardRatio,
            cash_ratio: 100 - cardRatio,
            total_fees: feeResult.totalFees, net_sales: feeResult.netSales,
            fee_rate: feeResult.feeRatePercent,
            memo: memo || null, input_mode: "keypad" as const,
            daily_expenses: todayExpenses,
            custom_fees: customFees,
            tags,
          },
          { onConflict: "store_id,date" }
        )
        .select("id")
        .single();

      if (closingError) throw closingError;

      if (closing) {
        const { error: deleteErr } = await supabase
          .from("sb_daily_closing_channels")
          .delete()
          .eq("closing_id", closing.id);
        if (deleteErr) throw deleteErr;

        const channelRows = feeResult.breakdown.map((b) => ({
          closing_id: closing.id, store_id: storeId,
          channel_name: b.channel, amount: b.amount,
          ratio: channels.find((ch) => ch.channel === b.channel)?.ratio ?? 0,
          delivery_count: channels.find((ch) => ch.channel === b.channel)?.deliveryCount ?? null,
          platform_fee: b.platformFee, delivery_fee: b.deliveryAgencyFee,
          card_fee: b.cardFee, total_fee: b.totalFee, net_amount: b.netAmount,
        }));

        const { error: insertErr } = await supabase.from("sb_daily_closing_channels").insert(channelRows);
        if (insertErr) throw insertErr;
      }

      setSaved(true);
      toast("마감이 저장되었습니다", "success");
    } catch (err) {
      console.error("마감 저장 실패:", err);
      // 오프라인이면 드래프트가 이미 localStorage에 있으므로 안내만
      if (!navigator.onLine) {
        toast("오프라인 상태입니다. 인터넷 연결 후 다시 저장해주세요.", "error");
      } else {
        toast("마감 저장에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  // ── 전날 복사 ──
  async function copyFromPreviousDay() {
    if (!storeId) return;
    try {
      const supabase = createClient();
      const { data: prev, error } = await supabase
        .from("sb_daily_closing")
        .select("date, total_sales, card_ratio, memo, tags, daily_expenses, custom_fees, sb_daily_closing_channels(channel_name, ratio, delivery_count)")
        .eq("store_id", storeId)
        .lt("date", selectedDate)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!prev) { toast("복사할 이전 마감 데이터가 없습니다", "info"); return; }

      setTotalSales(prev.total_sales);
      setCardRatio(prev.card_ratio);
      setMemo(prev.memo ?? "");
      setTags((prev.tags as string[]) ?? []);
      setTodayExpenses((prev.daily_expenses as { name: string; amount: number }[]) ?? []);
      setCustomFees((prev.custom_fees as { name: string; amount: number }[]) ?? []);
      setSaved(false);

      const prevChannels = (prev as Record<string, unknown>).sb_daily_closing_channels as Array<{
        channel_name: string; ratio: number; delivery_count: number | null;
      }> | null;
      if (prevChannels && prevChannels.length > 0) {
        setChannels(prevChannels.map((ch) => ({
          channel: ch.channel_name, ratio: ch.ratio, deliveryCount: ch.delivery_count ?? undefined,
        })));
        setActivePreset(null);
      }
      toast("이전 마감 데이터를 복사했습니다", "success");
    } catch (err) {
      console.error("이전 마감 복사 실패:", err);
      toast("이전 마감 데이터를 불러오지 못했습니다", "error");
    }
  }

  // ── 리포트 텍스트 생성 ──
  function generateReportText(): string {
    const dateObj = parseDate(selectedDate);
    const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
    const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${dayName})`;

    const lines: string[] = [];
    lines.push(`[마감 리포트] ${dateStr}`);
    lines.push("");
    lines.push(`총매출: ${totalSales.toLocaleString("ko-KR")}원`);
    if (feeResult.totalFees > 0) {
      lines.push(`수수료: -${feeResult.totalFees.toLocaleString("ko-KR")}원 (${feeResult.feeRatePercent.toFixed(1)}%)`);
      lines.push(`실수령: ${feeResult.netSales.toLocaleString("ko-KR")}원`);
    }
    const totalExp = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const customTotal = customFees.reduce((s, f) => s + f.amount, 0);
    if (totalExp > 0) {
      lines.push(`경비: -${totalExp.toLocaleString("ko-KR")}원`);
    }
    const profit = feeResult.netSales - totalExp - customTotal;
    lines.push(`순이익: ${profit.toLocaleString("ko-KR")}원`);
    lines.push("");

    // 채널 비율
    const activeChannels = channels.filter((ch) => ch.ratio > 0);
    if (activeChannels.length > 0) {
      lines.push(`채널: ${activeChannels.map((ch) => `${ch.channel} ${ch.ratio}%`).join(" / ")}`);
    }
    lines.push(`결제: 카드 ${cardRatio}% / 현금 ${100 - cardRatio}%`);

    if (tags.length > 0) {
      lines.push(`태그: ${tags.join(", ")}`);
    }
    if (memo) {
      lines.push(`메모: ${memo}`);
    }

    return lines.join("\n");
  }

  const dateObj = parseDate(selectedDate);
  const dateLabel = formatDateShort(dateObj);
  const isToday = selectedDate === toDateString(new Date());

  return {
    mode, selectedDate, totalSales, setTotalSales,
    channels, setChannels, cardRatio, setCardRatio,
    memo, setMemo, saving, saved, setSaved,
    presets, activePreset, setActivePreset,
    feeResult, animatedAmount, displayAmount,
    dateObj, dateLabel, isToday,
    moveDate, goToDate, applyPreset, handleSave,
    feeRateMap, setFeeRateMap,
    deliveryFeePerOrder, setDeliveryFeePerOrder,
    cardCreditRate, setCardCreditRate,
    customFees, setCustomFees,
    todayExpenses, setTodayExpenses,
    tags, setTags,
    copyFromPreviousDay, previousClosingDate, generateReportText,
  };
}
