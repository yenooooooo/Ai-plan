# 🎨 사장님비서 — UI/UX 디자인 시스템 가이드

---

## ⚠️ 최우선 원칙

> **이 앱의 모든 화면은 "토스", "당근", "배민" 수준의 완성도를 가져야 한다.**
> AI가 만든 티가 나는 순간 실패다. 모든 컴포넌트, 모든 화면, 모든 인터랙션을
> 대기업 디자인팀이 3개월 공들여 만든 것처럼 세심하게 구현해야 한다.

---

## 1. 절대 금지 — "AI 슬롭" 디자인 패턴

아래 패턴이 하나라도 보이면 즉시 수정해야 한다. 이것들은 AI가 만든 티가 바로 나는 흔한 실수들이다.

### ❌ 절대 사용 금지 폰트
- Inter, Roboto, Arial, system-ui, sans-serif 같은 디폴트 폰트
- 모든 컴포넌트에 동일한 폰트만 사용하는 것

### ❌ 절대 사용 금지 컬러 패턴
- 보라색 그라데이션 + 흰 배경 (AI 클리셰 1위)
- 파란색/보라색 CTA 버튼 + 회색 배경 (가장 흔한 AI 조합)
- 무지개 그라데이션
- 채도가 균일하게 분배된 다색 팔레트
- 순수 블랙(#000000) + 순수 화이트(#FFFFFF) 조합

### ❌ 절대 사용 금지 레이아웃
- 완벽한 좌우 대칭 그리드만 반복
- 카드가 일렬로 나열만 되는 단조로운 구조
- 여백 없이 빽빽하게 채운 화면
- 모든 섹션이 동일한 패딩과 간격

### ❌ 절대 사용 금지 컴포넌트 스타일
- 둥근 모서리 카드 + 옅은 그림자만 반복하는 것 (AI 클리셰)
- 아이콘과 텍스트만 나열한 밋밋한 리스트
- 기본 shadcn/ui를 그대로 쓰는 것 (반드시 커스텀)
- 기본 HTML 인풋 스타일 그대로 노출

---

## 2. 디자인 방향성 — "프리미엄 핀테크 + 따뜻한 로컬"

### 2.1 컨셉 정의

사장님비서의 디자인은 두 가지 축을 결합한다:

**축 1 — 프리미엄 핀테크 (토스/뱅크샐러드 느낌)**
- 깔끔한 숫자 타이포그래피
- 금액이 크고 명확하게 보이는 레이아웃
- 차트와 그래프가 우아하게 애니메이팅
- 다크모드에서 빛나는 UI

**축 2 — 따뜻한 로컬 비즈니스 (당근마켓/배민 느낌)**
- 사장님이 친근하게 느끼는 톤
- 부담스럽지 않은 일러스트/이모지 포인트
- "어렵지 않다"는 인상을 주는 라운드한 형태감
- 성취감을 주는 마이크로 인터랙션

### 2.2 한 줄 디자인 테스트

> 모든 화면을 만들고 나서 이 질문을 해봐라:
> **"50대 식당 사장님이 이 화면을 보고 '오 이거 깔끔하네, 비싸 보인다'고 말할까?"**
> 그렇다면 성공이다.

---

## 3. 컬러 시스템

### 3.1 메인 팔레트

```css
:root {
  /* ── Primary: 따뜻한 앰버/오렌지 ── */
  /* 메인 브랜드 컬러. 식당/음식과 어울리는 따뜻함 */
  --primary-50: #FFF8F0;
  --primary-100: #FFEDD5;
  --primary-200: #FED7AA;
  --primary-300: #FDBA74;
  --primary-400: #FB923C;
  --primary-500: #F97316;    /* ← 메인 액센트 */
  --primary-600: #EA580C;
  --primary-700: #C2410C;
  --primary-800: #9A3412;
  --primary-900: #7C2D12;

  /* ── Secondary: 딥 네이비 ── */
  /* 신뢰감, 전문성. 금융 앱 느낌의 안정감 */
  --secondary-50: #F0F4FF;
  --secondary-100: #DDE5F9;
  --secondary-200: #B8C9F2;
  --secondary-300: #8BA7E8;
  --secondary-400: #5B7FD6;
  --secondary-500: #3B5CC0;
  --secondary-600: #2D4A9E;
  --secondary-700: #1E3578;
  --secondary-800: #162758;    /* ← 다크모드 배경 보조 */
  --secondary-900: #0F1B3D;

  /* ── Neutral: 따뜻한 그레이 (순수 그레이 금지) ── */
  --neutral-50: #FAFAF8;
  --neutral-100: #F5F5F0;
  --neutral-200: #E8E8E3;
  --neutral-300: #D4D4CD;
  --neutral-400: #A8A89F;
  --neutral-500: #737369;
  --neutral-600: #545449;
  --neutral-700: #3D3D35;
  --neutral-800: #27271F;
  --neutral-900: #171712;

  /* ── Semantic ── */
  --success: #16A34A;
  --success-soft: #DCFCE7;
  --warning: #EAB308;
  --warning-soft: #FEF9C3;
  --danger: #DC2626;
  --danger-soft: #FEE2E2;
  --info: #0EA5E9;
  --info-soft: #E0F2FE;

  /* ── 수수료/순매출 전용 ── */
  --fee-deducted: #EF4444;       /* 수수료 차감 빨강 */
  --net-income: #10B981;         /* 순수익 그린 */
  --gross-sales: var(--primary-500);  /* 총매출 오렌지 */
}
```

### 3.2 다크모드 팔레트

다크모드가 기본이다. 사장님들은 밤 11시에 쓴다.

```css
[data-theme="dark"] {
  --bg-primary: #0C0C0A;          /* 순수 블랙 아닌 따뜻한 블랙 */
  --bg-secondary: #1A1A16;        /* 카드 배경 */
  --bg-tertiary: #252520;         /* 인풋/선택 영역 배경 */
  --bg-elevated: #2E2E28;         /* 모달/팝업 배경 */

  --text-primary: #F5F5F0;        /* 메인 텍스트 (순수 화이트 아님) */
  --text-secondary: #A8A89F;      /* 보조 텍스트 */
  --text-tertiary: #737369;       /* 비활성 텍스트 */
  --text-accent: #FB923C;         /* 강조 텍스트 */

  --border-default: #2E2E28;      /* 기본 보더 */
  --border-subtle: #1F1F1A;       /* 약한 구분선 */
  --border-accent: #F97316;       /* 강조 보더 */

  /* 카드 그라데이션 배경 */
  --card-gradient: linear-gradient(135deg, #1A1A16 0%, #1F1F1A 100%);
  --card-glow: 0 0 40px rgba(249, 115, 22, 0.06);  /* 은은한 오렌지 글로우 */
}
```

### 3.3 라이트모드 팔레트

```css
[data-theme="light"] {
  --bg-primary: #FAFAF8;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F5F5F0;
  --bg-elevated: #FFFFFF;

  --text-primary: #171712;
  --text-secondary: #545449;
  --text-tertiary: #A8A89F;
  --text-accent: #EA580C;

  --border-default: #E8E8E3;
  --border-subtle: #F5F5F0;
  --border-accent: #F97316;

  --card-gradient: linear-gradient(135deg, #FFFFFF 0%, #FAFAF8 100%);
  --card-glow: 0 4px 24px rgba(0, 0, 0, 0.04);
}
```

### 3.4 컬러 사용 규칙

- **금액 표시:** 양수 = `--net-income`, 음수(수수료) = `--fee-deducted`, 총매출 = `--text-primary`
- **증감 표시:** 상승 ↑ = `--success`, 하락 ↓ = `--danger`
- **CTA 버튼:** `--primary-500` 배경 + 화이트 텍스트
- **위험 알림:** `--danger` 보더 + `--danger-soft` 배경
- **배경 그라데이션:** 절대 2가지 이상의 원색 그라데이션 금지. 같은 톤의 미묘한 변화만 허용

---

## 4. 타이포그래피

### 4.1 폰트 패밀리

```css
/* 숫자/금액 전용: 고급스럽고 가독성 높은 폰트 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* 한국어 본문: 프리미엄 한글 폰트 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');

:root {
  --font-display: 'Plus Jakarta Sans', sans-serif;   /* 숫자, 금액, 헤딩 */
  --font-body: 'Pretendard Variable', 'Pretendard', sans-serif;  /* 한국어 본문 */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;  /* 코드/수치 표 */
}
```

### 4.2 타이포 스케일

```css
/* 금액 표시 (가장 크고 눈에 띄게) */
.amount-hero {
  font-family: var(--font-display);
  font-size: 2.5rem;      /* 40px */
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;  /* 숫자 정렬 */
}

/* 카드 내 금액 */
.amount-card {
  font-family: var(--font-display);
  font-size: 1.75rem;     /* 28px */
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

/* 리스트 내 금액 */
.amount-inline {
  font-family: var(--font-display);
  font-size: 1.125rem;    /* 18px */
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 한국어 제목 */
.heading-lg {
  font-family: var(--font-body);
  font-size: 1.5rem;      /* 24px */
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.heading-md {
  font-family: var(--font-body);
  font-size: 1.125rem;    /* 18px */
  font-weight: 600;
  line-height: 1.4;
}

/* 본문 */
.body-default {
  font-family: var(--font-body);
  font-size: 1rem;        /* 16px - 모바일 최소 */
  font-weight: 400;
  line-height: 1.6;
}

/* 보조 텍스트 */
.body-small {
  font-family: var(--font-body);
  font-size: 0.875rem;    /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* 캡션/라벨 */
.caption {
  font-family: var(--font-body);
  font-size: 0.75rem;     /* 12px */
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;  /* 영문 라벨만 */
  color: var(--text-tertiary);
}
```

### 4.3 타이포 규칙

- **금액은 항상 가장 크고 굵게.** 사장님이 가장 먼저 봐야 하는 숫자다
- **₩ 기호는 금액보다 작게.** `₩` 은 0.7em 크기로, 금액 숫자가 더 강조되도록
- **음수(수수료)는 항상 `-₩` 접두사 + 빨간색**
- **천 단위 쉼표 필수.** `1870000` → `1,870,000`
- **한국어 텍스트는 14px 미만 금지.** 40~60대 사장님 시인성 확보

---

## 5. 컴포넌트 디자인 시스템

### 5.1 카드 (가장 많이 쓰이는 컴포넌트)

카드마다 개성이 있어야 한다. 전부 같은 모양의 카드를 반복하면 AI 슬롭이다.

```
카드 유형별 디자인:

[매출 카드] — 히어로 카드
  ┌────────────────────────────────────┐
  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 미묘한 그라데이션 배경
  │                                    │     (dark: 반투명 오렌지 글로우)
  │  오늘의 매출                        │  ← caption 스타일
  │  ₩1,870,000                       │  ← amount-hero, 가장 크게
  │  전일 대비 ↑ 12.3%  (+₩205,000)   │  ← 초록색 + 작은 사이즈
  │                                    │
  │  ───────────── 구분선 ─────────── │  ← 그라데이션 구분선
  │                                    │
  │  실 수령  ₩1,780,190              │  ← 순매출 토글 시 강조
  │  수수료   -₩89,810  (4.8%)        │  ← 빨간색
  │                                    │
  └────────────────────────────────────┘
  → border-radius: 20px
  → 내부 padding: 24px
  → 배경: glass-morphism 또는 미묘한 그라데이션
  → 선택적: 좌측 또는 상단에 컬러 액센트 바

[데이터 카드] — 정보 표시용
  ┌────────────────────────────────────┐
  │  📦 식자재 효율                     │
  │                                    │
  │  폐기율    2.1%                    │  ← 큰 숫자 + 작은 라벨
  │  ████████░░░░░░░░░░  전주 2.8%    │  ← 프로그레스바 + 비교
  │                                    │
  │  폐기 금액  ₩85,000               │
  │  적중률    87%                     │
  └────────────────────────────────────┘
  → border: 1px solid var(--border-default)
  → hover 시 border-color 변화 + 미세 scale(1.01)
  → 내부에 미니 차트/프로그레스바 포함

[액션 카드] — 탭하면 동작하는 카드
  ┌────────────────────────────────────┐
  │  ⚠️  부족 예상                      │  ← 상태에 따라 색상 변화
  │                                    │     (위험: 빨강, 주의: 노랑, OK: 초록)
  │  삼겹살  재고 3kg → 내일 6kg 필요   │
  │  🔴 3kg 부족                       │
  │                                    │
  │  추천: 5kg 발주  [−] 5 [+]  [확정] │  ← 인라인 액션
  └────────────────────────────────────┘
  → 좌측에 상태 컬러 바 (4px 두께)
  → 탭 시 확장 애니메이션
  → 확정 시 체크마크 애니메이션 + 컬러 변화
```

### 5.2 버튼

```
[Primary CTA]
  배경: var(--primary-500) → hover: var(--primary-600)
  텍스트: 화이트, font-weight: 600
  높이: 56px (모바일에서 충분히 큰 터치 영역)
  border-radius: 14px
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)
  hover: scale(1.02) + shadow 증가
  active: scale(0.98) 눌리는 느낌
  → 그라데이션 금지. 단색이 고급스럽다.

[Secondary]
  배경: transparent
  보더: 1px solid var(--border-default)
  hover: 배경 var(--bg-tertiary)
  높이: 48px
  border-radius: 12px

[Ghost / Text Button]
  배경: transparent, 보더 없음
  텍스트: var(--primary-500)
  hover: 배경 var(--primary-50)
  padding: 8px 16px

[Danger]
  배경: var(--danger)
  나머지는 Primary와 동일

[Icon Button]
  크기: 48x48px (터치 영역)
  border-radius: 12px
  아이콘: 24px
  hover: 배경색 변화
```

### 5.3 숫자 키패드 (커스텀)

```
┌──────────────────────────────────┐
│                                  │
│     ₩ 1,870,000                 │  ← amount-hero 스타일
│     ─────────────                │     커서 깜빡임 애니메이션
│                                  │
│  ┌────────┬────────┬────────┐   │
│  │        │        │        │   │
│  │   1    │   2    │   3    │   │  높이: 64px
│  │        │        │        │   │  font-size: 24px
│  ├────────┼────────┼────────┤   │  font-weight: 600
│  │   4    │   5    │   6    │   │
│  ├────────┼────────┼────────┤   │  배경: var(--bg-tertiary)
│  │   7    │   8    │   9    │   │  border-radius: 12px
│  ├────────┼────────┼────────┤   │  gap: 8px
│  │  00    │   0    │   ⌫   │   │
│  └────────┴────────┴────────┘   │  active: scale(0.95) + 배경 어두워짐
│                                  │
│  만원 단위: [50] [100] [150] [200]│  ← 빠른 입력 칩
│                                  │
└──────────────────────────────────┘

→ 키 누를 때 미세한 haptic 느낌의 scale 애니메이션
→ 금액 표시부 숫자 변경 시 숫자 카운트업 애니메이션
→ 만원 단위 칩: 탭하면 해당 금액 즉시 입력 (가장 많이 쓰는 금액대)
```

### 5.4 토글 (수수료 포함/미포함)

```
┌────────────────────────────────────┐
│  [  총매출 ○━━━━● 순매출  ]         │
└────────────────────────────────────┘

→ 일반 토글이 아닌 "세그먼트 컨트롤" 스타일
→ 선택된 쪽에 슬라이딩 배경 (framer-motion)
→ 전환 시 아래 금액들이 동시에 숫자 카운트 애니메이션으로 전환
→ 총매출 선택 시: 오렌지 하이라이트
→ 순매출 선택 시: 그린 하이라이트
→ 앱 상단 헤더에 항상 고정
```

### 5.5 차트/그래프 스타일

```
모든 차트 공통 스타일:
- 그리드 라인: var(--border-subtle), 1px, opacity 30%
- 축 라벨: caption 스타일, var(--text-tertiary)
- 데이터 포인트: 동그란 도트(6px) + hover 시 12px로 확대
- 툴팁: 다크 배경 + 라운드 + 그림자 + 화살표
- 애니메이션: 차트 진입 시 왼쪽→오른쪽 순차 그려지는 효과
- 색상: 단일 데이터 = primary-500, 비교 = primary-300 + primary-500

매출 막대그래프:
- 막대: border-radius 상단만 8px, 하단 0
- 최고값 막대: primary-500 (진하게)
- 최저값 막대: danger 색상 + 아이콘 표시
- 나머지: primary-300 (연하게)
- hover: 해당 막대만 밝아지고 나머지 opacity 감소

파이차트:
- 도넛형 (가운데 빈 원)
- 가운데에 총합 금액 표시
- 각 세그먼트 hover 시 살짝 바깥으로 밀려나는 효과
- 색상: primary 팔레트에서 명도 차이로 구분 (다른 계열 혼용 최소화)

프로그레스바:
- 높이: 8px, border-radius: 4px
- 배경: var(--bg-tertiary)
- 채움: 상태에 따라 success/warning/danger 그라데이션
- 채움 애니메이션: 왼쪽에서 부드럽게 확장
- 위에 현재값/목표값 라벨
```

---

## 6. 애니메이션 & 인터랙션

### 6.1 핵심 원칙

- **모든 전환에 애니메이션.** 화면 전환, 데이터 로드, 상태 변경 시 반드시 부드러운 전환
- **과하면 안 된다.** 토스/당근처럼 "있는 듯 없는 듯" 자연스러운 움직임
- **의미 있는 움직임.** 장식용 애니메이션 금지. 모든 움직임에 이유가 있어야 함

### 6.2 이징 함수

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* 일반 전환 */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* 모달 열기/닫기 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 버튼 바운스 */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);      /* 부드러운 전환 */
}
```

### 6.3 필수 애니메이션 목록

```
[페이지 전환]
- 하단 네비 탭 전환: 컨텐츠 fade + slide (200ms)
- 상세 페이지 진입: 우측에서 slide-in (300ms)
- 뒤로가기: 좌측으로 slide-out (250ms)

[데이터 로드]
- 스켈레톤 UI: shimmer 애니메이션 (반짝이는 로딩)
- 숫자 로드: 0에서 실제값까지 카운트업 (600ms, ease-out)
- 차트 진입: 순차적으로 그려지는 효과 (stagger 50ms)
- 카드 리스트: 위에서 아래로 stagger fade-in (각 80ms 딜레이)

[사용자 인터랙션]
- 버튼 press: scale(0.97) → release: scale(1) (150ms, spring)
- 키패드 탭: scale(0.92) + 배경색 변화 (100ms)
- 토글 전환: 슬라이딩 배경 + 숫자 카운트 전환 (300ms)
- 저장 완료: 체크마크 draw 애니메이션 + 초록 flash (400ms)
- 삭제: 항목이 좌측으로 slide-out + 높이 collapse (300ms)
- pull-to-refresh: 회전 아이콘 + 탄성 바운스

[알림/피드백]
- 토스트: 하단에서 slide-up + 3초 후 fade-out
- 에러 쉐이크: 인풋 좌우 흔들림 (300ms, 3회)
- 성공 축하: 미세한 confetti 또는 체크 원형 확장 효과
```

### 6.4 숫자 카운트 애니메이션 (핵심)

금액이 변경될 때 항상 부드러운 카운트 애니메이션을 사용한다.

```typescript
// 예시: 토글 전환 시 총매출 → 순매출 변경
// ₩1,870,000 → ₩1,780,190 으로 숫자가 부드럽게 변화
// 각 자릿수가 슬롯머신처럼 회전하는 효과
// duration: 600ms, easing: ease-out
```

---

## 7. 레이아웃 & 스페이싱

### 7.1 모바일 레이아웃 (기본)

```
┌──────────────────────────┐
│  ■ 사장님비서  [총매출●순매출] │  ← 헤더 (56px 높이)
│  ─────────────────────── │      글로벌 토글 항상 표시
│                          │
│                          │
│    메인 컨텐츠 영역        │  ← padding: 20px
│    (스크롤)               │     max-width: 640px (태블릿에서 센터)
│                          │
│                          │
│                          │
│  ─────────────────────── │
│  🏠  📊  📦  🧾  💬     │  ← 하단 네비 (고정, 80px 높이)
│  홈  마감  발주 장부 리뷰   │     safe-area-inset-bottom 적용
└──────────────────────────┘
```

### 7.2 스페이싱 시스템

```css
/* 4px 기반 스페이싱 */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* 컴포넌트 간격 규칙 */
섹션 간: space-8 (32px)
카드 간: space-4 (16px)
카드 내부 패딩: space-5 ~ space-6 (20~24px)
라벨과 값 간: space-2 (8px)
인라인 요소 간: space-3 (12px)
```

### 7.3 반응형 브레이크포인트

```css
/* 모바일 퍼스트 */
기본: 0~639px (모바일, 1열)
sm: 640px~ (큰 모바일/작은 태블릿, 여전히 1열이지만 센터)
md: 768px~ (태블릿, 일부 2열 그리드)
lg: 1024px~ (데스크톱, 사이드바 레이아웃)
xl: 1280px~ (와이드, 3열 대시보드 가능)
```

---

## 8. 아이콘 & 일러스트

### 8.1 아이콘

```
사용 라이브러리: lucide-react (선형 아이콘)
크기: 20px (기본) / 24px (네비/헤더) / 16px (인라인)
굵기: stroke-width 1.5 (기본) / 2 (강조)
색상: var(--text-secondary) 기본, 활성 시 var(--primary-500)
```

### 8.2 상태 표시 이모지

기능별 아이콘 대신 이모지를 포인트로 사용하여 친근감 부여:

```
매출: 💰  마감: 📊  발주: 📦  장부: 🧾  리뷰: 💬
브리핑: 📈  수수료: 💸  설정: ⚙️  알림: 🔔
상승: ↑ (초록)  하락: ↓ (빨강)  유지: → (회색)
위험: 🔴  주의: 🟡  안전: 🟢
```

### 8.3 빈 상태 (Empty State)

데이터가 없을 때 빈 화면 금지. 반드시 의미 있는 빈 상태 표시:

```
┌──────────────────────────┐
│                          │
│       📊                 │  ← 큰 이모지 또는 심플한 일러스트
│                          │
│   아직 마감 데이터가       │  ← heading-md, text-secondary
│   없습니다               │
│                          │
│   오늘의 매출을 입력하면    │  ← body-small, text-tertiary
│   멋진 리포트가 생성돼요    │
│                          │
│   [ 📊 첫 마감 입력하기 ]  │  ← Primary CTA
│                          │
└──────────────────────────┘
```

---

## 9. 마이크로카피 & 톤

### 9.1 톤 가이드

- **공손하되 딱딱하지 않게.** "입력해주세요" (O) / "입력하시오" (X) / "입력해!" (X)
- **긍정적 프레이밍.** "아직 3건 남았어요" 보다 "17건 완료! 3건만 더!"
- **구체적 피드백.** "저장되었습니다" 보다 "오늘 마감이 저장되었습니다 ✓"
- **사장님 호칭.** "사장님" 사용 (너무 자주 쓰면 어색하니 적절히)

### 9.2 주요 마이크로카피 예시

```
로딩: "잠시만요, 계산하고 있어요..."
저장 완료: "오늘 마감이 저장되었어요 ✓"
영수증 인식 중: "영수증을 읽고 있어요..."
발주 추천: "내일 예상 매출을 기반으로 추천드려요"
에러: "앗, 뭔가 잘못됐어요. 다시 시도해볼까요?"
빈 데이터: "아직 데이터가 없어요. 첫 기록을 시작해보세요!"
성취: "이번 주 폐기율 2% 달성! 대단해요 🎉"
주간 브리핑: "사장님, 이번 주도 수고하셨어요. 지난주 성적표입니다 📈"
```

---

## 10. 특수 UI 패턴

### 10.1 Glass Morphism (히어로 카드)

매출 카드 등 핵심 정보 카드에 적용:

```css
.glass-card {
  background: rgba(26, 26, 22, 0.7);          /* 다크모드 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 
    0 0 40px rgba(249, 115, 22, 0.06),        /* 오렌지 글로우 */
    0 8px 32px rgba(0, 0, 0, 0.12);           /* 깊이감 */
}
```

### 10.2 스와이프 제스처

```
좌우 스와이프:
  - 마감 리포트: 이전/다음 날짜 이동
  - 브리핑: 카드 간 이동
  - 리뷰 답글: 답글 버전 전환

리스트 아이템 스와이프:
  - 왼쪽 스와이프: 삭제 (빨간 배경 reveal)
  - 오른쪽 스와이프: 편집 / 완료 처리
```

### 10.3 스켈레톤 UI

```
모든 데이터 로딩 시 스켈레톤 표시:
- 카드 형태 유지 + 내부 텍스트/숫자 자리에 회색 막대
- shimmer 애니메이션 (좌→우 반짝이는 효과)
- 실제 데이터 로드 시 fade-in 전환
- 스켈레톤 → 실제 컨텐츠 전환 시 layout shift 없어야 함
```

### 10.4 Pull to Refresh

```
당겨서 새로고침:
- 당기기 시작: 회전 아이콘 서서히 나타남
- 임계점 도달: 아이콘 완성 + 진동(haptic)
- 놓기: 아이콘 회전 + 데이터 새로고침
- 완료: 아이콘 체크마크로 변환 → 사라짐
```

---

## 11. 접근성

- **터치 영역:** 모든 인터랙티브 요소 최소 48x48px
- **컬러 대비:** WCAG AA 이상 (텍스트:배경 4.5:1)
- **포커스 표시:** 키보드 네비게이션 시 포커스 링 표시
- **동적 폰트:** 시스템 폰트 크기 설정 존중
- **색각 이상:** 색상만으로 정보 전달 금지 (아이콘/텍스트 병행)
- **스크린 리더:** 금액 읽기 형식 ("백팔십칠만 원")

---

## 12. 화면별 디자인 체크리스트

모든 화면을 만들고 아래 체크리스트를 반드시 확인:

```
□ AI가 만든 티가 나지 않는가? (금지 패턴 체크)
□ 금액이 가장 먼저 눈에 들어오는가?
□ 50대 사장님이 바로 사용법을 알 수 있는가?
□ 다크모드에서 잘 보이는가?
□ 숫자 변경 시 카운트 애니메이션이 있는가?
□ 로딩 시 스켈레톤이 표시되는가?
□ 빈 상태 화면이 준비되어 있는가?
□ 버튼 터치 시 피드백(scale 변화)이 있는가?
□ 여백이 충분한가? (빽빽하지 않은가?)
□ 모바일에서 한 손으로 조작 가능한가?
□ 토스/당근/배민 디자인팀이 만든 것처럼 보이는가?
```
