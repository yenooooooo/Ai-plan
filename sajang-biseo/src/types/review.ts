/** 리뷰 데이터 */
export interface Review {
  id: string;
  storeId: string;
  platform: "배민" | "쿠팡이츠" | "네이버" | "요기요" | "기타";
  rating: number; // 1~5
  content: string;
  replyStatus: "pending" | "replied";
  createdAt: string;
}

/** 리뷰 답글 */
export interface ReviewReply {
  id: string;
  reviewId: string;
  blocks: ReplyBlock[];
  fullText: string;
  version: number;
  createdAt: string;
}

/** 답글 블록 */
export interface ReplyBlock {
  type: "greeting" | "mention" | "response" | "closing";
  label: string;
  content: string;
}

/** 톤 설정 */
export interface ToneSettings {
  storeId: string;
  toneName: string; // "친근한 동네 사장님" 등
  sampleReplies: string[];
  storeName: string;
  signatureMenus: string[];
  storeFeatures: string[];
  useEmoji: boolean;
}
