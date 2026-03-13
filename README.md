<div align="center">

# 사장님비서 (Sajang-Biseo)

### AI 기반 올인원 매장 운영 비서 웹앱

**매일 밤 1시간 걸리던 마감 업무를 5분으로.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-D4A574?logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://vercel.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)]()

[Live Demo](https://ai-plan-lilac.vercel.app) · [Features](#-핵심-기능-5대-모듈) · [Tech Stack](#-기술-스택) · [Architecture](#-시스템-아키텍처)

</div>

---

## 목차

- [프로젝트 소개](#-프로젝트-소개)
- [핵심 기능 5대 모듈](#-핵심-기능-5대-모듈)
- [부가 기능](#-부가-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 기술적 도전과 해결](#-주요-기술적-도전과-해결)
- [보안](#-보안)
- [시작하기](#-시작하기)
- [요금제](#-요금제)

---

## 📋 프로젝트 소개

### 문제 인식

외식업 사장님들은 매일 밤 영업 종료 후 **마감 정산, 재고 확인, 경비 정리, 리뷰 응대** 등 반복적인 운영 업무에 1시간 이상을 소비합니다. 대부분 수기 노트나 엑셀로 관리하며, 데이터 기반 의사결정은 거의 이루어지지 않습니다.

### 솔루션

**사장님비서**는 이 모든 업무를 하나의 앱으로 통합하고, AI가 자동화하여 **5분 안에 마감**할 수 있게 합니다.

### 타겟 유저

| 유저 | 특징 |
|------|------|
| **개인 음식점 사장님** | 테이블 10~30개, 직원 0~3명 |
| **프랜차이즈 점주** | 1~3개 매장 운영 |
| **연령대** | 40~60대 (큰 폰트, 직관적 UI) |

### 핵심 가치

| | 기존 | 사장님비서 |
|---|---|---|
| **마감 정산** | 30분+ (엑셀/수기) | 30초 (숫자 키패드) |
| **식자재 발주** | 감으로 발주 → 폐기 발생 | AI 추천 → 폐기율 30%↓ |
| **경비 관리** | 영수증 박스 보관 | 촬영 → AI OCR → 자동 분류 |
| **리뷰 응대** | 1건당 10분 고민 | AI가 말투 학습 → 3초 생성 |
| **경영 분석** | 감으로 판단 | 주간 AI 브리핑 + 코칭 |

---

## 🚀 핵심 기능 5대 모듈

### 모듈 ① 마감 리포트

> 30초 매출 입력으로 자동 정산 및 분석 리포트 생성

**매출 입력 (3가지 모드)**
- **숫자 키패드**: 64px 높이 대형 버튼, 프리셋 원터치 입력 (평일/주말 기본값)
- **음성 입력**: Web Speech API 기반 — "오늘 매출 187만, 홀 120만, 배민 40만..."
- **자유 텍스트**: Claude AI가 자연어를 파싱하여 자동 분배

**채널별 매출 분배**
- 슬라이더 모드: 드래그로 비율 조절 (홀/배민/쿠팡이츠/요기요/포장 등)
- 직접 입력 모드: 채널별 금액 직접 입력
- 결제수단 비율: 카드/현금 분리

**수수료 자동 계산**
- 배달앱 중개수수료, 카드 결제수수료, 배달대행 수수료 자동 산출
- **수수료 포함/미포함 토글**: 앱 전체에 글로벌 적용 (Zustand)

**분석 대시보드**
- 요일별 매출 히트맵 (평일/주말 패턴 시각화)
- 주간/월간 매출 추이 차트 (Recharts)
- 전일/전주 대비 비교 (상승/하락 인디케이터)
- 월 목표 매출 설정 + 달성률 프로그레스 바
- 수익/비용 추이 트렌드
- 캘린더 뷰 (월간 일별 매출 한눈에)

**데이터 내보내기**
- CSV (필터 적용 가능)
- PDF (월간/연간 리포트, html2canvas + jsPDF)

**데이터베이스**: `sb_daily_closing`, `sb_daily_closing_channels`, `sb_store_fee_settings`, `sb_fee_channels`

---

### 모듈 ② AI 발주 추천

> 매출/날씨/사용량 기반 식자재 발주 최적화 — 폐기는 줄이고, 품절은 막고

**초기 세팅**
- 업종 선택 시 업종별 기본 식자재 템플릿 자동 로드 (한식/중식/일식/양식/카페 등 12종)
- 품목별 카테고리, 단위, 단가, 유통기한, 거래처 설정
- 품목 검색/추가/편집 (인라인 편집 + 모달)

**일일 사용량 입력**
- 프리셋 원터치 (평일/주말 기본)
- +/- 스테퍼 (0.5 단위 증감)
- 재고 자동 계산 (전일 잔여 + 입고 - 사용 - 폐기)
- 폐기량 별도 기록
- 미저장 이탈 방지 (useUnsavedGuard)

**AI 발주 추천 알고리즘**
```
추천 발주량 = (4주 평균 사용량 × 날씨 보정 계수 × 매출 추세 계수)
              - 현재 재고 + 안전 재고
```
- OpenWeatherMap API 날씨 데이터 연동
- 발주 충분/부족 상태 색상 표시
- 발주서 자동 생성 (거래처별 그룹핑)
- 카카오톡/문자 복사 기능

**분석 탭 (5개 섹션, 아코디언 UI)**
- 품목별 사용량 추이 차트 (30일)
- 식자재비 원가율 (업종 평균 대비 비교)
- 폐기 분석 (총 폐기 금액 + TOP5 품목)
- 유통기한 알림 (임박 품목 경고)
- 단가 변동 이력 (가격 변동 추적)

**입고 기록**
- 발주 입고 확인 + 단가 업데이트
- 거래처 관리 (연락처/메모)

**데이터베이스**: `sb_order_items`, `sb_order_item_groups`, `sb_daily_usage`, `sb_order_recommendations`

---

### 모듈 ③ 영수증 AI 경비 장부

> 영수증 촬영 → Claude Vision OCR → 자동 분류 → 세무 자료 완성

**촬영 & OCR 인식**
- 카메라 촬영 또는 갤러리 선택
- 여러 장 연속 촬영 (배치 모드)
- **Claude Vision API** OCR 자동 인식
- 인식 항목: 날짜, 가맹점명, 총 금액, 부가세, 결제수단, 품목 내역, 카드 끝자리
- 신뢰도 표시 (낮으면 "확인 필요" 배지)
- 이미지 자동 리사이즈 (최대 1920px) + 압축

**10가지 경비 카테고리**
| 코드 | 카테고리 | 코드 | 카테고리 |
|------|---------|------|---------|
| F01 | 식재료비 | F06 | 마케팅비 |
| F02 | 소모품비 | F07 | 보험료 |
| F03 | 수선유지비 | F08 | 통신비 |
| F04 | 임대료 | F09 | 교통비 |
| F05 | 공과금 | F10 | 인건비 |

- AI 자동 분류 + 사장님 수정 가능
- 같은 가맹점 반복 학습

**장부 조회 & 필터**
- 기간 필터: 이번 달/이번주/오늘/직접 입력
- 카테고리 체크박스 필터
- 결제수단/금액범위/요일 필터
- 날짜별/카테고리별 그룹핑
- 카테고리별 예산 설정 + 사용률 프로그레스

**내보내기**
- CSV (필터 결과 반영)
- 월간 요약 PDF (카테고리별 + 일별)
- 영수증 원본 이미지 모음 PDF

**알림**
- 3일 미입력 리마인드
- 전년도 대비 20% 증가 경고
- 부가세 신고 시즌 알림 (1월/7월)
- 종합소득세 시즌 알림 (5월)

**데이터베이스**: `sb_receipts`, `sb_receipt_categories` + Supabase Storage (`sajang-receipts` 버킷)

---

### 모듈 ④ 리뷰 답글 생성기

> 사장님 말투를 AI가 학습 → 블록 편집 → 복사해서 배민/쿠팡 바로 붙여넣기

**톤 학습 시스템**
- 기존 답글 3~5개 입력 → 사장님 말투 패턴 학습
- 매장 정보 등록 (매장명/대표 메뉴/특징)
- 톤 프리셋: 친근한/정중한/유머러스/커스텀
- 이모지 사용 여부 토글

**답글 생성 (SSE 스트리밍)**
- 플랫폼 선택 (배민/쿠팡이츠/네이버)
- 별점 + 리뷰 내용 입력
- Claude Haiku 기반 **실시간 스트리밍** 생성 (SSE)
- 1~3가지 버전 동시 생성

**블록형 편집기**
```
[인사] 안녕하세요, OO 사장입니다!
[리뷰 내용 언급] 말씀하신 된장찌개가 맛있으셨다니...
[감사/해명] 정말 감사합니다 / 죄송합니다...
[마무리] 다음에도 맛있게 준비하겠습니다!
```
- 각 블록 개별 재생성/직접 수정
- 톤 조절 칩: "더 정중하게", "더 짧게", "사과 톤 추가"
- 블록 순서 드래그, 블록 삭제
- 전체 합쳐서 "복사하기" → 클립보드

**리뷰 대시보드**
- 답글 완료/미완료 리스트
- 별점별 리뷰 분포 (1~5점 막대그래프)
- 자주 언급되는 키워드 워드 클라우드
- 부정 리뷰 우선 표시 (빨간 배지)
- 월간 리뷰 트렌드

**저장된 템플릿**: 자주 쓰는 답글 템플릿 저장/불러오기

**데이터베이스**: `sb_reviews`, `sb_review_replies`, `sb_store_tone_settings`

---

### 모듈 ⑤ 주간 경영 브리핑

> 바쁜 사장님이 3분 안에 지난주 요약 + AI 코칭으로 다음 주 전략 수립

**6장 카드 캐러셀 (스와이프)**

| # | 카드 | 주요 데이터 |
|---|------|-----------|
| 1 | **매출 요약** | 총/순매출, 일평균, 전주 대비, 요일별 그래프, 채널별 비중 |
| 2 | **수수료 분석** | 총 수수료, 매출 대비 비율, 채널별 상세, 절감 팁 |
| 3 | **비용 분석** | 총 경비, 원가율, 식재료/소모품/인건비 비중, 전주 대비 |
| 4 | **식자재 효율** | 주간 폐기 금액, 폐기율, 발주 적중률, TOP3 폐기 품목 |
| 5 | **고객 평판** | 주간 리뷰 수, 평균 별점, 답글 완료율, 긍정/부정 키워드 |
| 6 | **AI 경영 코칭** | 핵심 인사이트, 이번 주 실행 제안 3~4개, 목표 체크리스트 |

**부가 기능**
- 각 카드 이미지로 저장 (SNS 공유)
- 전체 PDF 다운로드
- 이메일 발송 (Resend API)
- 과거 브리핑 아카이브 (주 단위 히스토리)

**데이터**: 5개 모듈 데이터를 실시간 집계 (aggregator 패턴)

---

## 🔧 부가 기능

### 수수료 분석 대시보드

- **수수료 설정**: 배달앱/카드/배달대행 플랫폼별 비율 커스텀
- **월간 리포트**: 월별 수수료 추이 차트 + 채널별 비중
- **수수료 시뮬레이터**: "배민을 쿠팡으로 옮기면 얼마나 절감?" 시뮬레이션
- **AI 절감 팁**: Claude 기반 개인화된 절감 제안
- **정산일 일정**: 배달앱별 정산일 표시
- **수익성 테이블**: 채널별 총매출/수수료/순매출 비교

### 홈 대시보드

- **오늘의 요약**: 매출/마감 상태, 미완료 작업 배지
- **AI 매출 예측**: 최근 7일+ 데이터 기반 향후 7일 매출 예측 (Claude AI)
- **일일 메모**: 오늘 한 줄 메모
- **다매장 비교**: 매장별 매출 한눈에 비교 (Pro+)
- **공지사항 배너**: 서비스 공지 표시

### 팀 협업 시스템

- **팀원 초대**: 이메일로 초대 발송 → 수락 플로우
- **역할 관리**: Owner (전체 권한) / Editor (입력 가능) / Viewer (조회만)
- **readOnly 강제 적용**: Viewer 역할 시 모든 입력 필드/버튼 비활성화 (180+ 컴포넌트 대응)
- **매장 전환**: 여러 매장 사이 원터치 전환 (StoreSwitcher)

### 관리자 패널 (Admin)

- **대시보드**: 총 사용자/매장/매출 통계
- **사용자 관리**: 플랜 변경, 계정 상세 조회
- **활동 로그**: 전체 사용자 활동 추적
- **매출 분석**: 서비스 전체 매출 현황
- **코호트 분석**: 사용자 리텐션 분석
- **기능 사용 히트맵**: 어떤 기능이 많이 사용되는지
- **고객 지원 티켓**: 문의 관리
- **공지사항/쿠폰/팀/푸시 관리**

### PWA (Progressive Web App)

- 홈 화면 추가 설치 (iOS/Android)
- 오프라인 기본 지원 (Service Worker)
- 독립형 앱 모드 (standalone)
- iOS 설치 안내 프롬프트 (IOSInstallPrompt)

### 푸시 알림

- Web Push API 기반
- 매일 21:00 KST 마감 리마인드 (Vercel Cron)
- 테스트 푸시 발송 기능
- 구독/해제 관리

---

## 🛠 기술 스택

### Frontend

| 기술 | 용도 |
|------|------|
| **Next.js 14** (App Router) | 풀스택 프레임워크, SSR/SSG, API Routes |
| **TypeScript 5** | 전체 코드베이스 타입 안전성 |
| **React 18** | 컴포넌트 기반 UI |
| **Tailwind CSS 3** | 유틸리티 기반 스타일링 + 커스텀 디자인 토큰 |
| **Framer Motion** | 페이지 전환, 카운트업, 스와이프 등 모든 애니메이션 |
| **Recharts** | 매출/사용량/수수료 차트 |
| **Zustand** | 12개 글로벌 상태 스토어 |
| **React Hook Form + Zod** | 폼 관리 + 스키마 유효성 검증 |
| **html2canvas + jsPDF** | 리포트 PDF/이미지 내보내기 |
| **Lucide React** | 일관된 아이콘 시스템 |

### Backend & Infrastructure

| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL + Auth + RLS + Storage |
| **Vercel** | 배포, Serverless Functions, Cron Jobs |
| **Anthropic Claude API** | 텍스트 생성, 자연어 파싱, 경영 코칭 |
| **Claude Vision API** | 영수증 OCR 이미지 인식 |
| **OpenWeatherMap API** | 날씨 데이터 (발주 추천 보정) |
| **Resend** | 이메일 발송 (주간 브리핑/팀 초대) |
| **Web Push** | 브라우저 푸시 알림 |
| **Cloudflare Turnstile** | 봇 방지 (회원가입/문의) |

### Design System

| 항목 | 상세 |
|------|------|
| **테마** | 다크모드 기본 (`#0C0C0A` 따뜻한 검은색), 라이트모드 지원 |
| **타이포그래피** | Plus Jakarta Sans (숫자/금액), Pretendard (한국어) |
| **컬러** | 따뜻한 앰버/오렌지 (`#F97316`) 포인트 + 딥 네이비 |
| **글래스모피즘** | `glass-card` — 반투명 배경 + blur + 미묘한 그림자 |
| **애니메이션** | 모든 전환에 Framer Motion, 숫자 카운트업, 스켈레톤 로딩 |
| **모바일 우선** | 모든 화면 375px~ 반응형, 데스크탑 사이드바 |

---

## 🏗 시스템 아키텍처

```
┌──────────────────────────────────────────────────────┐
│                    Client (PWA)                       │
│  Next.js 14 App Router + React 18 + TypeScript       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Closing  │ │  Order  │ │ Receipt │ │ Review  │   │
│  │ Module   │ │ Module  │ │ Module  │ │ Module  │   │
│  └────┬─────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │            │           │            │        │
│  ┌────┴────────────┴───────────┴────────────┴────┐   │
│  │           Zustand Stores (12개)                │   │
│  │  FeeToggle · StoreSettings · Theme · Toast ... │   │
│  └────────────────────┬──────────────────────────┘   │
│                       │                              │
│  ┌────────────────────┴──────────────────────────┐   │
│  │          Custom Hooks (20개)                    │   │
│  │  useClosingData · useOrderAnalytics · ...      │   │
│  └────────────────────┬──────────────────────────┘   │
└───────────────────────┼──────────────────────────────┘
                        │ fetch / Supabase Client
┌───────────────────────┼──────────────────────────────┐
│              API Routes (34개)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ /api/    │ │ /api/    │ │ /api/    │             │
│  │ closing  │ │ receipt  │ │ review   │  ...        │
│  │ /parse   │ │ /ocr     │ │/generate │             │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘             │
│       │            │            │                    │
│  ┌────┴────────────┴────────────┴────────────────┐   │
│  │              External APIs                     │   │
│  │  Claude AI · Claude Vision · Weather · Resend  │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │              Supabase                          │   │
│  │  PostgreSQL (RLS) · Auth · Storage · Realtime  │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
sajang-biseo/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # 인증 (로그인/회원가입/비밀번호 초기화)
│   │   ├── (dashboard)/               # 메인 대시보드 (7개 페이지)
│   │   │   ├── home/                  #   홈 (오늘의 요약)
│   │   │   ├── closing/               #   마감 리포트
│   │   │   ├── order/                 #   AI 발주 추천
│   │   │   ├── receipt/               #   영수증 경비 장부
│   │   │   ├── review/                #   리뷰 답글 생성기
│   │   │   ├── briefing/              #   주간 경영 브리핑
│   │   │   ├── fees/                  #   수수료 분석
│   │   │   ├── settings/              #   매장 설정
│   │   │   └── DashboardShell.tsx     #   공통 레이아웃 (Header/Nav/Sidebar)
│   │   ├── (legal)/                   # 이용약관/개인정보처리방침
│   │   ├── admin/                     # 관리자 대시보드
│   │   ├── api/                       # API 엔드포인트 (34개)
│   │   │   ├── closing/parse/         #   자연어 매출 파싱
│   │   │   ├── forecast/              #   AI 매출 예측
│   │   │   ├── receipt/ocr/           #   영수증 OCR
│   │   │   ├── review/generate/       #   리뷰 답글 생성 (SSE)
│   │   │   ├── briefing/              #   AI 코칭 + 이메일 발송
│   │   │   ├── fees/tips/             #   수수료 절감 팁
│   │   │   ├── push/                  #   푸시 알림
│   │   │   ├── cron/                  #   정기 작업 (21:00 알림)
│   │   │   ├── admin/                 #   관리자 API (11개)
│   │   │   ├── team/                  #   팀 관리/초대
│   │   │   ├── stores/                #   매장 관리
│   │   │   └── ...                    #   기타 (날씨/쿠폰/문의/로그)
│   │   ├── onboarding/                # 온보딩 (매장/수수료 초기 설정)
│   │   ├── page.tsx                   # 랜딩 페이지
│   │   ├── layout.tsx                 # 루트 레이아웃 (PWA 메타태그)
│   │   └── globals.css                # 글로벌 스타일 (Glass Morphism 등)
│   │
│   ├── components/                    # 180+ 컴포넌트
│   │   ├── shared/          (14개)    # 공통 (NumericKeypad/FeeToggle/PlanGate...)
│   │   ├── layout/          (3개)     # Header/BottomNav/Sidebar
│   │   ├── closing/         (25개)    # 마감 모듈
│   │   ├── order/           (28개)    # 발주 모듈
│   │   ├── receipt/         (14개)    # 영수증 모듈
│   │   ├── review/          (9개)     # 리뷰 모듈
│   │   ├── briefing/        (8개)     # 브리핑 모듈
│   │   ├── fees/            (8개)     # 수수료 모듈
│   │   ├── home/            (5개)     # 홈 대시보드
│   │   ├── settings/        (13개)    # 설정 (13개 섹션)
│   │   ├── landing/         (9개)     # 랜딩 페이지
│   │   ├── admin/           (12개)    # 관리자 컴포넌트
│   │   └── onboarding/      (2개)     # 온보딩 스텝
│   │
│   ├── hooks/                         # 20개 커스텀 훅
│   │   ├── useClosingData.ts          #   마감 데이터 CRUD
│   │   ├── useClosingAnalytics.ts     #   마감 분석 (요일별/주간/월간)
│   │   ├── useOrderData.ts           #   발주 데이터 CRUD
│   │   ├── useOrderAnalytics.ts      #   발주 분석 (사용량/폐기/원가율)
│   │   ├── useReceiptData.ts         #   영수증 데이터 CRUD
│   │   ├── useReviewData.ts          #   리뷰 데이터 CRUD
│   │   ├── useBriefingData.ts        #   브리핑 데이터 집계
│   │   ├── useFeesData.ts            #   수수료 데이터
│   │   ├── useTeamRole.ts            #   팀 역할 (owner/editor/viewer)
│   │   ├── useVoiceInput.ts          #   Web Speech API 음성 입력
│   │   ├── useCountUp.ts             #   숫자 카운트업 애니메이션
│   │   ├── usePushNotification.ts    #   웹 푸시 알림
│   │   ├── useNetworkStatus.ts       #   온/오프라인 감지
│   │   └── ...                        #   기타
│   │
│   ├── stores/                        # 12개 Zustand 스토어
│   │   ├── useFeeToggle.ts           #   수수료 포함/미포함 (글로벌)
│   │   ├── useStoreSettings.ts       #   현재 매장 정보
│   │   ├── useThemeStore.ts          #   다크모드
│   │   ├── usePresetsStore.ts        #   매출 입력 프리셋
│   │   └── ...                        #   기타
│   │
│   ├── lib/                           # 40+ 유틸리티
│   │   ├── supabase/                  #   Supabase 클라이언트 (client/server/admin)
│   │   ├── fees/                      #   수수료 계산 엔진 (배달앱/카드/대행)
│   │   ├── order/                     #   발주 추천 알고리즘
│   │   ├── briefing/                  #   브리핑 데이터 집계 (6개 aggregator)
│   │   ├── receipt/                   #   영수증 처리 (카테고리/CSV/이미지)
│   │   ├── review/                    #   답글 블록 타입
│   │   ├── security/                  #   보안 (Rate Limit/Turnstile/검증)
│   │   ├── push/                      #   Web Push 전송
│   │   ├── team/                      #   팀 접근 권한/이메일
│   │   ├── export/                    #   PDF 생성
│   │   └── utils/                     #   포맷팅/날짜/검증
│   │
│   ├── types/                         # 타입 정의
│   └── middleware.ts                  # 인증 미들웨어 + 관리자 가드
│
├── public/
│   ├── manifest.json                  # PWA 매니페스트
│   ├── icons/                         # 앱 아이콘 (192/512/SVG)
│   └── sw.js                          # Service Worker (자동 생성)
│
├── next.config.mjs                    # PWA + CSP 보안 헤더
├── tailwind.config.ts                 # 커스텀 디자인 토큰
├── tsconfig.json                      # TypeScript 설정
└── package.json                       # 의존성 관리
```

---

## 💡 주요 기술적 도전과 해결

### 1. 글로벌 수수료 토글 시스템

**문제**: 매출 데이터를 "수수료 포함(총매출)" 또는 "수수료 미포함(순매출)"으로 전환할 때, 앱 전체의 모든 금액/차트/분석이 동시에 변경되어야 합니다.

**해결**: Zustand `useFeeToggle` 스토어로 글로벌 상태 관리. 모든 금액 표시 컴포넌트가 이 스토어를 구독하여 토글 시 즉시 반영. 수수료 계산 엔진(`fees/calculator.ts`)이 배달앱 중개수수료, 카드 결제수수료, 배달대행 수수료의 이중 계산을 방지합니다.

### 2. 음성/자연어 입력 → 구조화 데이터

**문제**: "오늘 매출 187만, 홀 120만, 배민 40만, 현금 15만" 같은 자유 텍스트를 정확한 매출 데이터로 변환해야 합니다.

**해결**: Web Speech API로 음성 → 텍스트 변환 후, Claude API가 자연어를 파싱하여 JSON 구조로 변환. 채널별 금액, 결제수단 비율을 자동 분배합니다.

### 3. 리뷰 답글 SSE 스트리밍

**문제**: Claude AI가 답글을 생성할 때 완성까지 기다리면 사용자 경험이 나쁩니다.

**해결**: Server-Sent Events(SSE)로 실시간 스트리밍 구현. API Route에서 `ReadableStream`을 생성하고, 클라이언트에서 `EventSource`로 수신하여 타이핑 효과로 표시합니다.

### 4. 180+ 컴포넌트 역할 기반 접근 제어

**문제**: Viewer 역할 사용자에게 모든 입력 필드와 액션 버튼을 비활성화해야 합니다. 필터/네비게이션 같은 조회 기능은 유지하면서 쓰기 기능만 차단해야 합니다.

**해결**: `useTeamRole()` 훅으로 `canEdit`/`isViewer` 상태를 제공하고, 각 컴포넌트에 `readOnly` prop을 전달하는 패턴을 모든 모듈에 일관되게 적용. 쓰기(차단) vs 필터/네비게이션(유지) vs 개인 설정(유지)으로 분류하여 처리했습니다.

### 5. 브리핑 데이터 집계 (Aggregator 패턴)

**문제**: 주간 브리핑은 5개 모듈(마감/발주/영수증/리뷰/수수료)의 데이터를 실시간으로 집계해야 합니다.

**해결**: `lib/briefing/` 아래 6개 전용 aggregator 함수를 구현하여 각 모듈 데이터를 독립적으로 집계한 뒤, `aggregator.ts`가 통합합니다. 각 aggregator는 Supabase 쿼리를 최적화하여 필요한 범위만 조회합니다.

### 6. 발주 추천 알고리즘

**문제**: 단순 평균이 아닌, 날씨/요일/매출 트렌드를 반영한 정확한 발주량 예측이 필요합니다.

**해결**: 4주 이동평균 + 날씨 보정 계수(OpenWeatherMap API) + 매출 추세 가중치를 조합한 추천 알고리즘 구현. 유통기한/안전재고를 고려하여 발주 부족/충분 상태를 판단합니다.

### 7. 영수증 OCR + 이미지 최적화

**문제**: 모바일 카메라로 촬영한 고해상도 영수증 이미지를 빠르게 OCR 처리해야 합니다.

**해결**: 클라이언트에서 Canvas API로 1920px 리사이즈 + 품질 압축 후 전송. Claude Vision API가 OCR 인식하고 신뢰도를 판단하여 낮은 항목은 "확인 필요" 표시. Supabase Storage에 원본 이미지 보관합니다.

---

## 🔒 보안

### HTTP 보안 헤더

| 헤더 | 설정 | 목적 |
|------|------|------|
| Content-Security-Policy | 13개 디렉티브 | XSS/인젝션 방지 |
| X-Frame-Options | DENY | 클릭재킹 방지 |
| X-Content-Type-Options | nosniff | MIME 스니핑 방지 |
| Strict-Transport-Security | max-age=31536000 | HTTPS 강제 (1년) |
| Referrer-Policy | strict-origin-when-cross-origin | Referrer 노출 제한 |
| Permissions-Policy | camera=(self) | 브라우저 API 권한 제어 |

### 인증 & 권한

- **Supabase Auth**: 이메일 + 비밀번호 기반 인증
- **이메일 검증 필수**: 미인증 시 `/verify-email`로 리다이렉트
- **RLS (Row Level Security)**: PostgreSQL 레벨에서 사용자별 데이터 격리
- **미들웨어 가드**: 인증/미인증/관리자 경로 자동 분기
- **팀 역할 기반 접근 제어**: Owner / Editor / Viewer 3단계

### 봇 방지 & API 보호

- **Cloudflare Turnstile**: 회원가입/문의 폼에 적용
- **일회용 이메일 차단**: 300+ 도메인 블랙리스트
- **Rate Limiting**: IP 기반 API 요청 제한
- **서버 사이드 API 키**: Claude/Weather API 키는 서버에서만 사용

---

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Supabase 프로젝트
- Anthropic API Key (Claude)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yenooooooo/Ai-plan.git
cd Ai-plan/sajang-biseo

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude AI
ANTHROPIC_API_KEY=your_anthropic_key

# OpenWeatherMap (발주 추천용)
OPENWEATHER_API_KEY=your_weather_key

# Resend (이메일 발송)
RESEND_API_KEY=your_resend_key

# Cloudflare Turnstile (봇 방지)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Web Push (푸시 알림)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public
VAPID_PRIVATE_KEY=your_vapid_private

# Admin
ADMIN_EMAILS=admin@example.com

# Cron Secret
CRON_SECRET=your_cron_secret
```

### 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인

### 빌드 & 배포

```bash
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
```

Vercel에 자동 배포 설정되어 있습니다.

---

## 💰 요금제

| 기능 | Free | Pro (₩9,900/월) | Pro+ (₩24,900/월) |
|------|:----:|:----:|:----:|
| 마감 리포트 | 기본 | 무제한 | 무제한 |
| 수수료 계산기 | O | O | O |
| AI 발주 추천 | X | O | O |
| 영수증 OCR | 월 5장 | 월 100장 | 무제한 |
| 리뷰 답글 | 월 3건 | 월 50건 | 무제한 |
| 주간 브리핑 | 열람만 | 열람 + 알림 | 열람 + 이메일 |
| AI 경영 코칭 | X | O | O |
| CSV/PDF 내보내기 | X | O | O |
| 매출 예측 | X | X | O |
| 매장 수 | 1개 | 3개 | 무제한 |
| 다매장 대시보드 | X | X | O |
| 직원 계정 | X | X | 매장당 3명 |
| 우선 지원 | X | X | O |

---

## 📊 프로젝트 규모

| 항목 | 수량 |
|------|------|
| 총 컴포넌트 | **180+** |
| API 엔드포인트 | **34** |
| 커스텀 훅 | **20** |
| Zustand 스토어 | **12** |
| 유틸리티 모듈 | **40+** |
| 데이터베이스 테이블 | **15+** |
| 지원 업종 템플릿 | **12** |

---

<div align="center">

**사장님비서** — 외식업 사장님의 매장 운영을 AI로 자동화하는 올인원 비서

Made with Next.js · TypeScript · Supabase · Claude AI

</div>
