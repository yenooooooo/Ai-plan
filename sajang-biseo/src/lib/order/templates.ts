/**
 * 업종별 기본 식자재 템플릿
 * 초기 세팅 시 업종 선택하면 자동 로드
 */

export interface TemplateItem {
  name: string;
  unit: string;
  unitPrice: number;
  defaultOrderQty: number;
  shelfLifeDays: number | null;
  group: string;
}

export interface TemplateGroup {
  groupName: string;
  icon: string;
  items: TemplateItem[];
}

/** 카테고리 아이콘 매핑 */
export const GROUP_ICONS: Record<string, string> = {
  "채소류": "🥬",
  "육류": "🥩",
  "수산류": "🐟",
  "양념·소스": "🧴",
  "음료·주류": "🍺",
  "유제품": "🥛",
  "냉동식품": "🧊",
  "소모품": "📦",
  "곡류·면류": "🍚",
  "과일류": "🍎",
  "빵·디저트": "🍞",
  "원두·차": "☕",
};

/** 기본 그룹 (모든 업종 공통) */
const BASE_GROUPS: TemplateGroup[] = [
  {
    groupName: "채소류",
    icon: "🥬",
    items: [
      { name: "양파", unit: "망(15kg)", unitPrice: 12000, defaultOrderQty: 1, shelfLifeDays: 30, group: "채소류" },
      { name: "대파", unit: "단", unitPrice: 3500, defaultOrderQty: 3, shelfLifeDays: 7, group: "채소류" },
      { name: "마늘", unit: "kg", unitPrice: 8000, defaultOrderQty: 2, shelfLifeDays: 14, group: "채소류" },
      { name: "당근", unit: "kg", unitPrice: 3000, defaultOrderQty: 3, shelfLifeDays: 14, group: "채소류" },
      { name: "감자", unit: "kg", unitPrice: 3500, defaultOrderQty: 5, shelfLifeDays: 21, group: "채소류" },
    ],
  },
  {
    groupName: "양념·소스",
    icon: "🧴",
    items: [
      { name: "간장", unit: "병(1.8L)", unitPrice: 5000, defaultOrderQty: 1, shelfLifeDays: null, group: "양념·소스" },
      { name: "고추장", unit: "kg", unitPrice: 8000, defaultOrderQty: 1, shelfLifeDays: null, group: "양념·소스" },
      { name: "된장", unit: "kg", unitPrice: 7000, defaultOrderQty: 1, shelfLifeDays: null, group: "양념·소스" },
      { name: "식용유", unit: "병(1.8L)", unitPrice: 4500, defaultOrderQty: 2, shelfLifeDays: null, group: "양념·소스" },
      { name: "참기름", unit: "병(500ml)", unitPrice: 12000, defaultOrderQty: 1, shelfLifeDays: null, group: "양념·소스" },
    ],
  },
  {
    groupName: "소모품",
    icon: "📦",
    items: [
      { name: "포장용기", unit: "팩(50개)", unitPrice: 8000, defaultOrderQty: 2, shelfLifeDays: null, group: "소모품" },
      { name: "비닐봉투", unit: "팩(100개)", unitPrice: 5000, defaultOrderQty: 1, shelfLifeDays: null, group: "소모품" },
      { name: "위생장갑", unit: "팩(100개)", unitPrice: 3000, defaultOrderQty: 1, shelfLifeDays: null, group: "소모품" },
    ],
  },
];

/** 업종별 추가 그룹 */
const KOREAN: TemplateGroup[] = [
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "삼겹살", unit: "kg", unitPrice: 15000, defaultOrderQty: 5, shelfLifeDays: 3, group: "육류" },
      { name: "목살", unit: "kg", unitPrice: 14000, defaultOrderQty: 3, shelfLifeDays: 3, group: "육류" },
      { name: "소고기(국거리)", unit: "kg", unitPrice: 28000, defaultOrderQty: 2, shelfLifeDays: 2, group: "육류" },
      { name: "닭고기", unit: "kg", unitPrice: 6000, defaultOrderQty: 3, shelfLifeDays: 2, group: "육류" },
    ],
  },
  {
    groupName: "수산류",
    icon: "🐟",
    items: [
      { name: "고등어", unit: "마리", unitPrice: 4000, defaultOrderQty: 10, shelfLifeDays: 1, group: "수산류" },
      { name: "오징어", unit: "마리", unitPrice: 5000, defaultOrderQty: 5, shelfLifeDays: 1, group: "수산류" },
      { name: "새우", unit: "kg", unitPrice: 18000, defaultOrderQty: 2, shelfLifeDays: 1, group: "수산류" },
    ],
  },
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "쌀", unit: "kg", unitPrice: 3000, defaultOrderQty: 20, shelfLifeDays: null, group: "곡류·면류" },
      { name: "라면사리", unit: "팩(10개)", unitPrice: 6000, defaultOrderQty: 3, shelfLifeDays: null, group: "곡류·면류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "소주", unit: "박스(20병)", unitPrice: 25000, defaultOrderQty: 2, shelfLifeDays: null, group: "음료·주류" },
      { name: "맥주", unit: "박스(20병)", unitPrice: 30000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const CHINESE: TemplateGroup[] = [
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "돼지고기(다짐)", unit: "kg", unitPrice: 10000, defaultOrderQty: 5, shelfLifeDays: 2, group: "육류" },
      { name: "새우", unit: "kg", unitPrice: 18000, defaultOrderQty: 3, shelfLifeDays: 1, group: "육류" },
      { name: "오징어", unit: "kg", unitPrice: 12000, defaultOrderQty: 2, shelfLifeDays: 1, group: "육류" },
    ],
  },
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "중화면", unit: "kg", unitPrice: 3000, defaultOrderQty: 10, shelfLifeDays: 3, group: "곡류·면류" },
      { name: "쌀", unit: "kg", unitPrice: 3000, defaultOrderQty: 20, shelfLifeDays: null, group: "곡류·면류" },
      { name: "만두피", unit: "팩", unitPrice: 5000, defaultOrderQty: 5, shelfLifeDays: 5, group: "곡류·면류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const JAPANESE: TemplateGroup[] = [
  {
    groupName: "수산류",
    icon: "🐟",
    items: [
      { name: "연어(필렛)", unit: "kg", unitPrice: 35000, defaultOrderQty: 3, shelfLifeDays: 1, group: "수산류" },
      { name: "참치(사시미)", unit: "kg", unitPrice: 45000, defaultOrderQty: 2, shelfLifeDays: 1, group: "수산류" },
      { name: "새우", unit: "kg", unitPrice: 18000, defaultOrderQty: 2, shelfLifeDays: 1, group: "수산류" },
      { name: "문어", unit: "kg", unitPrice: 25000, defaultOrderQty: 1, shelfLifeDays: 1, group: "수산류" },
    ],
  },
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "초밥용 쌀", unit: "kg", unitPrice: 4000, defaultOrderQty: 10, shelfLifeDays: null, group: "곡류·면류" },
      { name: "우동면", unit: "팩(10인분)", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 5, group: "곡류·면류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "사케", unit: "병(720ml)", unitPrice: 15000, defaultOrderQty: 3, shelfLifeDays: null, group: "음료·주류" },
      { name: "맥주", unit: "박스(20병)", unitPrice: 30000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const WESTERN: TemplateGroup[] = [
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "안심(스테이크)", unit: "kg", unitPrice: 45000, defaultOrderQty: 3, shelfLifeDays: 2, group: "육류" },
      { name: "닭가슴살", unit: "kg", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 2, group: "육류" },
      { name: "베이컨", unit: "kg", unitPrice: 18000, defaultOrderQty: 2, shelfLifeDays: 7, group: "육류" },
    ],
  },
  {
    groupName: "유제품",
    icon: "🥛",
    items: [
      { name: "모짜렐라치즈", unit: "kg", unitPrice: 15000, defaultOrderQty: 2, shelfLifeDays: 14, group: "유제품" },
      { name: "버터", unit: "kg", unitPrice: 12000, defaultOrderQty: 1, shelfLifeDays: 30, group: "유제품" },
      { name: "생크림", unit: "L", unitPrice: 8000, defaultOrderQty: 2, shelfLifeDays: 7, group: "유제품" },
    ],
  },
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "파스타면", unit: "kg", unitPrice: 5000, defaultOrderQty: 5, shelfLifeDays: null, group: "곡류·면류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "와인(하우스)", unit: "병", unitPrice: 15000, defaultOrderQty: 3, shelfLifeDays: null, group: "음료·주류" },
      { name: "맥주", unit: "박스(20병)", unitPrice: 30000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const CAFE: TemplateGroup[] = [
  {
    groupName: "원두·차",
    icon: "☕",
    items: [
      { name: "원두(블렌드)", unit: "kg", unitPrice: 25000, defaultOrderQty: 5, shelfLifeDays: 30, group: "원두·차" },
      { name: "원두(싱글)", unit: "kg", unitPrice: 35000, defaultOrderQty: 2, shelfLifeDays: 30, group: "원두·차" },
      { name: "녹차 파우더", unit: "kg", unitPrice: 30000, defaultOrderQty: 1, shelfLifeDays: null, group: "원두·차" },
    ],
  },
  {
    groupName: "유제품",
    icon: "🥛",
    items: [
      { name: "우유", unit: "팩(1L)", unitPrice: 2800, defaultOrderQty: 10, shelfLifeDays: 7, group: "유제품" },
      { name: "생크림", unit: "L", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 7, group: "유제품" },
      { name: "오트밀크", unit: "팩(1L)", unitPrice: 4500, defaultOrderQty: 5, shelfLifeDays: 14, group: "유제품" },
    ],
  },
  {
    groupName: "빵·디저트",
    icon: "🍞",
    items: [
      { name: "크루아상", unit: "개", unitPrice: 1500, defaultOrderQty: 20, shelfLifeDays: 1, group: "빵·디저트" },
      { name: "케이크시트", unit: "개", unitPrice: 5000, defaultOrderQty: 3, shelfLifeDays: 2, group: "빵·디저트" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "시럽(바닐라)", unit: "병(750ml)", unitPrice: 12000, defaultOrderQty: 2, shelfLifeDays: null, group: "음료·주류" },
      { name: "시럽(카라멜)", unit: "병(750ml)", unitPrice: 12000, defaultOrderQty: 2, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const CHICKEN: TemplateGroup[] = [
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "생닭(10호)", unit: "마리", unitPrice: 5500, defaultOrderQty: 30, shelfLifeDays: 2, group: "육류" },
      { name: "닭윙", unit: "kg", unitPrice: 7000, defaultOrderQty: 5, shelfLifeDays: 2, group: "육류" },
      { name: "닭다리", unit: "kg", unitPrice: 6500, defaultOrderQty: 5, shelfLifeDays: 2, group: "육류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "맥주", unit: "박스(20병)", unitPrice: 30000, defaultOrderQty: 3, shelfLifeDays: null, group: "음료·주류" },
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 2, shelfLifeDays: null, group: "음료·주류" },
      { name: "사이다", unit: "박스(24캔)", unitPrice: 14000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
  {
    groupName: "냉동식품",
    icon: "🧊",
    items: [
      { name: "감자튀김", unit: "kg", unitPrice: 5000, defaultOrderQty: 5, shelfLifeDays: 90, group: "냉동식품" },
      { name: "치즈스틱", unit: "팩(20개)", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 90, group: "냉동식품" },
    ],
  },
];

const PIZZA: TemplateGroup[] = [
  {
    groupName: "유제품",
    icon: "🥛",
    items: [
      { name: "모짜렐라치즈", unit: "kg", unitPrice: 15000, defaultOrderQty: 10, shelfLifeDays: 14, group: "유제품" },
      { name: "체다치즈", unit: "kg", unitPrice: 12000, defaultOrderQty: 3, shelfLifeDays: 14, group: "유제품" },
    ],
  },
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "페퍼로니", unit: "kg", unitPrice: 12000, defaultOrderQty: 3, shelfLifeDays: 14, group: "육류" },
      { name: "베이컨", unit: "kg", unitPrice: 18000, defaultOrderQty: 2, shelfLifeDays: 7, group: "육류" },
      { name: "불고기", unit: "kg", unitPrice: 16000, defaultOrderQty: 3, shelfLifeDays: 2, group: "육류" },
    ],
  },
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "피자도우", unit: "개", unitPrice: 2000, defaultOrderQty: 30, shelfLifeDays: 3, group: "곡류·면류" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 2, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const BUNSIK: TemplateGroup[] = [
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "밀가루", unit: "kg", unitPrice: 2000, defaultOrderQty: 10, shelfLifeDays: null, group: "곡류·면류" },
      { name: "떡볶이떡", unit: "kg", unitPrice: 5000, defaultOrderQty: 10, shelfLifeDays: 5, group: "곡류·면류" },
      { name: "라면사리", unit: "팩(10개)", unitPrice: 6000, defaultOrderQty: 5, shelfLifeDays: null, group: "곡류·면류" },
    ],
  },
  {
    groupName: "냉동식품",
    icon: "🧊",
    items: [
      { name: "어묵", unit: "kg", unitPrice: 6000, defaultOrderQty: 5, shelfLifeDays: 14, group: "냉동식품" },
      { name: "만두", unit: "팩(50개)", unitPrice: 12000, defaultOrderQty: 3, shelfLifeDays: 90, group: "냉동식품" },
      { name: "김밥용 햄", unit: "kg", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 14, group: "냉동식품" },
    ],
  },
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
];

const BAKERY: TemplateGroup[] = [
  {
    groupName: "곡류·면류",
    icon: "🍚",
    items: [
      { name: "강력분", unit: "kg", unitPrice: 2500, defaultOrderQty: 25, shelfLifeDays: null, group: "곡류·면류" },
      { name: "박력분", unit: "kg", unitPrice: 2000, defaultOrderQty: 10, shelfLifeDays: null, group: "곡류·면류" },
    ],
  },
  {
    groupName: "유제품",
    icon: "🥛",
    items: [
      { name: "버터", unit: "kg", unitPrice: 12000, defaultOrderQty: 5, shelfLifeDays: 30, group: "유제품" },
      { name: "생크림", unit: "L", unitPrice: 8000, defaultOrderQty: 5, shelfLifeDays: 7, group: "유제품" },
      { name: "계란", unit: "판(30개)", unitPrice: 7000, defaultOrderQty: 3, shelfLifeDays: 14, group: "유제품" },
      { name: "우유", unit: "팩(1L)", unitPrice: 2800, defaultOrderQty: 5, shelfLifeDays: 7, group: "유제품" },
    ],
  },
  {
    groupName: "빵·디저트",
    icon: "🍞",
    items: [
      { name: "초콜릿(커버처)", unit: "kg", unitPrice: 25000, defaultOrderQty: 2, shelfLifeDays: null, group: "빵·디저트" },
      { name: "이스트", unit: "팩(500g)", unitPrice: 5000, defaultOrderQty: 2, shelfLifeDays: 30, group: "빵·디저트" },
    ],
  },
];

const BAR: TemplateGroup[] = [
  {
    groupName: "음료·주류",
    icon: "🍺",
    items: [
      { name: "소주", unit: "박스(20병)", unitPrice: 25000, defaultOrderQty: 5, shelfLifeDays: null, group: "음료·주류" },
      { name: "맥주", unit: "박스(20병)", unitPrice: 30000, defaultOrderQty: 3, shelfLifeDays: null, group: "음료·주류" },
      { name: "막걸리", unit: "병(750ml)", unitPrice: 3000, defaultOrderQty: 10, shelfLifeDays: 14, group: "음료·주류" },
      { name: "콜라", unit: "박스(24캔)", unitPrice: 15000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
      { name: "사이다", unit: "박스(24캔)", unitPrice: 14000, defaultOrderQty: 1, shelfLifeDays: null, group: "음료·주류" },
    ],
  },
  {
    groupName: "육류",
    icon: "🥩",
    items: [
      { name: "삼겹살", unit: "kg", unitPrice: 15000, defaultOrderQty: 5, shelfLifeDays: 3, group: "육류" },
      { name: "닭발", unit: "kg", unitPrice: 8000, defaultOrderQty: 3, shelfLifeDays: 2, group: "육류" },
    ],
  },
  {
    groupName: "냉동식품",
    icon: "🧊",
    items: [
      { name: "감자튀김", unit: "kg", unitPrice: 5000, defaultOrderQty: 3, shelfLifeDays: 90, group: "냉동식품" },
      { name: "소세지", unit: "kg", unitPrice: 9000, defaultOrderQty: 2, shelfLifeDays: 30, group: "냉동식품" },
    ],
  },
];

/** 업종 → 템플릿 매핑 */
const BUSINESS_TEMPLATES: Record<string, TemplateGroup[]> = {
  "한식": KOREAN,
  "중식": CHINESE,
  "일식": JAPANESE,
  "양식": WESTERN,
  "카페": CAFE,
  "분식": BUNSIK,
  "치킨": CHICKEN,
  "피자": PIZZA,
  "베이커리": BAKERY,
  "주점": BAR,
};

/**
 * 업종에 맞는 전체 템플릿 반환 (기본 그룹 + 업종별 그룹)
 */
export function getTemplateForBusiness(businessType: string): TemplateGroup[] {
  const specific = BUSINESS_TEMPLATES[businessType] ?? KOREAN;
  // 기본 그룹(채소, 양념, 소모품) + 업종 특화 그룹 합치되, 중복 그룹 제거
  const specificGroupNames = new Set(specific.map((g) => g.groupName));
  const baseFiltered = BASE_GROUPS.filter((g) => !specificGroupNames.has(g.groupName));
  return [...specific, ...baseFiltered];
}

/** 단위 목록 */
export const UNITS = [
  "kg", "g", "L", "ml", "개", "팩", "박스", "망", "판", "병", "포",
  "마리", "단", "봉", "캔", "팩(1L)", "박스(20병)", "박스(24캔)",
] as const;
