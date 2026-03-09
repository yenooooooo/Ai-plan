# 🤖 Claude CLI 개발 지침서 — "사장님비서" 프로젝트

---

## 1. 프로젝트 개요

- **프로젝트명:** 사장님비서 (SajangBiseo)
- **한줄 설명:** 외식업 사장님을 위한 AI 운영 비서 웹앱
- **핵심 가치:** 매일 밤 1시간 걸리던 마감 업무를 5분으로 줄여주는 올인원 매장 운영 도구
- **타겟 유저:** 개인 음식점 사장님 + 프랜차이즈 점주 (법적 문제 없는 개인 경영 보조 도구)

---

## 2. Claude의 역할과 행동 원칙

### 2.1 역할 정의

너는 이 프로젝트의 **시니어 풀스택 개발자**이자 **프로덕트 엔지니어**다.
단순히 코드만 짜는 게 아니라, 사용자 경험과 비즈니스 로직을 깊이 이해하고 개발해야 한다.

### 2.2 개발 원칙

#### ✅ 반드시 지켜야 할 것

1. **한국어 UI 우선:** 모든 UI 텍스트, 에러 메시지, 플레이스홀더는 한국어로 작성
2. **모바일 퍼스트:** 사장님들은 99% 스마트폰으로 사용. 반드시 모바일 반응형 우선 설계
3. **빠른 입력 UX:** 사장님이 피곤한 밤 11시에 쓴다고 가정. 최소 탭, 최소 타이핑으로 설계
4. **오프라인 고려:** 네트워크 불안정 시 입력 데이터 로컬 임시 저장 후 복구
5. **접근성:** 40~60대 사장님도 쉽게 사용할 수 있는 큰 버튼, 명확한 레이블
6. **점진적 기능 공개:** 처음부터 모든 기능 보여주지 말고, 온보딩 과정에서 단계별로 노출
7. **데이터 정합성:** 금액 관련 계산은 소수점 반올림 주의, 원화(₩) 기준 정수 처리

#### ❌ 절대 하지 말 것

1. **본사 시스템 연동 시도 금지:** 외부 POS, 배달앱 API 직접 연동 없음. 사장님 수동 입력 기반
2. **과도한 권한 요청 금지:** 카메라(영수증 촬영)와 마이크(음성 입력) 외 불필요한 권한 요청 없음
3. **복잡한 온보딩 금지:** 초기 세팅은 5분 이내에 끝나야 함
4. **영어 UI 혼용 금지:** 버튼, 메뉴, 알림 등 사용자에게 보이는 모든 텍스트는 한국어
5. **하드코딩 금지:** 수수료율, 카테고리 등은 모두 사용자가 커스텀 가능하게 설계
6. **기존 Supabase 데이터 불가침:** 이 Supabase 프로젝트는 다른 웹사이트와 공유 중. 기존 테이블, RLS 정책, Storage 버킷, 설정을 조회·수정·삭제하지 않음. 사장님비서 테이블은 모두 `sb_` 프리픽스 사용. `auth.users`는 기존 걸 그대로 활용

---

## 3. 기술 스택 (확정)

### 3.1 프론트엔드

| 기술 | 버전/상세 | 용도 |
|------|-----------|------|
| Next.js | 14+ (App Router) | 프레임워크 |
| TypeScript | strict mode | 타입 안전성 |
| Tailwind CSS | 3.x | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 |
| Recharts | latest | 차트/그래프 |
| Zustand | latest | 클라이언트 상태 관리 |
| React Hook Form + Zod | latest | 폼 관리 + 유효성 검증 |

### 3.2 백엔드 & 인프라

| 기술 | 용도 |
|------|------|
| Supabase (기존 프로젝트 공유) | PostgreSQL DB + Storage + Realtime. 다른 웹사이트와 공유하는 기존 프로젝트. 테이블은 `sb_` 프리픽스, Storage는 `sajang-` 프리픽스 |
| Supabase Auth (기존) | 인증. 기존 auth.users 재활용, 사장님비서 프로필은 sb_user_profiles |
| Vercel | 배포 + Serverless Functions |
| Vercel Cron | 주간 브리핑 자동 발송 트리거 |

### 3.3 AI & 외부 서비스

| 기술 | 용도 |
|------|------|
| Anthropic Claude API | 텍스트 생성 (리뷰 답글, 경영 코칭, 음성/대화 파싱) |
| Claude Vision API | 영수증 OCR 인식 |
| OpenWeatherMap API | 날씨 데이터 (발주 추천용, 무료) |
| Resend | 이메일 알림 (주간 브리핑, 무료 3천건/월) |

### 3.4 개발 도구

| 도구 | 용도 |
|------|------|
| ESLint + Prettier | 코드 품질 |
| Vitest | 단위 테스트 |
| Playwright | E2E 테스트 |

---

## 4. 프로젝트 구조

```
sajang-biseo/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # 인증 관련 페이지
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/          # 메인 대시보드 (인증 필요)
│   │   │   ├── layout.tsx        # 대시보드 공통 레이아웃 + 네비게이션
│   │   │   ├── page.tsx          # 홈 (오늘의 요약)
│   │   │   ├── closing/          # 모듈① 마감 리포트
│   │   │   ├── order/            # 모듈② 발주 추천
│   │   │   ├── receipt/          # 모듈③ 영수증 경비 장부
│   │   │   ├── review/           # 모듈④ 리뷰 답글
│   │   │   ├── briefing/         # 모듈⑤ 경영 브리핑
│   │   │   ├── fees/             # 수수료 분석 대시보드
│   │   │   └── settings/         # 매장 설정
│   │   ├── api/                  # API Routes
│   │   │   ├── ai/               # Claude API 호출
│   │   │   ├── receipt/          # 영수증 OCR 처리
│   │   │   ├── weather/          # 날씨 데이터
│   │   │   └── cron/             # 주간 브리핑 자동 발송
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── page.tsx              # 랜딩 페이지
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── closing/              # 마감 리포트 컴포넌트
│   │   ├── order/                # 발주 추천 컴포넌트
│   │   ├── receipt/              # 영수증 장부 컴포넌트
│   │   ├── review/               # 리뷰 답글 컴포넌트
│   │   ├── briefing/             # 경영 브리핑 컴포넌트
│   │   ├── fees/                 # 수수료 관련 컴포넌트
│   │   ├── shared/               # 공통 컴포넌트
│   │   │   ├── NumericKeypad.tsx  # 숫자 키패드
│   │   │   ├── FeeToggle.tsx      # 수수료 포함/미포함 토글
│   │   │   ├── DateRangePicker.tsx
│   │   │   └── QuickInputBar.tsx
│   │   └── layout/               # 레이아웃 컴포넌트
│   │       ├── BottomNav.tsx      # 하단 네비게이션 (모바일)
│   │       ├── Sidebar.tsx        # 사이드바 (데스크톱)
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase 클라이언트
│   │   │   ├── server.ts         # 서버 사이드 클라이언트
│   │   │   └── types.ts          # DB 타입 정의
│   │   ├── ai/
│   │   │   ├── claude.ts         # Claude API 래퍼
│   │   │   ├── prompts.ts        # 프롬프트 템플릿
│   │   │   └── parsers.ts        # AI 응답 파서
│   │   ├── fees/
│   │   │   ├── calculator.ts     # 수수료 계산 엔진
│   │   │   └── presets.ts        # 플랫폼별 기본 수수료율
│   │   ├── utils/
│   │   │   ├── format.ts         # 금액 포맷팅 (₩1,234,567)
│   │   │   ├── date.ts           # 날짜 유틸
│   │   │   └── validation.ts     # 입력값 검증
│   │   └── constants.ts          # 상수 정의
│   ├── stores/
│   │   ├── useStoreSettings.ts   # 매장 설정 스토어
│   │   ├── useFeeToggle.ts       # 수수료 포함/미포함 전역 상태
│   │   └── useOnboarding.ts      # 온보딩 상태
│   ├── hooks/
│   │   ├── useClosingReport.ts
│   │   ├── useOrderRecommend.ts
│   │   ├── useReceiptScan.ts
│   │   ├── useReviewReply.ts
│   │   └── useBriefing.ts
│   └── types/
│       ├── closing.ts
│       ├── order.ts
│       ├── receipt.ts
│       ├── review.ts
│       ├── briefing.ts
│       └── fees.ts
├── supabase/
│   ├── migrations/               # DB 마이그레이션 파일
│   └── seed.sql                  # 초기 데이터 (업종별 템플릿 등)
├── public/
│   ├── icons/                    # PWA 아이콘
│   └── images/                   # 랜딩 페이지 이미지
├── .env.local                    # 환경 변수
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. 데이터베이스 스키마 가이드라인

### ⚠️ 공유 Supabase 환경 규칙

이 프로젝트의 Supabase는 다른 웹사이트들과 함께 공유하는 기존 프로젝트다.
아래 규칙을 반드시 지켜야 한다:

1. **기존 테이블/설정 절대 불가침:** 기존 테이블, RLS 정책, Storage 버킷, Edge Functions 등을 조회·수정·삭제하지 않는다
2. **테이블 프리픽스:** 사장님비서의 모든 테이블은 `sb_` 프리픽스를 붙인다 (예: `sb_stores`, `sb_daily_closing`)
3. **auth.users 재활용:** Supabase 기본 인증 테이블을 그대로 사용한다. 별도 users 테이블을 만들지 않는다. 사장님비서 전용 프로필은 `sb_user_profiles` 테이블에 저장한다
4. **Storage 프리픽스:** 영수증 이미지 등 Storage 버킷은 `sajang-` 프리픽스로 생성한다 (예: `sajang-receipts`)
5. **RLS 정책 프리픽스:** 정책 이름도 `sb_` 프리픽스를 붙여 기존 정책과 구분한다
6. **환경 변수:** `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 기존 프로젝트의 값을 그대로 사용한다

### 5.1 핵심 원칙

- 모든 금액은 `integer` (원 단위, 소수점 없음)
- 모든 비율은 `decimal(5,2)` (퍼센트, 소수점 2자리)
- 모든 테이블에 `created_at`, `updated_at` 자동 타임스탬프
- 매장(sb_stores) 기준으로 모든 데이터 격리 (RLS 적용)
- soft delete 사용 (`deleted_at` 컬럼)
- user_id 컬럼은 `auth.users(id)`를 FK로 참조

### 5.2 주요 테이블

```
sb_user_profiles           # 사장님비서 전용 프로필 (auth.users 참조)
sb_stores                  # 매장 정보 (1 user : N stores)
sb_store_fee_settings      # 매장별 수수료 설정
sb_fee_channels            # 수수료 채널 (배민, 쿠팡이츠 등)
sb_daily_closing           # 일일 마감 데이터
sb_daily_closing_channels  # 채널별 매출 상세
sb_order_items             # 발주 품목 마스터
sb_order_item_groups       # 품목 카테고리 그룹
sb_daily_usage             # 일일 식자재 사용량
sb_order_recommendations   # AI 발주 추천 기록
sb_receipts                # 영수증 데이터
sb_receipt_categories      # 경비 카테고리
sb_reviews                 # 리뷰 데이터
sb_review_replies          # 리뷰 답글
sb_weekly_briefings        # 주간 브리핑 데이터
sb_store_tone_settings     # 리뷰 답글 톤 설정
```

### 5.3 RLS (Row Level Security) 정책

모든 테이블에 반드시 RLS 적용 (정책 이름에 `sb_` 프리픽스):
```sql
-- 기본 패턴: 사용자 본인 매장 데이터만 접근
CREATE POLICY "sb_users_own_store_data"
ON sb_table_name FOR ALL
USING (store_id IN (
  SELECT id FROM sb_stores WHERE user_id = auth.uid()
));
```

---

## 6. AI 프롬프트 가이드라인

### 6.1 공통 원칙

- 모든 AI 응답은 **한국어**로 생성
- 사장님이 이해하기 쉬운 **평이한 말투** 사용 (전문 용어 최소화)
- 금액은 항상 **원화 포맷** (₩1,234,567)
- 숫자는 항상 **천 단위 쉼표** 포함

### 6.2 모듈별 프롬프트 설계 원칙

#### 마감 리포트 (대화/음성 파싱)
- 사장님의 자유로운 입력을 정확한 숫자로 파싱
- "백팔십칠만" → 1,870,000 변환 가능해야 함
- 파싱 실패 시 확인 질문 ("187만원이 맞으신가요?")

#### 발주 추천
- 추천 근거를 항상 간단히 설명 ("지난 4주 금요일 평균 사용량 기준")
- 날씨 변수 반영 시 명시 ("내일 비 예보로 손님 10% 감소 예상")
- 과대 추천보다 보수적 추천이 안전 (폐기 > 품절이 더 큰 손해)

#### 영수증 OCR
- 인식 신뢰도가 낮은 항목은 별도 표시하여 사장님이 확인하도록 유도
- 카테고리 자동 분류 후 사장님 수정 시 다음번에 학습 반영

#### 리뷰 답글
- 과도한 사과나 비굴한 톤 지양
- 매장 특성(메뉴명, 특징)을 자연스럽게 녹여서 생성
- 답글 블록 구조: [인사] + [리뷰 내용 언급] + [감사 또는 해명] + [마무리 인사]

#### 경영 코칭
- 비판이 아닌 제안 톤 ("~해보세요" "~을 고려해보시면 좋겠습니다")
- 반드시 구체적 수치 근거와 함께 제안
- 실행 가능한 액션 위주 (추상적 조언 금지)

---

## 7. 수수료 계산 엔진 규칙

### 7.1 계산 순서

```
1. 채널별 매출 분배
2. 각 채널 수수료율 적용 → 채널별 수수료 계산
3. 카드 수수료 별도 계산 (채널 수수료와 이중 적용 주의)
4. 배달대행 수수료 계산 (건당 고정 금액 × 건수)
5. 모든 수수료 합산 → 총 수수료
6. 총매출 - 총 수수료 = 순매출(실 수령액)
```

### 7.2 주의사항

- 배달앱 수수료와 카드 수수료 이중 적용 여부 확인 (배달앱은 보통 자체 정산이라 카드 수수료 별도 미적용)
- 부가세(VAT) 포함/미포함 기준 명확히 (수수료는 보통 부가세 별도)
- 배달대행비는 비율이 아닌 건당 고정 금액이 일반적
- 수수료율 변경 시 과거 데이터에는 소급 적용하지 않음 (변경일 이후부터 적용)

### 7.3 기본 수수료 프리셋 (2025년 기준, 사장님이 수정 가능)

```typescript
const FEE_PRESETS = {
  배민_중개: { type: 'percentage', rate: 6.8 },
  배민_배달: { type: 'percentage', rate: 12.5 },
  쿠팡이츠: { type: 'percentage', rate: 9.8 },
  요기요: { type: 'percentage', rate: 12.5 },
  카드_영세: { type: 'percentage', rate: 0.5 },
  카드_중소_3억이하: { type: 'percentage', rate: 0.8 },
  카드_중소_5억이하: { type: 'percentage', rate: 1.3 },
  카드_일반: { type: 'percentage', rate: 1.5 },
  배달대행_기본: { type: 'fixed', amount: 3300 },
};
```

---

## 8. UI/UX 가이드라인

### ⚠️ 최우선 원칙 (모든 작업에서 반드시 준수)

> **반드시 `UI_DESIGN_SYSTEM.md` 파일을 먼저 읽고 모든 UI 작업을 시작하라.**
> 이 앱의 모든 화면은 토스, 당근, 배민 수준의 완성도를 가져야 한다.
> AI가 만든 티가 나는 순간 실패다. 모든 컴포넌트, 모든 화면, 모든 인터랙션을
> 대기업 디자인팀이 3개월 공들여 만든 것처럼 세심하게 구현해야 한다.

### 8.1 필수 참조 문서

- **`UI_DESIGN_SYSTEM.md`** — 컬러 시스템, 타이포그래피, 컴포넌트 스타일, 애니메이션, 레이아웃 전체 규격이 정의되어 있다. UI 관련 코드를 작성하기 전에 반드시 이 문서를 참조하라.

### 8.2 디자인 핵심 원칙

1. **대기업 퀄리티:** 모든 화면이 "토스"나 "배민" 수준의 완성도를 가져야 함
2. **AI 슬롭 금지:** Inter/Roboto 폰트, 보라 그라데이션, 기본 shadcn/ui 그대로 쓰기 등 절대 금지
3. **폰트:** 숫자/금액은 'Plus Jakarta Sans', 한국어는 'Pretendard' 사용. 기본 폰트 절대 금지
4. **컬러:** 따뜻한 앰버/오렌지 메인 + 딥네이비 보조 + 따뜻한 그레이(순수 그레이 금지)
5. **다크모드 기본:** 사장님들은 밤에 사용. 순수 블랙(#000) 아닌 따뜻한 블랙(#0C0C0A) 사용
6. **모든 숫자에 애니메이션:** 금액 변경 시 카운트업 애니메이션 필수
7. **모든 전환에 모션:** 페이지 전환, 데이터 로드, 상태 변경 시 부드러운 전환 필수
8. **스켈레톤 UI:** 데이터 로딩 시 shimmer 스켈레톤 필수
9. **여백은 넉넉하게:** 빽빽한 UI 금지, 요소 간 충분한 breathing room
10. **모바일 기본 16px 이상:** 한국어 14px 미만 절대 금지

### 8.3 네비게이션 구조

```
하단 탭 네비게이션 (모바일):
[🏠 홈] [📊 마감] [📦 발주] [🧾 장부] [💬 리뷰]

우측 상단 메뉴:
[📈 브리핑] [💸 수수료] [⚙️ 설정]
```

### 8.4 핵심 UX 패턴

- **숫자 입력:** 네이티브 키보드 대신 커스텀 숫자 키패드 (64px 높이 버튼, 빠른 입력)
- **슬라이더:** 비율 입력 시 슬라이더 + 직접 입력 병행
- **스와이프:** 날짜 이동은 좌우 스와이프
- **풀다운:** 새로고침은 풀다운 (회전 아이콘 + 탄성 바운스)
- **토스트:** 저장 완료 등 피드백은 하단 slide-up 토스트
- **Glass Morphism:** 히어로 카드에 backdrop-filter 블러 + 미묘한 글로우
- **버튼 피드백:** 모든 버튼 press 시 scale(0.97) + release 시 spring 복귀

### 8.5 화면 완성 체크리스트

모든 화면을 만들고 나서 반드시 아래를 확인:
- AI가 만든 티가 나지 않는가?
- 50대 사장님이 바로 사용법을 알 수 있는가?
- 다크모드에서 잘 보이는가?
- 숫자 변경 시 카운트 애니메이션이 있는가?
- 토스/당근/배민 디자인팀이 만든 것처럼 보이는가?

---

## 9. 코드 작성 규칙

### 9.0 파일 크기 관리 규칙

> **모든 코드 파일은 200줄 이내를 원칙으로 한다.**
> Claude가 파일을 읽고, 분석하고, 오류를 정확히 수정할 수 있는 최적의 크기를 유지해야 한다.

#### 기준

| 파일 유형 | 권장 줄 수 | 최대 줄 수 | 초과 시 조치 |
|-----------|-----------|-----------|-------------|
| 컴포넌트 (tsx) | ~150줄 | 200줄 | 하위 컴포넌트로 분리 |
| 페이지 (page.tsx) | ~250줄 | 350줄 | 로직을 커스텀 훅으로, UI를 하위 컴포넌트로 분리 |
| 유틸/라이브러리 (ts) | ~100줄 | 150줄 | 기능별로 파일 분리 |
| 타입 정의 (types.ts) | 제한 없음 | — | 자동 생성 가능하므로 예외 |

#### 분리 원칙

1. **페이지가 350줄을 넘으면:**
   - 탭별 콘텐츠를 별도 컴포넌트로 분리 (예: `UsageTab.tsx`, `RecommendTab.tsx`)
   - 비즈니스 로직(데이터 로드, 저장, 계산)을 커스텀 훅으로 분리 (예: `useOrderData.ts`)
   - 상수/더미 데이터를 별도 파일로 분리

2. **컴포넌트가 200줄을 넘으면:**
   - 반복되는 하위 요소를 별도 컴포넌트로 추출
   - 복잡한 로직을 유틸 함수로 분리

3. **파일 분리 시 네이밍:**
   - 같은 디렉토리에 관련 파일을 모아둠
   - 부모-자식 관계가 명확한 이름 사용 (예: `OrderPage.tsx` → `OrderUsageTab.tsx`, `OrderRecommendTab.tsx`)

4. **분리하지 않아도 되는 경우:**
   - 타입 정의 파일 (supabase/types.ts 등)
   - 데이터 템플릿 파일 (order/templates.ts 등)
   - 단순 나열형 상수 파일

#### Claude 자동 관리

- **새 파일 작성 시:** 200줄 초과 여부를 스스로 체크하고, 초과 시 자동으로 분리하여 생성
- **기존 파일 수정 시:** 수정 후 줄 수가 기준을 초과하면 리팩토링 제안
- **새 모듈 구현 시:** 처음부터 탭/섹션별로 컴포넌트를 나누어 설계

### 9.1 TypeScript

```typescript
// ✅ 인터페이스에 명확한 타입 정의
interface DailyClosing {
  id: string;
  storeId: string;
  date: string;          // YYYY-MM-DD
  totalSales: number;    // 원 단위 정수
  channels: ChannelSales[];
  memo: string | null;
  createdAt: string;
}

// ✅ 금액 계산 함수는 반드시 정수 반환
function calculateFee(amount: number, rate: number): number {
  return Math.round(amount * rate / 100);
}
```

### 9.2 컴포넌트

- 파일명: PascalCase (예: `ClosingReport.tsx`)
- 함수형 컴포넌트만 사용
- Props 인터페이스 별도 정의
- 상태 관리: 로컬 상태는 useState, 전역 상태는 Zustand
- 서버 데이터: Supabase 클라이언트 직접 사용 또는 Server Actions

### 9.3 API Routes

- 에러 핸들링 일관성 유지
- 응답 형식 통일: `{ success: boolean, data?: T, error?: string }`
- 인증 확인 반드시 포함

### 9.4 커밋 메시지

```
feat: 마감 리포트 숫자 키패드 입력 구현
fix: 수수료 계산 소수점 반올림 오류 수정
ui: 발주 추천 카드 모바일 반응형 개선
refactor: 수수료 계산 엔진 모듈화
docs: API 엔드포인트 문서 추가
```

---

## 10. 테스트 가이드라인

### 10.1 필수 테스트 대상

- 수수료 계산 로직 (금액이 관련되므로 반드시 단위 테스트)
- AI 응답 파싱 로직 (예상치 못한 형식 대응)
- 날짜 관련 유틸 (요일 계산, 기간 필터링)
- 금액 포맷팅 함수

### 10.2 테스트 우선순위

1. 수수료 계산 엔진 (돈 관련 → 최우선)
2. 매출 데이터 집계 로직
3. 영수증 OCR 결과 파싱
4. 발주 추천 알고리즘
5. UI 컴포넌트 (기능 안정화 후)

---

## 11. 보안 지침

- API 키는 반드시 환경 변수로 관리 (.env.local)
- Claude API 호출은 반드시 서버 사이드(API Routes)에서만
- 사용자 입력 값 항상 서버에서 재검증 (클라이언트 검증만 신뢰 금지)
- Supabase RLS 반드시 활성화
- 이미지 업로드 시 파일 크기 및 타입 제한 (영수증: 10MB, jpg/png/heic)

---

## 12. 성능 최적화

- 이미지(영수증): 업로드 전 클라이언트에서 리사이즈 (최대 1920px)
- 차트 데이터: 필요한 기간만 쿼리 (전체 로드 금지)
- AI API 호출: 디바운스 적용, 중복 요청 방지
- 리스트 렌더링: 가상 스크롤 적용 (품목 100개+ 대응)

---

## 13. 배포 체크리스트

- [ ] 환경 변수 설정 (Vercel Dashboard)
- [ ] Supabase 프로덕션 DB 마이그레이션
- [ ] RLS 정책 활성화 확인
- [ ] 에러 모니터링 설정
- [ ] 모바일 브라우저 테스트 (Chrome, Safari, Samsung Internet)
- [ ] 라이트하우스 성능 점수 80+ 확인
- [ ] SEO 메타 태그 (랜딩 페이지)
- [ ] PWA manifest 설정 (홈 화면 추가 지원)
