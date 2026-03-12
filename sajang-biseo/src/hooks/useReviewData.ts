"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { genBlockId, type ReplyBlock, type Platform, type ToneAdjustment, blocksToFullText } from "@/lib/review/blocks";
import type { Review, ReviewReply, StoreToneSettings } from "@/lib/supabase/types";

export type GenerationStage = "analyzing" | "writing" | "formatting" | null;

export function useReviewData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [toneSettings, setToneSettings] = useState<StoreToneSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 답글 생성 상태
  const [versions, setVersions] = useState<ReplyBlock[][]>([]);
  const [generating, setGenerating] = useState(false);
  const [regeneratingBlockId, setRegeneratingBlockId] = useState<string | null>(null);
  const [replyHistory, setReplyHistory] = useState<ReviewReply[]>([]);

  // 스트리밍 진행 상태
  const [generationStage, setGenerationStage] = useState<GenerationStage>(null);
  const [generationTokens, setGenerationTokens] = useState(0);

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
        .eq("store_id", storeId).limit(1).maybeSingle(),
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
      if (updateErr) { toast("톤 설정 저장에 실패했습니다.", "error"); return; }
      if (updated) { setToneSettings(updated); toast("톤 설정이 저장되었습니다.", "success"); }
    } else {
      const { data: created, error: createErr } = await supabase
        .from("sb_store_tone_settings").insert({ store_id: storeId, ...data })
        .select().single();
      if (createErr) { toast("톤 설정 생성에 실패했습니다.", "error"); return; }
      if (created) { setToneSettings(created); toast("톤 설정이 저장되었습니다.", "success"); }
    }
  }, [storeId, toneSettings, supabase, toast]);

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
    if (insertErr) { toast("리뷰 등록에 실패했습니다.", "error"); return; }
    toast("리뷰가 등록되었습니다.", "success");
    await loadData();
  }, [storeId, supabase, loadData, toast]);

  // 답글 생성 (전체 — SSE 스트리밍)
  const generateReply = useCallback(async (review: {
    content: string; rating: number; platform: Platform;
  }) => {
    if (!toneSettings) return;
    setGenerating(true);
    setVersions([]);
    setGenerationStage("analyzing");
    setGenerationTokens(0);

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

      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        // SSE 스트리밍 소비
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            try {
              const data = JSON.parse(dataLine.slice(6));

              switch (data.type) {
                case "stage":
                  setGenerationStage(data.stage);
                  break;
                case "progress":
                  setGenerationTokens(data.tokens);
                  break;
                case "done":
                  if (data.data?.versions) {
                    const vs: ReplyBlock[][] = data.data.versions.map(
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
                  break;
                case "error":
                  throw new Error(data.message);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message.includes("답글")) {
                throw parseErr;
              }
              // JSON parse error on SSE chunk — ignore
            }
          }
        }
      } else {
        // 비스트리밍 fallback (에러 응답 또는 JSON)
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "답글 생성 실패");
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
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "답글 생성 실패";
      console.error("답글 생성 오류:", msg);
      toast(msg, "error");
    }
    setGenerating(false);
    setGenerationStage(null);
    setGenerationTokens(0);
  }, [toneSettings, toast]);

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
      toast("블록 재생성에 실패했습니다.", "error");
    }
    setRegeneratingBlockId(null);
  }, [toneSettings, versions, toast]);

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
    if (replyErr) { toast("답글 저장에 실패했습니다.", "error"); return; }
    const { error: statusErr } = await supabase.from("sb_reviews").update({ reply_status: "replied" }).eq("id", reviewId);
    if (statusErr) console.error("리뷰 상태 업데이트 실패:", statusErr);
    toast("답글이 저장되었습니다.", "success");
    await loadData();
  }, [storeId, supabase, loadData, toast]);

  // 리뷰 삭제 (soft delete)
  const deleteReview = useCallback(async (reviewId: string) => {
    if (!storeId) return;
    const { error: delErr } = await supabase
      .from("sb_reviews").update({ deleted_at: new Date().toISOString() })
      .eq("id", reviewId).eq("store_id", storeId);
    if (delErr) { toast("리뷰 삭제에 실패했습니다.", "error"); return; }
    toast("리뷰가 삭제되었습니다.", "success");
    await loadData();
  }, [storeId, supabase, loadData, toast]);

  // 특정 리뷰의 답글 히스토리 로드
  const loadReplyHistory = useCallback(async (reviewId: string) => {
    if (!storeId) return;
    const { data, error: histErr } = await supabase
      .from("sb_review_replies").select("*")
      .eq("review_id", reviewId).eq("store_id", storeId)
      .order("created_at", { ascending: false });
    if (histErr) { console.error("답글 히스토리 로드 실패:", histErr); return; }
    setReplyHistory(data ?? []);
  }, [storeId, supabase]);

  const clearVersions = useCallback(() => setVersions([]), []);

  return {
    reviews, toneSettings, loading, error,
    versions, generating, regeneratingBlockId, replyHistory,
    generationStage, generationTokens,
    saveToneSettings, addReview, generateReply,
    editBlock, regenerateBlock, saveReply, clearVersions,
    deleteReview, loadReplyHistory,
  };
}
