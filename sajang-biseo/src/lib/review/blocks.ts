/**
 * 리뷰 답글 블록 타입 정의
 * 별점에 따라 블록 구성이 달라짐
 */

export type BlockType =
  | "greeting"     // 인사
  | "empathy"      // 공감/감사
  | "mention"      // 리뷰 언급
  | "menu_detail"  // 메뉴/서비스 상세
  | "response"     // 감사/해명/개선약속
  | "invitation"   // 재방문 유도
  | "closing";     // 마무리

export interface ReplyBlock {
  id: string;
  type: BlockType;
  label: string;
  text: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  greeting: "인사",
  empathy: "공감/감사",
  mention: "리뷰 언급",
  menu_detail: "메뉴/서비스 소개",
  response: "감사/해명",
  invitation: "재방문 유도",
  closing: "마무리",
};

/** 긍정 리뷰 (4~5점) 블록 순서 */
export const POSITIVE_BLOCKS: BlockType[] = [
  "greeting",
  "empathy",
  "mention",
  "menu_detail",
  "response",
  "invitation",
  "closing",
];

/** 부정 리뷰 (1~2점) 블록 순서 */
export const NEGATIVE_BLOCKS: BlockType[] = [
  "greeting",
  "empathy",
  "mention",
  "response",
  "invitation",
  "closing",
];

/** 보통 리뷰 (3점) 블록 순서 */
export const NEUTRAL_BLOCKS: BlockType[] = [
  "greeting",
  "empathy",
  "mention",
  "menu_detail",
  "response",
  "invitation",
  "closing",
];

export function getBlockOrder(rating: number): BlockType[] {
  if (rating >= 4) return POSITIVE_BLOCKS;
  if (rating <= 2) return NEGATIVE_BLOCKS;
  return NEUTRAL_BLOCKS;
}

/** 톤 조절 옵션 (블록별) */
export const TONE_ADJUSTMENTS = [
  { key: "polite", label: "더 정중하게" },
  { key: "short", label: "더 짧게" },
  { key: "longer", label: "더 길게" },
  { key: "apology", label: "사과 톤 추가" },
  { key: "humor", label: "유머 추가" },
  { key: "warm", label: "더 따뜻하게" },
] as const;

export type ToneAdjustment = (typeof TONE_ADJUSTMENTS)[number]["key"];

/** 톤 프리셋 */
export const TONE_PRESETS = [
  { key: "friendly", label: "친근한 동네 사장님", emoji: "😊", example: "감사해요~ 또 놀러오세요 ㅎㅎ" },
  { key: "formal", label: "정중한 전문점", emoji: "🤝", example: "소중한 후기 감사드립니다." },
  { key: "humorous", label: "유머러스한", emoji: "😄", example: "리뷰 읽고 직원들이랑 같이 웃었어요 ㅋㅋ" },
  { key: "custom", label: "커스텀", emoji: "✍️", example: "직접 톤 설명 입력" },
] as const;

export type TonePreset = (typeof TONE_PRESETS)[number]["key"];

/** 플랫폼 목록 */
export const PLATFORMS = ["배민", "쿠팡이츠", "네이버", "요기요", "기타"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** 블록 배열 → 포맷된 전체 텍스트 (줄바꿈 포함) */
export function blocksToFullText(blocks: ReplyBlock[]): string {
  return blocks.map((b) => b.text).join("\n\n");
}

/** 고유 ID 생성 */
export function genBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
