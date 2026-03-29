# 사장님비서 프로젝트 완전 학습 가이드

> 이 문서는 프로젝트의 모든 코드 흐름, 기술 개념, 배포 과정을 처음부터 끝까지 설명합니다.
> 코딩 경험이 없어도 이해할 수 있도록 작성되었습니다.

---

## 목차

1. [기초 개념 — 웹 개발이란?](#1-기초-개념--웹-개발이란)
2. [우리 프로젝트의 기술 스택](#2-우리-프로젝트의-기술-스택)
3. [프로젝트 폴더 구조 이해하기](#3-프로젝트-폴더-구조-이해하기)
4. [Next.js App Router — 페이지가 만들어지는 원리](#4-nextjs-app-router--페이지가-만들어지는-원리)
5. [React 컴포넌트 — UI의 기본 단위](#5-react-컴포넌트--ui의-기본-단위)
6. [TypeScript — 타입이 뭐고 왜 쓰나?](#6-typescript--타입이-뭐고-왜-쓰나)
7. [Tailwind CSS — 스타일링 방법](#7-tailwind-css--스타일링-방법)
8. [인증 시스템 흐름](#8-인증-시스템-흐름)
9. [데이터베이스 (Supabase) 이해하기](#9-데이터베이스-supabase-이해하기)
10. [API 라우트 — 서버와 통신하는 방법](#10-api-라우트--서버와-통신하는-방법)
11. [상태 관리 (Zustand) — 데이터 공유](#11-상태-관리-zustand--데이터-공유)
12. [커스텀 훅 — 재사용 가능한 로직](#12-커스텀-훅--재사용-가능한-로직)
13. [모듈별 코드 흐름 완전 분석](#13-모듈별-코드-흐름-완전-분석)
14. [외부 API 연동](#14-외부-api-연동)
15. [보안 — 어떻게 사이트를 보호하나?](#15-보안--어떻게-사이트를-보호하나)
16. [PWA — 앱처럼 동작하는 웹사이트](#16-pwa--앱처럼-동작하는-웹사이트)
17. [빌드와 배포 과정](#17-빌드와-배포-과정)
18. [면접 대비 — 기술 질문 예상 답변](#18-면접-대비--기술-질문-예상-답변)

---

## 1. 기초 개념 — 웹 개발이란?

### 웹사이트의 3가지 층

```
사용자가 보는 화면 (프론트엔드)
        ↕ HTTP 요청/응답
서버에서 처리하는 로직 (백엔드/API)
        ↕ SQL 쿼리
데이터를 저장하는 곳 (데이터베이스)
```

**프론트엔드** = 사용자가 보고 클릭하는 화면 (HTML, CSS, JavaScript)
**백엔드** = 데이터를 처리하는 서버 로직 (API)
**데이터베이스** = 데이터를 영구 저장하는 곳 (PostgreSQL)

### 우리 프로젝트에서는?

| 층 | 우리가 쓰는 기술 |
|----|-----------------|
| 프론트엔드 | React + Next.js + TypeScript + Tailwind CSS |
| 백엔드 | Next.js API Routes (같은 프로젝트 안에 있음!) |
| 데이터베이스 | Supabase (PostgreSQL 클라우드) |

> **핵심 포인트**: Next.js의 장점은 프론트엔드와 백엔드를 **하나의 프로젝트**에서 관리할 수 있다는 것입니다.

---

## 2. 우리 프로젝트의 기술 스택

### 각 기술이 하는 역할

#### React (리액트)
- **역할**: UI를 만드는 JavaScript 라이브러리
- **핵심 개념**: "컴포넌트"라는 작은 블록을 조합해서 화면을 만듦
- **비유**: 레고 블록. 작은 블록(버튼, 카드, 입력창)을 조합해서 큰 화면을 만듦

```tsx
// 이것이 React 컴포넌트 — 화면의 한 조각
function Button({ label }) {
  return <button>{label}</button>;
}
```

#### Next.js (넥스트JS)
- **역할**: React 위에 얹는 프레임워크
- **핵심 기능**:
  - 페이지 라우팅 (URL → 화면 연결)
  - 서버 사이드 렌더링 (SEO 최적화)
  - API Routes (백엔드 코드도 같이 작성)
- **비유**: React가 엔진이면, Next.js는 차체 전체 (엔진 + 바퀴 + 핸들)

#### TypeScript (타입스크립트)
- **역할**: JavaScript에 "타입"을 추가한 언어
- **핵심**: 변수에 어떤 종류의 데이터가 들어가는지 미리 지정
- **장점**: 오타나 잘못된 데이터를 미리 잡아줌 (컴파일 에러)

```tsx
// JavaScript — 아무거나 넣어도 에러 없음 (나중에 터짐)
let sales = "백만원";  // 숫자를 넣어야 하는데 문자열을 넣어도 모름

// TypeScript — 타입을 지정해서 실수를 미리 방지
let sales: number = 1000000;  // 숫자만 넣을 수 있음
let sales: number = "백만원"; // ❌ 에러! 컴파일 시점에 잡힘
```

#### Tailwind CSS (테일윈드)
- **역할**: CSS(스타일)를 클래스 이름으로 적용하는 방법
- **비유**: 기존 CSS는 옷을 직접 재봉, Tailwind는 기성복 조합

```html
<!-- 기존 CSS 방식 -->
<div style="padding: 16px; background: white; border-radius: 12px;">

<!-- Tailwind 방식 — 클래스 이름으로 스타일 적용 -->
<div className="p-4 bg-white rounded-xl">
```

#### Supabase (수파베이스)
- **역할**: 데이터베이스 + 인증 + 파일 저장 (BaaS)
- **핵심**: PostgreSQL 데이터베이스를 클라우드에서 제공
- **비유**: 직접 서버를 만드는 대신, 데이터베이스를 빌려 쓰는 것

#### Zustand (주스탄드)
- **역할**: React 전역 상태 관리
- **핵심**: 여러 컴포넌트가 같은 데이터를 공유할 때 사용
- **비유**: 앱 전체가 공유하는 "칠판" — 누가 써도 다른 데서 바로 보임

#### Framer Motion (프레이머 모션)
- **역할**: React 애니메이션 라이브러리
- **핵심**: 페이지 전환, 페이드인, 슬라이드 등 부드러운 움직임 담당

#### Vercel (버셀)
- **역할**: 배포 플랫폼
- **핵심**: GitHub에 push하면 자동으로 배포됨
- **비유**: 코드를 올리면 알아서 웹사이트가 만들어지는 서비스

---

## 3. 프로젝트 폴더 구조 이해하기

```
sajang-biseo/
│
├── src/                          ← 🔥 모든 소스 코드가 여기
│   │
│   ├── app/                      ← 📄 페이지 + API 라우트
│   │   ├── layout.tsx            ← 모든 페이지에 공통 적용되는 틀
│   │   ├── page.tsx              ← "/" 주소 = 랜딩 페이지
│   │   ├── globals.css           ← 전체 적용 CSS 스타일
│   │   │
│   │   ├── (auth)/               ← 인증 관련 페이지 그룹
│   │   │   ├── login/page.tsx    ← "/login" 로그인 페이지
│   │   │   ├── signup/page.tsx   ← "/signup" 회원가입 페이지
│   │   │   └── actions.ts       ← 로그인/회원가입 서버 액션
│   │   │
│   │   ├── (dashboard)/          ← 로그인 후 대시보드 페이지 그룹
│   │   │   ├── DashboardShell.tsx ← 대시보드 공통 레이아웃
│   │   │   ├── home/page.tsx     ← "/home" 홈 대시보드
│   │   │   ├── closing/page.tsx  ← "/closing" 마감 리포트
│   │   │   ├── order/page.tsx    ← "/order" 발주 추천
│   │   │   ├── receipt/page.tsx  ← "/receipt" 영수증 경비
│   │   │   ├── review/page.tsx   ← "/review" 리뷰 답글
│   │   │   ├── briefing/page.tsx ← "/briefing" 주간 브리핑
│   │   │   ├── fees/page.tsx     ← "/fees" 수수료 분석
│   │   │   └── settings/page.tsx ← "/settings" 설정
│   │   │
│   │   └── api/                  ← 🔌 백엔드 API 엔드포인트
│   │       ├── closing/parse/route.ts   ← 자연어 매출 파싱
│   │       ├── receipt/ocr/route.ts     ← 영수증 OCR
│   │       ├── review/generate/route.ts ← 리뷰 답글 생성
│   │       └── ...                      ← 기타 34개 API
│   │
│   ├── components/               ← 🧩 재사용 가능한 UI 조각들
│   │   ├── shared/               ← 전체에서 쓰는 공통 컴포넌트
│   │   ├── closing/              ← 마감 모듈 전용 컴포넌트
│   │   ├── order/                ← 발주 모듈 전용 컴포넌트
│   │   └── ...                   ← 각 모듈별 컴포넌트
│   │
│   ├── hooks/                    ← 🎣 커스텀 훅 (재사용 로직)
│   │   ├── useClosingData.ts     ← 마감 데이터 조회/저장
│   │   ├── useOrderData.ts       ← 발주 데이터 조회/저장
│   │   └── ...
│   │
│   ├── stores/                   ← 🏪 Zustand 전역 상태
│   │   ├── useFeeToggle.ts       ← 수수료 포함/미포함 토글
│   │   └── ...
│   │
│   ├── lib/                      ← 🔧 유틸리티 함수/모듈
│   │   ├── supabase/             ← DB 연결 설정
│   │   ├── fees/                 ← 수수료 계산 로직
│   │   └── security/             ← 보안 관련
│   │
│   └── middleware.ts             ← 🛡️ 모든 요청을 가로채서 인증 확인
│
├── public/                       ← 📁 정적 파일 (이미지, 아이콘)
├── next.config.mjs               ← ⚙️ Next.js 설정 (보안 헤더, PWA)
├── tailwind.config.ts            ← 🎨 Tailwind 커스텀 설정
├── package.json                  ← 📦 의존성 목록 (npm install 대상)
└── tsconfig.json                 ← TypeScript 설정
```

### 핵심 규칙

**폴더 이름 = URL 주소**

```
src/app/page.tsx                → https://사이트.com/
src/app/login/page.tsx          → https://사이트.com/login
src/app/(dashboard)/home/page.tsx → https://사이트.com/home
src/app/api/receipt/ocr/route.ts  → https://사이트.com/api/receipt/ocr
```

- `page.tsx` = 사용자가 보는 화면 (프론트엔드)
- `route.ts` = API 엔드포인트 (백엔드)
- `(괄호)` = URL에 포함되지 않는 그룹 폴더
  - `(auth)/login` → `/login` (auth는 URL에 안 나옴)
  - `(dashboard)/home` → `/home` (dashboard는 URL에 안 나옴)

---

## 4. Next.js App Router — 페이지가 만들어지는 원리

### 페이지 렌더링 과정

```
1. 사용자가 /home 접속
       ↓
2. middleware.ts가 가로챔
   → 로그인 안 했으면 /login으로 보냄
   → 로그인 했으면 통과
       ↓
3. src/app/(dashboard)/layout.tsx 실행
   → DashboardShell (Header + Sidebar + BottomNav) 렌더링
       ↓
4. src/app/(dashboard)/home/page.tsx 실행
   → 홈 페이지 내용 렌더링
       ↓
5. 컴포넌트들이 데이터 필요하면
   → 커스텀 훅(useHomeData)이 Supabase에 데이터 요청
   → 데이터 받아서 화면에 표시
```

### layout.tsx — 모든 페이지를 감싸는 틀

```
┌─────────────────────────────────┐
│         layout.tsx (루트)        │  ← html, body, 폰트, 다크모드
│  ┌───────────────────────────┐  │
│  │   (dashboard)/layout.tsx  │  │  ← Header, Sidebar, BottomNav
│  │  ┌─────────────────────┐  │  │
│  │  │                     │  │  │
│  │  │    page.tsx 내용     │  │  │  ← 실제 페이지 (home, closing...)
│  │  │                     │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

- `src/app/layout.tsx` — **루트 레이아웃**: html, body, 폰트 설정, 메타태그
- `src/app/(dashboard)/DashboardShell.tsx` — **대시보드 레이아웃**: Header + BottomNav + Sidebar

### "use client" vs 서버 컴포넌트

```tsx
// 서버 컴포넌트 (기본값) — 서버에서 실행, 빠름
// "use client" 없으면 자동으로 서버 컴포넌트
export default function Page() {
  // 여기서는 useState, onClick 등 사용 불가
  return <div>서버에서 렌더링됨</div>;
}

// 클라이언트 컴포넌트 — 브라우저에서 실행
"use client";  // ← 이 한 줄이 핵심!
export default function Page() {
  const [count, setCount] = useState(0);  // 이제 가능!
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**우리 프로젝트의 거의 모든 페이지는 `"use client"`입니다.**
이유: 사용자 입력(useState), 클릭(onClick), 애니메이션(Framer Motion) 등을 사용하기 때문.

---

## 5. React 컴포넌트 — UI의 기본 단위

### 컴포넌트란?

화면의 한 조각을 재사용 가능한 함수로 만든 것.

```tsx
// 1. 가장 단순한 컴포넌트
function HelloCard() {
  return <div>안녕하세요!</div>;
}

// 2. Props(속성)를 받는 컴포넌트 — 외부에서 데이터를 전달받음
function SalesCard({ amount, label }: { amount: number; label: string }) {
  return (
    <div className="glass-card p-4">
      <p>{label}</p>
      <p>{amount.toLocaleString()}원</p>
    </div>
  );
}

// 3. 사용할 때
<SalesCard amount={1500000} label="오늘 매출" />
<SalesCard amount={9800000} label="이번 달 매출" />
```

### 실제 프로젝트 예시 — DailyNote 컴포넌트

파일: `src/components/home/DailyNote.tsx`

```tsx
"use client";
import { useState } from "react";  // React의 상태 관리 기능

// Props 인터페이스 — 이 컴포넌트가 받을 수 있는 속성 정의
interface DailyNoteProps {
  initialMemo?: string;     // 기존에 저장된 메모 (선택적)
  readOnly?: boolean;       // 읽기 전용인지 (선택적)
}

export function DailyNote({ initialMemo, readOnly = false }: DailyNoteProps) {
  // useState — 컴포넌트 내부 상태 (변경되면 화면이 자동 업데이트)
  const [note, setNote] = useState(initialMemo || "");
  const [editing, setEditing] = useState(false);

  // readOnly이면 입력 불가능한 화면을 보여줌
  if (readOnly) {
    return <div>{note || "메모 없음"}</div>;
  }

  // 편집 모드 / 보기 모드 전환
  return (
    <div>
      {editing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}  // 입력할 때마다 상태 업데이트
        />
      ) : (
        <p onClick={() => setEditing(true)}>{note}</p>
      )}
    </div>
  );
}
```

### 컴포넌트 계층 구조 (부모 → 자식)

```
page.tsx (페이지)
  ├── SalesForecast (매출 예측 컴포넌트)
  ├── DailyNote (일일 메모 컴포넌트)
  └── NoticeBanner (공지 배너 컴포넌트)
```

**데이터 흐름**: 부모 → 자식 (props로 전달)

```tsx
// page.tsx (부모)
function HomePage() {
  const { canEdit } = useTeamRole();  // 편집 권한 확인
  return (
    <div>
      {/* 자식에게 props로 데이터 전달 */}
      <DailyNote initialMemo={memo} readOnly={!canEdit} />
    </div>
  );
}
```

---

## 6. TypeScript — 타입이 뭐고 왜 쓰나?

### 기본 타입

```tsx
// 기본 타입
let storeName: string = "맛있는 한식당";   // 문자열
let totalSales: number = 1500000;          // 숫자
let isOpen: boolean = true;                // 참/거짓

// 배열
let menuItems: string[] = ["김치찌개", "된장찌개", "비빔밥"];

// 객체 타입 정의 (interface)
interface DailyClosing {
  date: string;
  totalSales: number;
  netSales: number;
  channels: Channel[];    // Channel 타입의 배열
}

interface Channel {
  name: string;           // "배민", "쿠팡이츠" 등
  amount: number;         // 해당 채널 매출
  feeRate: number;        // 수수료율 (0~1)
}
```

### 왜 TypeScript를 쓰나?

```tsx
// JavaScript (타입 없음) — 실행해봐야 에러를 알 수 있음
function calculateFee(sales, rate) {
  return sales * rate;  // sales에 "백만원" 넣어도 에러 안 남
}
calculateFee("백만원", 0.1);  // NaN (숫자가 아님) — 런타임에 터짐

// TypeScript (타입 있음) — 코드 작성 시점에 에러를 잡아줌
function calculateFee(sales: number, rate: number): number {
  return sales * rate;
}
calculateFee("백만원", 0.1);  // ❌ 빨간 줄! "string은 number에 넣을 수 없음"
```

### 실제 프로젝트에서 타입 파일

파일: `src/lib/supabase/types.ts` — 데이터베이스 테이블의 타입 정의

```tsx
// 데이터베이스 테이블 구조를 TypeScript로 정의
interface Database {
  public: {
    Tables: {
      sb_daily_closing: {
        Row: {
          id: string;
          store_id: string;
          date: string;
          total_sales: number;
          net_sales: number;
          created_at: string;
        };
        Insert: { ... };  // 새로 넣을 때 필요한 필드
        Update: { ... };  // 수정할 때 필요한 필드
      };
      // ... 나머지 테이블들
    };
  };
}
```

---

## 7. Tailwind CSS — 스타일링 방법

### 기본 원리

클래스 이름으로 CSS를 적용합니다. 외울 필요 없이 패턴만 이해하면 됩니다.

```
p-4     = padding: 16px        (안쪽 여백)
m-2     = margin: 8px          (바깥 여백)
bg-white = background: white   (배경색)
text-sm = font-size: 14px      (글씨 크기)
rounded-xl = border-radius: 12px (둥근 모서리)
flex    = display: flex         (가로/세로 배치)
gap-2   = gap: 8px              (요소 간 간격)
```

### 숫자 규칙

- 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px, 6 = 24px ...
- 크기는 항상 4px 단위

### 반응형 (모바일/데스크탑)

```tsx
// 모바일에서는 1열, 데스크탑(md 이상)에서는 3열
<div className="grid grid-cols-1 md:grid-cols-3">
```

- `md:` = 768px 이상일 때 적용
- `lg:` = 1024px 이상일 때 적용

### 우리 프로젝트의 커스텀 클래스

파일: `src/app/globals.css`

```css
/* glass-card — 반투명 유리 효과 카드 (앱 전체에서 사용) */
.glass-card {
  background: rgba(26, 26, 22, 0.7);     /* 반투명 검은 배경 */
  backdrop-filter: blur(20px);            /* 뒤가 흐릿하게 보임 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;                    /* 둥근 모서리 */
}

/* 라이트 모드에서는 */
.light .glass-card {
  background: rgba(255, 255, 255, 0.8);   /* 반투명 흰 배경 */
}
```

### CSS 변수 (테마 색상)

```css
/* 다크모드 색상 */
--text-primary: #FAFAF8;      /* 메인 텍스트 (거의 흰색) */
--text-secondary: #A3A39A;    /* 보조 텍스트 (회색) */
--text-tertiary: #5C5C56;     /* 약한 텍스트 (진한 회색) */
--bg-primary: #0C0C0A;        /* 메인 배경 (따뜻한 검은색) */
--bg-secondary: #161614;      /* 보조 배경 */
--bg-elevated: #1E1E1A;       /* 카드/모달 배경 */
```

사용할 때: `text-[var(--text-primary)]` → 메인 텍스트 색상 적용

---

## 8. 인증 시스템 흐름

### 전체 플로우

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ 회원가입  │────→│이메일 인증│────→│ 온보딩   │────→│ 홈 대시보드│
│ /signup   │     │/verify   │     │/onboarding│    │ /home     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      ↑                                                  ↑
      │           ┌──────────┐                          │
      └───────────│  로그인   │──────────────────────────┘
                  │ /login    │
                  └──────────┘
```

### 1단계: 회원가입

파일: `src/app/(auth)/signup/page.tsx` + `src/app/(auth)/actions.ts`

```
사용자가 이메일/비밀번호 입력
    ↓
Cloudflare Turnstile 봇 검증 (자동)
    ↓
actions.ts의 signUp 함수 실행
    ↓
Supabase Auth에 사용자 생성 요청
    ↓
Supabase가 인증 이메일 발송
    ↓
/verify-email 페이지로 이동 ("이메일을 확인하세요")
```

### 2단계: 미들웨어 (모든 요청 검사)

파일: `src/middleware.ts`

```
매 요청마다 실행됨 (어떤 페이지를 가든)
    ↓
Supabase 세션 토큰 확인
    ↓
┌─ 로그인 안 됨 + 보호된 페이지 → /login으로 리다이렉트
├─ 로그인 됨 + 이메일 미인증   → /verify-email로 리다이렉트
├─ 로그인 됨 + 인증 페이지     → /home으로 리다이렉트 (이미 로그인됨)
└─ 관리자 페이지 + 관리자 아님  → /home으로 리다이렉트
```

### 3단계: 보호된 페이지 접근

```tsx
// middleware.ts 핵심 로직 (간소화)
const protectedRoutes = ["/home", "/closing", "/order", "/receipt", ...];
const authRoutes = ["/login", "/signup"];

// 1. 세션 확인
const { data: { user } } = await supabase.auth.getUser();

// 2. 보호된 페이지인데 로그인 안 했으면
if (protectedRoutes.includes(path) && !user) {
  return NextResponse.redirect("/login");
}

// 3. 인증 페이지인데 이미 로그인했으면
if (authRoutes.includes(path) && user) {
  return NextResponse.redirect("/home");
}
```

---

## 9. 데이터베이스 (Supabase) 이해하기

### Supabase란?

Firebase의 오픈소스 대안. **PostgreSQL** 데이터베이스를 클라우드에서 제공하며, 추가로 인증(Auth), 파일 저장(Storage), 실시간 구독(Realtime)을 제공합니다.

### 우리 프로젝트의 테이블 구조

> 모든 테이블 이름이 `sb_`로 시작합니다 (Supabase 공유 환경이라 충돌 방지)

```
sb_user_profiles       ← 사용자 프로필 (매장명, 업종, 플랜 등)
sb_stores              ← 매장 정보
sb_store_members       ← 매장-사용자 연결 (팀 역할)
sb_daily_closing       ← 📊 일일 마감 기록 (핵심!)
sb_daily_closing_channels ← 채널별 매출 상세
sb_store_fee_settings  ← 매장별 수수료 설정
sb_fee_channels        ← 수수료 채널 (배민, 쿠팡 등)
sb_order_items         ← 발주 품목 마스터
sb_order_item_groups   ← 품목 카테고리 그룹
sb_daily_usage         ← 일일 식자재 사용량
sb_receipts            ← 영수증 데이터
sb_reviews             ← 리뷰 데이터
sb_review_replies      ← 리뷰 답글
sb_store_tone_settings ← 리뷰 톤 설정
sb_weekly_briefings    ← 주간 브리핑 데이터
```

### Supabase 클라이언트 연결

**클라이언트 사이드** (브라우저에서):

파일: `src/lib/supabase/client.ts`

```tsx
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**서버 사이드** (API 라우트에서):

파일: `src/lib/supabase/server.ts`

```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, ... } }
  );
}
```

### 데이터 조회/저장 예시

```tsx
// 조회 (SELECT)
const { data: closings } = await supabase
  .from("sb_daily_closing")            // 테이블 선택
  .select("date, total_sales, net_sales") // 가져올 컬럼
  .eq("store_id", storeId)             // WHERE store_id = ?
  .gte("date", "2026-03-01")           // WHERE date >= ?
  .order("date");                      // ORDER BY date

// 저장 (INSERT)
await supabase
  .from("sb_daily_closing")
  .upsert({                            // INSERT or UPDATE
    store_id: storeId,
    date: "2026-03-15",
    total_sales: 1500000,
    net_sales: 1350000,
  });

// 삭제 (soft delete)
await supabase
  .from("sb_daily_closing")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", closingId);
```

### RLS (Row Level Security) — 데이터 격리

```sql
-- 이 정책은: "사용자는 자기 매장의 데이터만 볼 수 있다"
CREATE POLICY "Users can view own store data"
ON sb_daily_closing
FOR SELECT
USING (store_id IN (
  SELECT store_id FROM sb_store_members
  WHERE user_id = auth.uid()
));
```

**RLS가 없으면**: A 사장님이 B 사장님의 매출 데이터를 볼 수 있음 (위험!)
**RLS가 있으면**: 자기 매장 데이터만 접근 가능

---

## 10. API 라우트 — 서버와 통신하는 방법

### API 라우트란?

브라우저에서 직접 실행하면 안 되는 로직(API 키 사용, 복잡한 계산 등)을 서버에서 실행하는 것.

### 요청-응답 흐름

```
[브라우저]                          [서버 (API Route)]
    │                                      │
    │── POST /api/receipt/ocr ───────→    │
    │   body: { image: "base64..." }       │
    │                                      │── Claude Vision API 호출
    │                                      │← OCR 결과 수신
    │                                      │
    │←── JSON { storeName, amount, ... } ──│
    │                                      │
```

### 실제 API 코드 예시

파일: `src/app/api/receipt/ocr/route.ts`

```tsx
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST 요청을 처리하는 함수
export async function POST(req: NextRequest) {
  try {
    // 1. 인증 확인 — 로그인한 사용자만 사용 가능
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    // 2. 요청 데이터 받기
    const { image } = await req.json();

    // 3. Claude Vision API 호출 (서버에서만 실행 — API 키 보호)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,  // 환경변수 (비밀)
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", data: image } },
          { type: "text", text: "영수증을 분석해서 JSON으로..." }
        ] }],
      }),
    });

    // 4. 결과 반환
    const result = await response.json();
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
```

### 프론트엔드에서 API 호출하는 법

```tsx
// 컴포넌트에서 API 호출
const handleOcr = async (imageBase64: string) => {
  const res = await fetch("/api/receipt/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
  });
  const result = await res.json();

  if (result.success) {
    // OCR 결과를 화면에 표시
    setOcrData(result.data);
  }
};
```

### 왜 API Route를 쓰나? (직접 호출하면 안 되나?)

```
❌ 브라우저에서 직접 Claude API 호출
→ API 키가 브라우저에 노출됨
→ 누구나 개발자 도구에서 키를 볼 수 있음
→ 키를 도용해서 비용 청구 가능

✅ API Route를 통해 호출
→ API 키는 서버 환경변수에만 존재
→ 브라우저에는 절대 노출되지 않음
→ 서버에서 인증 확인 후 대신 호출
```

---

## 11. 상태 관리 (Zustand) — 데이터 공유

### 문제: 컴포넌트 간 데이터 공유

```
Header에 "수수료 포함" 토글이 있음
    ↓ 토글을 클릭하면
ClosingPage의 매출 금액이 바뀌어야 함
OrderPage의 원가율도 바뀌어야 함
BriefingPage의 수수료 분석도 바뀌어야 함
    ↓
이 모든 컴포넌트가 같은 상태를 공유해야 함!
```

### 해결: Zustand 스토어

파일: `src/stores/useFeeToggle.ts`

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FeeToggleState {
  mode: "gross" | "net";           // "gross" = 총매출, "net" = 순매출
  toggle: () => void;              // 토글 함수
}

export const useFeeToggle = create<FeeToggleState>()(
  persist(
    (set) => ({
      mode: "net",                  // 기본값: 순매출
      toggle: () => set((s) => ({
        mode: s.mode === "gross" ? "net" : "gross"
      })),
    }),
    { name: "fee-toggle" }         // localStorage에 저장 (새로고침해도 유지)
  )
);
```

### 어디서든 사용

```tsx
// Header.tsx — 토글 버튼
function FeeToggleButton() {
  const { mode, toggle } = useFeeToggle();
  return (
    <button onClick={toggle}>
      {mode === "gross" ? "총매출" : "순매출"}
    </button>
  );
}

// ClosingPage.tsx — 매출 표시
function SalesDisplay({ totalSales, netSales }) {
  const { mode } = useFeeToggle();     // 같은 스토어에서 읽기
  const displayAmount = mode === "gross" ? totalSales : netSales;
  return <p>{displayAmount.toLocaleString()}원</p>;
}
```

**토글을 누르면 → 모든 곳에서 동시에 반영!** (Zustand가 구독 중인 모든 컴포넌트를 자동 업데이트)

### 우리 프로젝트의 12개 스토어

| 스토어 | 용도 | 저장 |
|--------|------|------|
| `useFeeToggle` | 수수료 포함/미포함 | localStorage |
| `useStoreSettings` | 현재 선택된 매장 정보 | localStorage |
| `useThemeStore` | 다크/라이트 모드 | localStorage |
| `usePresetsStore` | 매출 입력 프리셋 | localStorage |
| `useToast` | 토스트 알림 상태 | 메모리만 |
| `useTeamRole` | 팀 역할 (owner/editor/viewer) | 메모리만 |
| ... | ... | ... |

---

## 12. 커스텀 훅 — 재사용 가능한 로직

### 훅(Hook)이란?

React에서 `use`로 시작하는 함수. 상태 관리, 사이드 이펙트 등의 로직을 재사용 가능하게 만든 것.

### React 기본 훅

```tsx
// useState — 상태 관리 (값이 바뀌면 화면 자동 업데이트)
const [count, setCount] = useState(0);

// useEffect — 사이드 이펙트 (데이터 로드, 타이머 등)
useEffect(() => {
  // 컴포넌트가 화면에 나타날 때 실행
  fetchData();
}, []);  // 빈 배열 = 처음 한 번만 실행

// useCallback — 함수 메모이제이션 (불필요한 재생성 방지)
const handleClick = useCallback(() => {
  // ...
}, [dependency]);
```

### 커스텀 훅 — 우리가 만든 훅

파일: `src/hooks/useClosingData.ts` (간소화)

```tsx
export function useClosingData(storeId: string) {
  const [closings, setClosings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    if (!storeId) return;

    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("sb_daily_closing")
        .select("*")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .order("date", { ascending: false });

      setClosings(data || []);
      setLoading(false);
    };

    load();
  }, [storeId]);

  // 데이터 저장
  const saveClosing = async (closing) => {
    const supabase = createClient();
    await supabase.from("sb_daily_closing").upsert(closing);
    // ... 상태 업데이트
  };

  // 훅이 반환하는 값들
  return { closings, loading, saveClosing };
}
```

### 사용할 때

```tsx
// page.tsx — 훅을 호출하면 데이터 + 함수를 바로 사용 가능
function ClosingPage() {
  const { closings, loading, saveClosing } = useClosingData(storeId);

  if (loading) return <Spinner />;

  return (
    <div>
      {closings.map(c => <DailyReportCard key={c.id} data={c} />)}
      <button onClick={() => saveClosing(newData)}>저장</button>
    </div>
  );
}
```

**훅의 장점**: 데이터 로드/저장 로직을 한 곳에서 관리. 여러 페이지에서 같은 훅을 재사용 가능.

---

## 13. 모듈별 코드 흐름 완전 분석

### 모듈 ① 마감 리포트 — 전체 데이터 흐름

```
사용자: 숫자 키패드로 "1500000" 입력
    ↓
[NumericKeypad 컴포넌트]
  → onChange 콜백으로 숫자 전달
    ↓
[ClosingPage (page.tsx)]
  → useState로 totalSales = 1500000 저장
  → ChannelSlider로 채널별 비율 분배
  → FeeBreakdown으로 수수료 계산
    ↓
사용자: "저장" 버튼 클릭
    ↓
[useClosingData 훅]
  → saveClosing() 함수 실행
  → Supabase에 sb_daily_closing INSERT/UPDATE
  → sb_daily_closing_channels에 채널별 데이터 저장
    ↓
저장 완료 → 토스트 "저장되었습니다" 표시
    ↓
[분석 탭으로 전환]
  → useClosingAnalytics 훅이 데이터 집계
  → SalesChart, WeekdayHeatmap, MonthlyGoal 등에 데이터 전달
  → Recharts가 차트 렌더링
```

### 모듈 ③ 영수증 OCR — 전체 데이터 흐름

```
사용자: 카메라로 영수증 촬영
    ↓
[ReceiptCapture 컴포넌트]
  → 카메라 API (navigator.mediaDevices.getUserMedia)
  → Canvas로 이미지 캡처
  → imageUtils.ts에서 1920px 리사이즈 + 압축
  → Base64 문자열로 변환
    ↓
[CaptureFlowPanel 컴포넌트]
  → fetch("/api/receipt/ocr", { body: { image: base64 } })
    ↓
[API Route: /api/receipt/ocr]
  → 서버에서 인증 확인
  → Claude Vision API 호출 (이미지 전송)
  → Claude가 영수증 분석
  → JSON 응답: { storeName, date, amount, items, ... }
    ↓
[OcrResultCard 컴포넌트]
  → 인식 결과 표시 (수정 가능)
  → 카테고리 자동 분류
  → 사용자가 확인/수정 후 "저장"
    ↓
[useReceiptData 훅]
  → Supabase sb_receipts에 저장
  → 이미지를 Supabase Storage에 업로드
    ↓
[장부 탭]
  → ReceiptList에서 저장된 영수증 목록 표시
  → FilterBar로 기간/카테고리/결제수단 필터
  → ReceiptExport로 CSV/PDF 내보내기
```

### 모듈 ④ 리뷰 답글 — SSE 스트리밍 흐름

```
사용자: 리뷰 내용 + 별점 입력
    ↓
[ReviewInput 컴포넌트]
  → 플랫폼(배민/쿠팡), 별점, 리뷰 텍스트 수집
    ↓
사용자: "답글 생성" 클릭
    ↓
[page.tsx]
  → fetch("/api/review/generate")  (SSE 스트리밍)
    ↓
[API Route: /api/review/generate]
  → 톤 설정(sb_store_tone_settings) 조회
  → Claude Haiku API 호출 (스트리밍 모드)
  → ReadableStream으로 청크 단위 전송
    ↓
[GenerationProgress 컴포넌트]
  → EventSource로 스트리밍 수신
  → 글자가 하나씩 나타나는 타이핑 효과
    ↓
생성 완료
    ↓
[BlockEditor 컴포넌트]
  → 답글을 4개 블록으로 분리: [인사][내용 언급][감사][마무리]
  → 각 블록 개별 수정/재생성 가능
  → "복사하기" → 클립보드에 복사
```

### 모듈 ⑤ 주간 브리핑 — 데이터 집계 흐름

```
사용자: /briefing 페이지 접속
    ↓
[useBriefingData 훅]
  → 현재 주의 시작/끝 날짜 계산
  → 6개 aggregator 함수 병렬 실행:
    ├── aggregateSales()      → sb_daily_closing에서 매출 집계
    ├── aggregateFees()       → 수수료 데이터 집계
    ├── aggregateExpenses()   → sb_receipts에서 경비 집계
    ├── aggregateIngredients() → sb_daily_usage에서 식자재 집계
    ├── aggregateReputation() → sb_reviews에서 리뷰 집계
    └── aggregator.ts         → 위 5개를 합쳐서 통합 데이터 생성
    ↓
[BriefingCarousel 컴포넌트]
  → 6개 카드를 스와이프 캐러셀로 표시
  → SalesCard → FeeCard → ExpenseCard → IngredientCard
    → ReputationCard → CoachingCard
    ↓
[CoachingCard]
  → "AI 코칭 받기" 클릭
  → fetch("/api/briefing/coaching")
  → Claude AI가 경영 코칭 생성
  → 주간 목표 체크리스트 제공
```

---

## 14. 외부 API 연동

### Claude AI (Anthropic)

**용도**: 자연어 파싱, 리뷰 답글 생성, 경영 코칭, 영수증 OCR

```
브라우저 → API Route → Claude API → 결과 반환
```

| 기능 | 모델 | API Route |
|------|------|-----------|
| 자연어 매출 파싱 | claude-sonnet | `/api/closing/parse` |
| 영수증 OCR | claude-sonnet (vision) | `/api/receipt/ocr` |
| 리뷰 답글 생성 | claude-haiku (SSE) | `/api/review/generate` |
| 경영 코칭 | claude-sonnet | `/api/briefing/coaching` |
| 수수료 절감 팁 | claude-haiku | `/api/fees/tips` |
| 매출 예측 | claude-sonnet | `/api/forecast` |

### OpenWeatherMap

**용도**: 날씨 데이터 → 발주 추천 보정

```
/api/weather → OpenWeatherMap API → 날씨 데이터
→ 비 오면 배달 주문 증가 예상 → 발주량 보정
```

### Resend

**용도**: 이메일 발송 (주간 브리핑, 팀원 초대)

```
/api/briefing/email → Resend API → 사용자 이메일로 발송
```

### Web Push

**용도**: 브라우저 푸시 알림

```
사용자가 "알림 허용"
→ 브라우저가 구독 정보 생성 (VAPID 키)
→ /api/push/subscribe에 구독 정보 저장
→ /api/cron/push-notifications (매일 21시)
  → 저장된 구독 정보로 푸시 발송
```

---

## 15. 보안 — 어떻게 사이트를 보호하나?

### 1. 미들웨어 인증 가드

```
모든 HTTP 요청
    ↓
middleware.ts가 가로챔
    ↓
Supabase 토큰 확인
    ↓
인증 필요한 페이지인데 로그인 안 됨?
→ /login으로 강제 이동
```

### 2. CSP (Content Security Policy)

파일: `next.config.mjs`

```
브라우저에게 "이 출처의 리소스만 허용해"라고 알려주는 보안 헤더

script-src: 우리 사이트 + Cloudflare만 JavaScript 실행 가능
connect-src: 우리 사이트 + Supabase + Claude API만 통신 가능
img-src: 우리 사이트 + Supabase 이미지만 표시 가능

→ 해커가 악성 스크립트를 삽입해도 실행 불가!
```

### 3. RLS (Row Level Security)

```sql
-- Supabase에서 설정
-- "사용자는 자기 매장 데이터만 접근 가능"
-- 이 정책이 데이터베이스 레벨에서 강제됨

-- 아무리 브라우저를 조작해도 다른 사장님 데이터 못 봄!
```

### 4. API 키 보호

```
❌ NEXT_PUBLIC_ 접두사 = 브라우저에서 볼 수 있음
   → NEXT_PUBLIC_SUPABASE_URL (공개 가능한 것만)

✅ 접두사 없음 = 서버에서만 사용 가능
   → ANTHROPIC_API_KEY (절대 노출되면 안 됨!)
   → SUPABASE_SERVICE_ROLE_KEY
```

### 5. Rate Limiting (요청 제한)

파일: `src/lib/security/rateLimiter.ts`

```
같은 IP에서 짧은 시간에 너무 많은 요청?
→ 429 Too Many Requests 응답
→ 서버 부하 공격(DDoS) 방지
```

### 6. Cloudflare Turnstile (봇 방지)

```
회원가입/문의 페이지에 보이지 않는 봇 검증
→ 사람인지 봇인지 자동 판별
→ 봇이면 가입 차단
```

---

## 16. PWA — 앱처럼 동작하는 웹사이트

### PWA란?

**P**rogressive **W**eb **A**pp — 웹사이트인데 네이티브 앱처럼 동작하는 것.

### 설정 파일

파일: `public/manifest.json`

```json
{
  "name": "사장님비서 — AI 매장 운영 비서",
  "short_name": "사장님비서",
  "start_url": "/",
  "display": "standalone",        // 브라우저 UI 없이 앱처럼 표시
  "background_color": "#0C0C0A",  // 앱 로딩 화면 배경색
  "theme_color": "#F97316",       // 상태바 색상 (오렌지)
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

### Service Worker

파일: `next.config.mjs`의 `withPWA` 설정

```javascript
const withPWA = withPWAInit({
  dest: "public",                    // sw.js가 public 폴더에 생성됨
  disable: process.env.NODE_ENV === "development",  // 개발 중에는 비활성
  register: true,                    // 자동 등록
  skipWaiting: true,                 // 새 버전 즉시 적용
});
```

- Service Worker = 브라우저와 서버 사이에서 동작하는 프록시
- 오프라인일 때 캐시된 페이지 표시
- 푸시 알림 수신

### 홈 화면 추가

```
모바일 브라우저에서 "홈 화면에 추가" 선택
→ 앱 아이콘이 홈 화면에 생김
→ 탭하면 브라우저 없이 독립 앱으로 실행
→ 네이티브 앱과 거의 같은 경험!
```

---

## 17. 빌드와 배포 과정

### 개발 → 배포 전체 플로우

```
1. 로컬에서 코드 작성 (VS Code)
       ↓
2. npm run dev → 로컬 개발 서버 (http://localhost:3000)
       ↓ 개발/테스트 완료
3. git add + git commit + git push
       ↓
4. GitHub에 코드 올라감
       ↓ (자동)
5. Vercel이 GitHub 변경 감지
       ↓ (자동)
6. Vercel에서 npm run build 실행
       ↓
7. 빌드 성공 → 자동 배포
       ↓
8. https://ai-plan-lilac.vercel.app 에서 확인!
```

### npm run build가 하는 일

```
1. TypeScript 컴파일
   → .tsx/.ts 파일을 JavaScript로 변환
   → 타입 에러가 있으면 빌드 실패!

2. 정적 페이지 사전 생성 (Static Generation)
   → 변하지 않는 페이지 (랜딩, 약관 등)는 HTML로 미리 만듦
   → 서버 부하 ↓, 속도 ↑

3. 동적 페이지 준비 (Server-side Rendering)
   → 데이터가 필요한 페이지 (대시보드)는 요청 시 생성

4. CSS/JS 번들링 + 최적화
   → 여러 파일을 하나로 합치고 크기를 줄임 (minify)
   → 코드 분할 (Code Splitting) — 필요한 코드만 로드

5. 이미지/폰트 최적화
   → Next.js가 자동으로 최적화
```

### 빌드 결과 읽기

```
Route (app)                       Size     First Load JS
┌ ○ /                             5.6 kB       95 kB     ← 랜딩 (Static)
├ ○ /login                        2.96 kB      142 kB    ← 로그인 (Static)
├ ƒ /home                         9.2 kB       197 kB    ← 홈 (Dynamic)
├ ƒ /closing                      21.2 kB      330 kB    ← 마감 (Dynamic)
└ ƒ /order                        40.8 kB      377 kB    ← 발주 (Dynamic)

○ = Static (사전 생성) — 빠름!
ƒ = Dynamic (서버 렌더링) — 요청마다 생성
```

### 환경변수 관리

```
로컬 개발 → .env.local 파일 (git에 올리지 않음!)
Vercel 배포 → Vercel 대시보드에서 설정 (Settings > Environment Variables)

ANTHROPIC_API_KEY=sk-ant-xxx...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CRON_SECRET=xxx...
```

### Vercel Cron Jobs

파일: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/push-notifications",
      "schedule": "0 12 * * *"              // 매일 12:00 UTC = 21:00 KST
    },
    {
      "path": "/api/cron/expire-plans",
      "schedule": "0 15 * * *"              // 매일 15:00 UTC = 00:00 KST
    }
  ]
}
```

→ Vercel이 매일 정해진 시간에 자동으로 API를 호출합니다.

### 배포 후 확인 사항

```
1. 사이트 접속 확인 — https://ai-plan-lilac.vercel.app
2. 로그인/회원가입 테스트
3. 각 기능 동작 확인
4. 모바일 반응형 확인
5. 다크모드/라이트모드 전환
6. 콘솔 에러 확인 (F12 > Console)
```

---

## 18. 면접 대비 — 기술 질문 예상 답변

### Q1. "이 프로젝트에서 가장 어려웠던 기술적 도전은?"

**A: 글로벌 수수료 토글 시스템입니다.**

외식업에서는 "수수료 포함 매출"과 "수수료 미포함 매출"을 구분하는 것이 중요합니다. 토글 하나를 누르면 앱 전체(홈 대시보드, 마감 리포트, 수수료 분석, 브리핑)의 모든 금액이 동시에 변경되어야 했습니다.

Zustand의 `persist` 미들웨어를 사용해서 전역 상태를 관리하고, 모든 금액 표시 컴포넌트가 이 스토어를 구독하도록 설계했습니다. 수수료 계산 엔진은 배달앱 중개수수료, 카드 결제수수료, 배달대행 수수료의 이중 계산을 방지하는 로직도 포함됩니다.

### Q2. "180개 컴포넌트에 readOnly를 어떻게 적용했나?"

**A: 체계적인 분류 기준을 세웠습니다.**

모든 인터랙티브 요소를 3가지로 분류했습니다:
1. **쓰기 작업** (차단): 매출 입력, 데이터 저장, 삭제 버튼 → `readOnly` 시 숨김/비활성화
2. **필터/네비게이션** (유지): 탭 전환, 기간 필터, 정렬 → Viewer도 사용 가능
3. **개인 설정** (유지): 다크모드, 알림 설정 → 각자의 설정이므로 유지

`useTeamRole()` 훅이 현재 사용자의 역할을 반환하고, 페이지 레벨에서 `canEdit` 플래그를 컴포넌트에 전달하는 일관된 패턴을 사용했습니다.

### Q3. "SSE 스트리밍을 왜 사용했나?"

**A: 리뷰 답글 생성의 UX 개선을 위해서입니다.**

Claude API가 답글을 완성할 때까지 3~5초가 걸립니다. 일반 HTTP 요청으로는 그 동안 빈 화면만 보여서 사용자가 "멈춘 건가?" 생각할 수 있습니다.

SSE(Server-Sent Events)로 스트리밍하면 글자가 하나씩 나타나는 타이핑 효과를 보여줄 수 있어, 체감 대기 시간이 대폭 줄어듭니다. API Route에서 `ReadableStream`을 생성하고, 클라이언트에서 `EventSource`로 수신하는 구조입니다.

### Q4. "보안은 어떻게 처리했나?"

**A: 6중 보안 레이어를 적용했습니다.**

1. **미들웨어 인증 가드**: 모든 요청을 가로채서 세션 확인
2. **CSP 헤더**: 허용된 출처만 리소스 로드 가능 (XSS 방지)
3. **RLS**: 데이터베이스 레벨에서 사용자별 데이터 격리
4. **서버 사이드 API 키**: 민감한 키는 브라우저에 절대 노출되지 않음
5. **Rate Limiting**: IP 기반 요청 제한 (DDoS 방지)
6. **Cloudflare Turnstile**: 회원가입 시 봇 방지

### Q5. "Next.js App Router를 선택한 이유는?"

**A: 프론트엔드와 백엔드를 하나의 프로젝트에서 관리할 수 있기 때문입니다.**

기존에는 React(프론트) + Express(백엔드)처럼 별도 프로젝트가 필요했지만, Next.js의 API Routes를 사용하면 같은 프로젝트 안에서 서버 로직을 작성할 수 있습니다. 배포도 Vercel 하나면 충분합니다.

또한 App Router는 파일 기반 라우팅, 서버 컴포넌트, 스트리밍, 미들웨어 등 최신 기능을 제공하여 생산성이 높습니다.

### Q6. "이 프로젝트를 개선한다면?"

**A: 3가지를 개선하겠습니다.**

1. **테스트 코드 추가**: 현재 단위 테스트가 부족합니다. 수수료 계산 엔진, 발주 추천 알고리즘 등 핵심 비즈니스 로직에 Vitest 테스트를 추가하겠습니다.
2. **결제 시스템 연동**: Toss Payments 또는 Stripe 연동으로 Pro/Pro+ 플랜 구독 기능
3. **실시간 알림**: Supabase Realtime을 활용해서 팀원이 데이터를 수정하면 다른 팀원에게 실시간 알림

---

## 부록: 주요 파일 빠른 참조

| 무엇을 보고 싶으면 | 이 파일을 보세요 |
|------------------|----------------|
| 전체 설정/보안 헤더 | `next.config.mjs` |
| 메타태그/SEO | `src/app/layout.tsx` |
| 다크모드 CSS 변수 | `src/app/globals.css` |
| 인증 가드 | `src/middleware.ts` |
| DB 타입 정의 | `src/lib/supabase/types.ts` |
| 수수료 계산 로직 | `src/lib/fees/calculator.ts` |
| 발주 추천 알고리즘 | `src/lib/order/recommend.ts` |
| 마감 페이지 | `src/app/(dashboard)/closing/page.tsx` |
| 발주 페이지 | `src/app/(dashboard)/order/page.tsx` |
| 영수증 OCR API | `src/app/api/receipt/ocr/route.ts` |
| 리뷰 생성 API (SSE) | `src/app/api/review/generate/route.ts` |
| 브리핑 데이터 집계 | `src/lib/briefing/aggregator.ts` |
| Zustand 스토어 예시 | `src/stores/useFeeToggle.ts` |
| 커스텀 훅 예시 | `src/hooks/useClosingData.ts` |

---

> 이 가이드를 순서대로 읽으면서 실제 파일을 열어보면 프로젝트 전체를 이해할 수 있습니다.
> 궁금한 부분이 있으면 해당 파일을 직접 읽어보세요!
