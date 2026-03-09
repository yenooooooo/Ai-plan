"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, AlertTriangle } from "lucide-react";
import { formatDateShort, parseDate } from "@/lib/utils/date";
import type { Review } from "@/lib/supabase/types";

interface ReviewDashboardProps {
  reviews: Review[];
  onReviewSelect: (review: Review) => void;
}

export function ReviewDashboard({ reviews, onReviewSelect }: ReviewDashboardProps) {
  // 별점 분포
  const ratingDist = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating - 1]++;
  }
  const maxCount = Math.max(...ratingDist, 1);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // 답글 상태
  const pending = reviews.filter((r) => r.reply_status === "pending");
  const replied = reviews.filter((r) => r.reply_status === "replied");

  // 부정 리뷰 (1~2점) 우선 정렬
  const sortedPending = [...pending].sort((a, b) => a.rating - b.rating);

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-body-small font-semibold text-[var(--text-primary)]">
            리뷰 현황
          </h4>
          <span className="text-caption text-[var(--text-tertiary)]">
            총 {reviews.length}건
          </span>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="text-center">
            <p className="text-amount-card font-display text-primary-500">{avgRating}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={12}
                  className={n <= Math.round(Number(avgRating)) ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 h-5">
                <span className="text-[11px] text-[var(--text-tertiary)] w-3">{rating}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(ratingDist[rating - 1] / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: (5 - rating) * 0.05 }}
                    className={`h-full rounded-full ${
                      rating >= 4 ? "bg-primary-500" : rating === 3 ? "bg-warning" : "bg-danger"
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] w-4 text-right">
                  {ratingDist[rating - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-danger/10 rounded-xl p-3 text-center">
            <p className="text-heading-md font-display text-danger">{pending.length}</p>
            <p className="text-caption text-danger/70">미답글</p>
          </div>
          <div className="flex-1 bg-success/10 rounded-xl p-3 text-center">
            <p className="text-heading-md font-display text-success">{replied.length}</p>
            <p className="text-caption text-success/70">답글 완료</p>
          </div>
        </div>
      </div>

      {/* 미답글 리스트 */}
      {sortedPending.length > 0 && (
        <div>
          <h4 className="text-body-small font-semibold text-[var(--text-primary)] mb-2">
            답글 필요 ({pending.length}건)
          </h4>
          <div className="space-y-2">
            {sortedPending.map((review, i) => (
              <ReviewRow key={review.id} review={review} onClick={() => onReviewSelect(review)} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* 답글 완료 리스트 */}
      {replied.length > 0 && (
        <div>
          <h4 className="text-body-small font-semibold text-[var(--text-secondary)] mb-2">
            답글 완료 ({replied.length}건)
          </h4>
          <div className="space-y-2">
            {replied.slice(0, 10).map((review, i) => (
              <ReviewRow key={review.id} review={review} onClick={() => onReviewSelect(review)} index={i} done />
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="glass-card p-8 text-center">
          <MessageSquare size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
          <p className="text-body-small text-[var(--text-tertiary)]">
            아직 등록된 리뷰가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ review, onClick, index, done }: {
  review: Review; onClick: () => void; index: number; done?: boolean;
}) {
  const isNegative = review.rating <= 2;
  const d = review.reviewed_at ? parseDate(review.reviewed_at.split("T")[0]) : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`w-full text-left glass-card p-3 press-effect ${done ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={10}
                  className={n <= review.rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
              ))}
            </div>
            <span className="text-[11px] text-[var(--text-tertiary)]">{review.platform}</span>
            {d && <span className="text-[11px] text-[var(--text-tertiary)]">{formatDateShort(d)}</span>}
            {isNegative && !done && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-danger/10 text-danger text-[11px] font-medium">
                <AlertTriangle size={10} /> 부정
              </span>
            )}
          </div>
          <p className="text-caption text-[var(--text-primary)] line-clamp-2">{review.content}</p>
        </div>
      </div>
    </motion.button>
  );
}
