/**
 * 리뷰 답글 블록 타입 정의
 * [인사] + [리뷰 언급] + [감사/해명] + [마무리]
 */

export type BlockType = "greeting" | "mention" | "response" | "closing";

export interface ReplyBlock {
  id: string;
  type: BlockType;
  label: string;
  text: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  greeting: "인사",
  mention: "리뷰 언급",
  response: "감사/해명",
  closing: "마무리",
};

export const BLOCK_ORDER: BlockType[] = [
  "greeting",
  "mention",
  "response",
  "closing",
];

/** 톤 조절 옵션 (블록별) */
export const TONE_ADJUSTMENTS = [
  { key: "polite", label: "더 정중하게" },
  { key: "short", label: "더 짧게" },
  { key: "apology", label: "사과 톤 추가" },
  { key: "humor", label: "유머 추가" },
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

/** 블록 배열 → 전체 텍스트 */
export function blocksToFullText(blocks: ReplyBlock[]): string {
  return blocks.map((b) => b.text).join("\n");
}

/** 고유 ID 생성 */
export function genBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
