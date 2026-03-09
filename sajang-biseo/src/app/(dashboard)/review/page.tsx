"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  Settings2,
  BarChart3,
  Save,
} from "lucide-react";
import { ToneSetup } from "@/components/review/ToneSetup";
import { ReviewInput } from "@/components/review/ReviewInput";
import { BlockEditor } from "@/components/review/BlockEditor";
import { ReviewDashboard } from "@/components/review/ReviewDashboard";
import { useReviewData } from "@/hooks/useReviewData";
import type { Review } from "@/lib/supabase/types";
import type { Platform, ToneAdjustment } from "@/lib/review/blocks";

type Tab = "generate" | "dashboard" | "settings";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
  { key: "generate", label: "답글 생성", icon: Sparkles },
  { key: "dashboard", label: "리뷰 관리", icon: BarChart3 },
  { key: "settings", label: "톤 설정", icon: Settings2 },
];

export default function ReviewPage() {
  const {
    reviews, toneSettings, loading,
    versions, generating, regeneratingBlockId,
    saveToneSettings, generateReply,
    editBlock, regenerateBlock, saveReply, clearVersions,
  } = useReviewData();

  const [tab, setTab] = useState<Tab>("generate");
  const [currentVersion, setCurrentVersion] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // 현재 입력 중인 리뷰 정보 (재생성 시 필요)
  const [currentReviewData, setCurrentReviewData] = useState<{
    content: string; rating: number; platform: Platform;
  } | null>(null);

  // 답글 생성
  async function handleGenerate(data: { content: string; rating: number; platform: Platform }) {
    setCurrentReviewData(data);
    setCurrentVersion(0);
    await generateReply(data);
  }

  // 대시보드에서 리뷰 선택 → 생성 탭으로 이동
  function handleReviewSelect(review: Review) {
    setSelectedReview(review);
    setCurrentReviewData({
      content: review.content,
      rating: review.rating,
      platform: review.platform,
    });
    setTab("generate");
  }

  // 블록 재생성
  function handleBlockRegenerate(blockId: string, blockType: string, adjustment?: ToneAdjustment) {
    regenerateBlock(
      blockId, blockType, adjustment,
      currentReviewData?.content, currentReviewData?.rating
    );
  }

  // 답글 저장
  async function handleSaveReply() {
    if (!selectedReview || versions.length === 0) return;
    await saveReply(selectedReview.id, versions[currentVersion], currentVersion + 1);
    setSelectedReview(null);
    setCurrentReviewData(null);
  }

  // 톤 미설정 시 설정 탭으로 유도
  const needSetup = !toneSettings && tab === "generate";

  return (
    <div className="animate-fade-in pb-8">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">
          리뷰 답글
        </h1>
        <p className="text-body-small text-[var(--text-secondary)]">
          AI가 맞춤 답글을 작성해드려요
        </p>
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── 답글 생성 탭 ── */}
        {tab === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {needSetup ? (
              <div className="glass-card p-6 text-center">
                <Settings2 size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                <p className="text-body-small text-[var(--text-secondary)] mb-3">
                  먼저 톤 설정을 완료해주세요
                </p>
                <button onClick={() => setTab("settings")}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect">
                  톤 설정하기
                </button>
              </div>
            ) : (
              <>
                {/* 리뷰 입력 */}
                <ReviewInput
                  onGenerate={handleGenerate}
                  loading={generating}
                  hasResult={versions.length > 0}
                  onReset={() => { setCurrentReviewData(null); setSelectedReview(null); clearVersions(); }}
                />

                {/* 생성 결과 (블록 에디터) */}
                {versions.length > 0 && (
                  <>
                    <BlockEditor
                      versions={versions}
                      currentVersion={currentVersion}
                      onVersionChange={setCurrentVersion}
                      onBlockEdit={editBlock}
                      onBlockRegenerate={handleBlockRegenerate}
                      regeneratingBlockId={regeneratingBlockId}
                    />

                    {/* 선택된 리뷰가 있으면 저장 버튼 */}
                    {selectedReview && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveReply}
                        className="w-full py-3 rounded-2xl bg-success/10 text-success font-medium text-body-small flex items-center justify-center gap-2 press-effect"
                      >
                        <Save size={16} /> 답글 저장 (완료 처리)
                      </motion.button>
                    )}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── 리뷰 관리 탭 ── */}
        {tab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ReviewDashboard reviews={reviews} onReviewSelect={handleReviewSelect} />
            )}
          </motion.div>
        )}

        {/* ── 톤 설정 탭 ── */}
        {tab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ToneSetup settings={toneSettings} onSave={saveToneSettings} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
