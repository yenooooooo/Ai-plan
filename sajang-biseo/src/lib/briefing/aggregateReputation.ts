/**
 * 고객 평판 집계
 * - 리뷰 키워드 추출 (긍정/부정)
 */

import type { CustomerReputationData } from "./types";
import type { Review } from "@/lib/supabase/types";

const POSITIVE_WORDS = ["맛있", "친절", "깨끗", "빠른", "신선", "최고", "좋아", "추천", "만족", "굿"];
const NEGATIVE_WORDS = ["느린", "불친절", "차가", "짠", "싱거", "비싼", "실망", "최악", "별로", "늦"];

/** 리뷰 텍스트에서 키워드 빈도 추출 */
function extractKeywords(
  reviews: Review[],
  wordList: string[],
  topN: number
): string[] {
  const countMap = new Map<string, number>();
  wordList.forEach((w) => countMap.set(w, 0));

  reviews.forEach((r) => {
    wordList.forEach((w) => {
      if (r.content.includes(w)) {
        countMap.set(w, (countMap.get(w) ?? 0) + 1);
      }
    });
  });

  return Array.from(countMap.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

export function aggregateReputation(
  reviews: Review[],
  prevReviews: Review[]
): CustomerReputationData {
  const reviewCount = reviews.length;
  const prevReviewCount = prevReviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const prevAvgRating = prevReviewCount > 0
    ? prevReviews.reduce((s, r) => s + r.rating, 0) / prevReviewCount : 0;

  const replied = reviews.filter((r) => r.reply_status === "replied").length;
  const replyRate = reviewCount > 0 ? (replied / reviewCount) * 100 : 0;

  // 베스트 리뷰 (5점 중 가장 긴 리뷰)
  const fiveStars = reviews
    .filter((r) => r.rating === 5)
    .sort((a, b) => b.content.length - a.content.length);
  const bestReview = fiveStars[0]
    ? { content: fiveStars[0].content, platform: fiveStars[0].platform, rating: 5 }
    : null;

  // 키워드 추출
  const positiveKeywords = extractKeywords(reviews, POSITIVE_WORDS, 5);
  const negativeKeywords = extractKeywords(reviews, NEGATIVE_WORDS, 3);

  return {
    reviewCount, prevReviewCount,
    avgRating: Math.round(avgRating * 10) / 10,
    prevAvgRating: Math.round(prevAvgRating * 10) / 10,
    replyRate: Math.round(replyRate),
    repliedCount: replied, totalCount: reviewCount,
    positiveKeywords,
    negativeKeywords,
    bestReview,
  };
}
