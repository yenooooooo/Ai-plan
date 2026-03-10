import {
  BarChart3, Package, Receipt, MessageSquare, TrendingUp,
  Clock, Zap, Shield,
} from "lucide-react";

export const FEATURES = [
  {
    icon: BarChart3,
    title: "마감 리포트",
    description: "30초 매출 입력으로 자동 분석 리포트. 채널별 수수료까지 실시간 계산.",
    gradient: "from-blue-500/20 to-cyan-500/10",
    color: "text-blue-400",
    stat: "30초",
    statLabel: "마감 입력",
  },
  {
    icon: Package,
    title: "AI 발주 추천",
    description: "매출과 날씨 기반 식자재 사용량 예측. 폐기 줄이고, 품절 막기.",
    gradient: "from-emerald-500/20 to-green-500/10",
    color: "text-emerald-400",
    stat: "87%",
    statLabel: "적중률",
  },
  {
    icon: Receipt,
    title: "영수증 AI 장부",
    description: "영수증 찍으면 AI가 자동 인식. 카테고리 분류부터 세무 자료까지.",
    gradient: "from-amber-500/20 to-orange-500/10",
    color: "text-amber-400",
    stat: "90%+",
    statLabel: "인식 정확도",
  },
  {
    icon: MessageSquare,
    title: "리뷰 답글 생성",
    description: "사장님 말투로 자연스러운 답글. 블록 편집으로 완벽한 커스텀.",
    gradient: "from-rose-500/20 to-pink-500/10",
    color: "text-rose-400",
    stat: "3초",
    statLabel: "답글 생성",
  },
  {
    icon: TrendingUp,
    title: "주간 경영 브리핑",
    description: "6개 카드로 지난주를 한눈에. AI 코칭으로 다음 주 전략까지.",
    gradient: "from-amber-500/20 to-orange-500/10",
    color: "text-amber-400",
    stat: "3분",
    statLabel: "주간 파악",
  },
];

export const TESTIMONIALS = [
  {
    name: "김사장님",
    business: "한식당 / 서울 마포",
    content: "매일 밤 1시간 걸리던 정산이 진짜 5분이면 끝나요. 수수료도 자동 계산되니까 너무 편해요. 직원한테 맡겨도 이제 안 틀려요.",
    rating: 5,
    highlight: "정산 시간 90% 단축",
  },
  {
    name: "박사장님",
    business: "치킨집 / 경기 수원",
    content: "발주 추천 덕분에 폐기가 확 줄었어요. 대파만 해도 월 6만원은 아끼는 것 같아요.",
    rating: 5,
    highlight: "월 6만원 식자재 절감",
  },
  {
    name: "이사장님",
    business: "카페 / 부산 해운대",
    content: "리뷰 답글 기능이 정말 좋아요. 제 말투 그대로 나와서 손님들이 자연스럽다고 해요.",
    rating: 5,
    highlight: "리뷰 응대 3초",
  },
  {
    name: "최사장님",
    business: "분식집 / 대구 중구",
    content: "엑셀 정리 안 해도 주간 브리핑이 알아서 나오니까 경영 상태를 한눈에 파악할 수 있어요.",
    rating: 5,
    highlight: "주간 분석 자동화",
  },
  {
    name: "정사장님",
    business: "삼겹살집 / 인천 부평",
    content: "수수료가 얼마나 나가는지 몰랐는데, 채널별로 딱 보여주니까 배달앱 전략을 바꿨어요.",
    rating: 5,
    highlight: "수수료 투명화",
  },
  {
    name: "한사장님",
    business: "일식당 / 서울 강남",
    content: "영수증 사진 찍으면 바로 장부에 들어가니까 세무사한테 자료 넘기기가 너무 편해졌어요.",
    rating: 4,
    highlight: "경비 관리 자동화",
  },
  {
    name: "윤사장님",
    business: "베이커리 / 경기 성남",
    content: "2호점 오픈하면서 Pro+ 쓰기 시작했는데, 매장 비교가 한눈에 돼서 진작 쓸걸 그랬어요.",
    rating: 5,
    highlight: "다매장 통합 관리",
  },
];

export const PLANS = [
  {
    name: "무료",
    price: "₩0",
    period: "영원히 무료",
    features: [
      "마감 리포트 (기본)",
      "수수료 계산기",
      "주간 브리핑 열람",
      "영수증 AI 인식 (월 5장)",
      "리뷰 답글 생성 (월 3건)",
      "최대 1개 매장",
    ],
    cta: "무료로 시작",
    popular: false,
  },
  {
    name: "Pro",
    price: "₩9,900",
    period: "/ 월",
    desc: "1인 사장님 필수 도구",
    features: [
      "무료 기능 전체 포함",
      "AI 발주 추천",
      "영수증 AI 인식 (월 100장)",
      "리뷰 답글 생성 (월 50건)",
      "AI 경영 코칭",
      "CSV/PDF 다운로드",
      "최대 3개 매장",
    ],
    cta: "Pro 시작하기",
    popular: true,
  },
  {
    name: "Pro+",
    price: "₩24,900",
    period: "/ 월",
    desc: "다매장 사장님 프리미엄",
    features: [
      "Pro 기능 전체 포함",
      "영수증/리뷰 무제한",
      "다매장 통합 대시보드",
      "매출 예측/트렌드 분석",
      "주간 이메일 브리핑",
      "직원 계정 (매장당 3명)",
      "우선 고객 지원",
      "매장 수 무제한",
    ],
    cta: "Pro+ 시작하기",
    popular: false,
  },
];

export const BENEFITS = [
  { icon: Clock, label: "하루 1시간 절약", desc: "수기 정산 → 자동화" },
  { icon: Zap, label: "수수료 투명 관리", desc: "채널별 실시간 계산" },
  { icon: Shield, label: "데이터 기반 의사결정", desc: "AI 분석 & 코칭" },
];

export const IMPACT_STATS = [
  { value: 5, suffix: "가지", label: "핵심 기능 올인원" },
  { value: 30, suffix: "초", label: "마감 입력 완료" },
  { value: 55, suffix: "분+", label: "하루 절약 시간" },
  { value: 100, suffix: "%", label: "수수료 투명화" },
];

export const FAQ_ITEMS = [
  {
    q: "데이터는 안전한가요?",
    a: "네, 모든 데이터는 SSL 암호화로 전송되며 클라우드에 안전하게 저장됩니다. 개인정보는 철저히 보호됩니다.",
  },
  {
    q: "배민/쿠팡이츠와 자동 연동되나요?",
    a: "현재는 매출 금액과 채널 비율을 입력하면 수수료가 자동 계산됩니다. 향후 POS 연동을 준비 중입니다.",
  },
  {
    q: "무료 플랜으로도 충분한가요?",
    a: "매일 마감 정산과 수수료 계산은 무료로 무제한 사용 가능합니다. AI 기능이 더 필요하시면 Pro 플랜을 추천드려요.",
  },
  {
    q: "언제든 해지할 수 있나요?",
    a: "네, 언제든 무료 플랜으로 전환 가능하며 별도의 해지 절차가 없습니다. 입력한 데이터는 그대로 유지됩니다.",
  },
  {
    q: "여러 매장도 관리할 수 있나요?",
    a: "Pro 플랜은 최대 3개, Pro+ 플랜은 매장 수 무제한입니다. 다매장 통합 대시보드로 한눈에 비교할 수 있어요.",
  },
  {
    q: "PC에서도 사용할 수 있나요?",
    a: "네, 모바일과 PC 모두 지원합니다. 앱 설치 없이 브라우저에서 바로 사용할 수 있어요.",
  },
];
