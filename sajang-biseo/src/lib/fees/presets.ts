/**
 * 플랫폼별 기본 수수료율 프리셋
 * CLAUDE_GUIDELINES.md 7.3 기준 (2025년, 사장님이 수정 가능)
 */

export interface FeePreset {
  /** 수수료 항목 이름 */
  name: string;
  /** 유형: percentage(비율) / fixed(건당 고정) */
  type: "percentage" | "fixed";
  /** 비율(%) 또는 건당 금액(원) */
  rate?: number;
  amount?: number;
  /** 카테고리: delivery(배달앱) / card(카드) / delivery_agency(배달대행) / other(기타) */
  category: "delivery" | "card" | "delivery_agency" | "other";
}

export const FEE_PRESETS: Record<string, FeePreset> = {
  배민_중개: {
    name: "배민 중개",
    type: "percentage",
    rate: 6.8,
    category: "delivery",
  },
  배민_배달: {
    name: "배민 배달",
    type: "percentage",
    rate: 12.5,
    category: "delivery",
  },
  쿠팡이츠: {
    name: "쿠팡이츠",
    type: "percentage",
    rate: 9.8,
    category: "delivery",
  },
  요기요: {
    name: "요기요",
    type: "percentage",
    rate: 12.5,
    category: "delivery",
  },
  땡겨요: {
    name: "땡겨요",
    type: "percentage",
    rate: 2.0,
    category: "delivery",
  },
  카드_영세: {
    name: "카드 (영세: 3억 이하)",
    type: "percentage",
    rate: 0.5,
    category: "card",
  },
  카드_중소_3억이하: {
    name: "카드 (중소: ~3억)",
    type: "percentage",
    rate: 0.8,
    category: "card",
  },
  카드_중소_5억이하: {
    name: "카드 (중소: ~5억)",
    type: "percentage",
    rate: 1.3,
    category: "card",
  },
  카드_일반: {
    name: "카드 (일반)",
    type: "percentage",
    rate: 1.5,
    category: "card",
  },
  배달대행_기본: {
    name: "배달대행",
    type: "fixed",
    amount: 3300,
    category: "delivery_agency",
  },
};

/** 연매출 구간별 카드 수수료 */
export const CARD_FEE_TIERS = [
  { label: "3억 이하 (영세)", rate: 0.5, checkRate: 0.25 },
  { label: "3~5억 (중소)", rate: 1.3, checkRate: 0.8 },
  { label: "5~10억", rate: 1.4, checkRate: 1.0 },
  { label: "10억 이상 (일반)", rate: 1.5, checkRate: 1.0 },
] as const;
