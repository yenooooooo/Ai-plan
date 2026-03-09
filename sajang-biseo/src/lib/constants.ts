/**
 * 앱 전역 상수
 */

/** 앱 이름 */
export const APP_NAME = "사장님비서";

/** 앱 설명 */
export const APP_DESCRIPTION =
  "매일 밤 1시간 걸리던 마감 업무를 5분으로 줄여주는 AI 매장 운영 비서";

/** 하단 네비게이션 탭 */
export const NAV_TABS = [
  { key: "home", label: "홈", icon: "Home", href: "/" },
  { key: "closing", label: "마감", icon: "BarChart3", href: "/closing" },
  { key: "order", label: "발주", icon: "Package", href: "/order" },
  { key: "receipt", label: "장부", icon: "Receipt", href: "/receipt" },
  { key: "review", label: "리뷰", icon: "MessageSquare", href: "/review" },
] as const;

/** 우측 상단 메뉴 */
export const HEADER_MENU = [
  { key: "briefing", label: "브리핑", icon: "TrendingUp", href: "/briefing" },
  { key: "fees", label: "수수료", icon: "CircleDollarSign", href: "/fees" },
  { key: "settings", label: "설정", icon: "Settings", href: "/settings" },
] as const;

/** 업종 목록 */
export const BUSINESS_TYPES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "카페",
  "분식",
  "치킨",
  "피자",
  "베이커리",
  "주점",
] as const;

/** 매출 채널 */
export const SALES_CHANNELS = [
  "홀",
  "배민",
  "쿠팡이츠",
  "요기요",
  "포장",
  "네이버주문",
  "땡겨요",
] as const;

/** 결제수단 */
export const PAYMENT_METHODS = ["카드", "현금", "이체"] as const;

/** 경비 카테고리 */
export const EXPENSE_CATEGORIES = [
  { code: "F01", label: "식재료비", icon: "🥩", taxItem: "매입비용" },
  { code: "F02", label: "소모품비", icon: "📦", taxItem: "소모품비" },
  { code: "F03", label: "수선유지비", icon: "🔧", taxItem: "수선비" },
  { code: "F04", label: "차량유지비", icon: "⛽", taxItem: "차량유지비" },
  { code: "F05", label: "접대비", icon: "🍽️", taxItem: "접대비" },
  { code: "F06", label: "통신비", icon: "📱", taxItem: "통신비" },
  { code: "F07", label: "광고선전비", icon: "📢", taxItem: "광고선전비" },
  { code: "F08", label: "보험료", icon: "🛡️", taxItem: "보험료" },
  { code: "F09", label: "임차료", icon: "🏠", taxItem: "임차료" },
  { code: "F10", label: "인건비", icon: "👤", taxItem: "인건비" },
  { code: "F99", label: "기타", icon: "📋", taxItem: "기타경비" },
] as const;

/** 식자재 카테고리 */
export const INGREDIENT_CATEGORIES = [
  "채소류",
  "육류",
  "수산류",
  "양념·소스",
  "음료·주류",
  "유제품",
  "냉동식품",
  "소모품",
] as const;
