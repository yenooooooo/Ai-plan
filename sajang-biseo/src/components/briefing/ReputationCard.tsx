"use client";

import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Trophy } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import type { CustomerReputationData } from "@/lib/briefing/types";

interface ReputationCardProps {
  data: CustomerReputationData;
}

export function ReputationCard({ data }: ReputationCardProps) {
  const countAnimated = useCountUp(data.reviewCount);
  const ratingAnimated = useCountUp(data.avgRating, { decimals: 1 });

  return (
    <div className="space-y-4">
      {/* 메인 수치 */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">주간 리뷰</p>
          <p className="text-heading-md font-display text-[var(--text-primary)]">
            {countAnimated}건
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            전주 {data.prevReviewCount}건
          </p>
        </div>
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">평균 별점</p>
          <div className="flex items-center justify-center gap-1">
            <Star size={16} className="text-warning fill-warning" />
            <p className="text-heading-md font-display text-[var(--text-primary)]">
              {ratingAnimated.toFixed(1)}
            </p>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            전주 {data.prevAvgRating}
          </p>
        </div>
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
          <p className="text-caption text-[var(--text-tertiary)] mb-1">답글 완료</p>
          <p className="text-heading-md font-display text-primary-500">
            {data.replyRate}%
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            {data.repliedCount}/{data.totalCount}
          </p>
        </div>
      </div>

      {/* 키워드 */}
      <div className="space-y-2">
        {data.positiveKeywords.length > 0 && (
          <div className="flex items-start gap-2">
            <ThumbsUp size={14} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {data.positiveKeywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.negativeKeywords.length > 0 && (
          <div className="flex items-start gap-2">
            <ThumbsDown size={14} className="text-danger mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {data.negativeKeywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 rounded-md bg-danger/10 text-danger text-[11px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 베스트 리뷰 */}
      {data.bestReview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-500/5 rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Trophy size={13} className="text-primary-500" />
            <span className="text-[11px] font-semibold text-primary-500">이번 주 베스트 리뷰</span>
          </div>
          <p className="text-caption text-[var(--text-primary)] line-clamp-2 leading-relaxed">
            &quot;{data.bestReview.content}&quot;
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] text-[var(--text-tertiary)]">- {data.bestReview.platform}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={9}
                  className={n <= data.bestReview!.rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
