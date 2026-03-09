"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { genBlockId, type ReplyBlock, type Platform, type ToneAdjustment, blocksToFullText } from "@/lib/review/blocks";
import type { Review, StoreToneSettings } from "@/lib/supabase/types";

export function useReviewData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [toneSettings, setToneSettings] = useState<StoreToneSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 답글 생성 상태
  const [versions, setVersions] = useState<ReplyBlock[][]>([]);
  const [generating, setGenerating] = useState(false);
  const [regeneratingBlockId, setRegeneratingBlockId] = useState<string | null>(null);

  // 리뷰 & 톤 설정 로드
  const loadData = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    setError(null);
    const [reviewsRes, toneRes] = await Promise.all([
      supabase.from("sb_reviews").select("*")
        .eq("store_id", storeId).is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase.from("sb_store_tone_settings").select("*")
        .eq("store_id", storeId).limit(1).single(),
    ]);

    if (reviewsRes.error) {
      setError("리뷰 데이터를 불러오지 못했습니다");
    }
    setReviews(reviewsRes.data ?? []);
    setToneSettings(toneRes.data);
    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // 톤 설정 저장
  const saveToneSettings = useCallback(async (data: {
    tone_name: string;
    sample_replies: string[];
    store_name_display: string;
    signature_menus: string[];
    store_features: string[];
    frequent_phrases: string[];
    use_emoji: boolean;
  }) => {
    if (!storeId) return;

    if (toneSettings) {
      const { data: updated, error: updateErr } = await supabase
        .from("sb_store_tone_settings").update(data)
        .eq("id", toneSettings.id).select().single();
      if (updateErr) { console.error("톤 설정 저장 실패:", updateErr); return; }
      if (updated) setToneSettings(updated);
    } else {
      const { data: created, error: createErr } = await supabase
        .from("sb_store_tone_settings").insert({ store_id: storeId, ...data })
        .select().single();
      if (createErr) { console.error("톤 설정 생성 실패:", createErr); return; }
      if (created) setToneSettings(created);
    }
  }, [storeId, toneSettings, supabase]);

  // 리뷰 등록 (수동)
  const addReview = useCallback(async (data: {
    content: string; rating: number; platform: Platform;
  }) => {
    if (!storeId) return;
    const { error: insertErr } = await supabase.from("sb_reviews").insert({
      store_id: storeId,
      platform: data.platform,
      rating: data.rating,
      content: data.content,
      reply_status: "pending",
      reviewed_at: new Date().toISOString(),
    });
    if (insertErr) { console.error("리뷰 등록 실패:", insertErr); return; }
    await loadData();
  }, [storeId, supabase, loadData]);

  // 답글 생성 (전체)
  const generateReply = useCallback(async (review: {
    content: string; rating: number; platform: Platform;
  }) => {
    if (!toneSettings) return;
    setGenerating(true);
    setVersions([]);

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewContent: review.content,
          rating: review.rating,
          platform: review.platform,
          toneSettings: {
            toneName: toneSettings.tone_name,
            sampleReplies: toneSettings.sample_replies ?? [],
            storeNameDisplay: toneSettings.store_name_display ?? "",
            signatureMenus: toneSettings.signature_menus ?? [],
            storeFeatures: toneSettings.store_features ?? [],
            frequentPhrases: toneSettings.frequent_phrases ?? [],
            useEmoji: toneSettings.use_emoji,
          },
        }),
      });
      if (!res.ok) throw new Error("답글 생성 실패");
      const json = await res.json();
      if (json.success && json.data?.versions) {
        const vs: ReplyBlock[][] = json.data.versions.map(
          (v: { blocks: { type: string; text: string }[] }) =>
            v.blocks.map((b) => ({
              id: genBlockId(),
              type: b.type as ReplyBlock["type"],
              label: b.type,
              text: b.text,
            }))
        );
        setVersions(vs);
      }
    } catch (err) {
      console.error("답글 생성 오류:", err);
    }
    setGenerating(false);
  }, [toneSettings]);

  // 블록 직접 편집
  const editBlock = useCallback((versionIdx: number, blockId: string, text: string) => {
    setVersions((prev) =>
      prev.map((v, i) =>
        i === versionIdx ? v.map((b) => (b.id === blockId ? { ...b, text } : b)) : v
      )
    );
  }, []);

  // 블록 재생성
  const regenerateBlock = useCallback(async (
    blockId: string, blockType: string, adjustment?: ToneAdjustment,
    reviewContent?: string, rating?: number
  ) => {
    if (!toneSettings) return;
    setRegeneratingBlockId(blockId);

    const currentBlocks = versions.find((v) => v.some((b) => b.id === blockId));
    const context = currentBlocks
      ?.filter((b) => b.id !== blockId)
      .map((b) => `[${b.type}] ${b.text}`).join("\n") ?? "";

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewContent: reviewContent ?? "",
          rating: rating ?? 5,
          platform: "배민",
          toneSettings: {
            toneName: toneSettings.tone_name,
            sampleReplies: toneSettings.sample_replies ?? [],
            storeNameDisplay: toneSettings.store_name_display ?? "",
            signatureMenus: toneSettings.signature_menus ?? [],
            storeFeatures: toneSettings.store_features ?? [],
            frequentPhrases: toneSettings.frequent_phrases ?? [],
            useEmoji: toneSettings.use_emoji,
          },
          regenerateBlock: { type: blockType, toneAdjustment: adjustment, context },
        }),
      });
      if (!res.ok) throw new Error("블록 재생성 실패");
      const json = await res.json();
      if (json.success && json.data?.text) {
        setVersions((prev) =>
          prev.map((v) =>
            v.some((b) => b.id === blockId)
              ? v.map((b) => (b.id === blockId ? { ...b, text: json.data.text } : b))
              : v
          )
        );
      }
    } catch (err) {
      console.error("블록 재생성 오류:", err);
    }
    setRegeneratingBlockId(null);
  }, [toneSettings, versions]);

  // 답글 저장 (DB)
  const saveReply = useCallback(async (reviewId: string, blocks: ReplyBlock[], version: number) => {
    if (!storeId) return;
    const { error: replyErr } = await supabase.from("sb_review_replies").insert({
      review_id: reviewId,
      store_id: storeId,
      blocks: blocks as unknown as import("@/lib/supabase/types").Json,
      full_text: blocksToFullText(blocks),
      version,
      is_selected: true,
    });
    if (replyErr) { console.error("답글 저장 실패:", replyErr); return; }
    const { error: statusErr } = await supabase.from("sb_reviews").update({ reply_status: "replied" }).eq("id", reviewId);
    if (statusErr) console.error("리뷰 상태 업데이트 실패:", statusErr);
    await loadData();
  }, [storeId, supabase, loadData]);

  const clearVersions = useCallback(() => setVersions([]), []);

  return {
    reviews, toneSettings, loading, error,
    versions, generating, regeneratingBlockId,
    saveToneSettings, addReview, generateReply,
    editBlock, regenerateBlock, saveReply, clearVersions,
  };
}
