"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ClipboardList, ShoppingCart, Receipt, MessageSquare,
  BarChart3, ArrowRight, ArrowLeft, TrendingUp,
  Star, Camera, Sparkles, CalendarDays,
} from "lucide-react";

/* ── 데모 탭 ── */
const TABS = [
  { id: "home", label: "홈", icon: Home },
  { id: "closing", label: "마감", icon: ClipboardList },
  { id: "order", label: "발주", icon: ShoppingCart },
  { id: "receipt", label: "경비", icon: Receipt },
  { id: "review", label: "리뷰", icon: MessageSquare },
  { id: "briefing", label: "브리핑", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ── 더미 데이터 ── */
const WEEKLY_SALES = [
  { day: "월", amount: 1520000 },
  { day: "화", amount: 1340000 },
  { day: "수", amount: 1680000 },
  { day: "목", amount: 1450000 },
  { day: "금", amount: 2010000 },
  { day: "토", amount: 2340000 },
  { day: "일", amount: 1980000 },
];

const CHANNELS = [
  { name: "홀", ratio: 62, amount: 1227600, color: "bg-blue-500" },
  { name: "배민", ratio: 22, amount: 435600, color: "bg-orange-500" },
  { name: "쿠팡이츠", ratio: 10, amount: 198000, color: "bg-emerald-500" },
  { name: "포장", ratio: 6, amount: 118800, color: "bg-violet-500" },
];

const ORDER_ITEMS = [
  { name: "양파", stock: 3, unit: "kg", recommend: 10, status: "부족" },
  { name: "돼지고기 (목살)", stock: 8, unit: "kg", recommend: 5, status: "충분" },
  { name: "대파", stock: 1, unit: "단", recommend: 5, status: "긴급" },
  { name: "두부", stock: 12, unit: "모", recommend: 0, status: "충분" },
  { name: "고춧가루", stock: 2, unit: "kg", recommend: 3, status: "부족" },
];

const RECEIPTS = [
  { date: "03/28", store: "농협 하나로마트", amount: 187500, category: "식재료비" },
  { date: "03/27", store: "GS25 역삼점", amount: 23400, category: "소모품비" },
  { date: "03/27", store: "한국전력", amount: 342000, category: "공과금" },
  { date: "03/26", store: "남대문시장 김사장", amount: 456000, category: "식재료비" },
];

const REVIEWS = [
  { platform: "배민", star: 5, text: "된장찌개 진짜 맛있어요! 고기도 푸짐하고 반찬도 깔끔합니다.", replied: true },
  { platform: "쿠팡이츠", star: 4, text: "음식은 맛있는데 배달이 좀 늦었어요.", replied: false },
  { platform: "배민", star: 2, text: "양이 좀 적은 것 같아요. 가격 대비 아쉽습니다.", replied: false },
  { platform: "네이버", star: 5, text: "분위기 좋고 사장님이 친절하세요. 재방문 의사 100%!", replied: true },
];

export default function DemoPage() {
  const [tab, setTab] = useState<TabId>("home");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ── 상단 배너 ── */}
      <div className="bg-primary-500 text-white text-center py-2.5 px-4 text-caption font-medium flex items-center justify-center gap-2">
        <Sparkles size={14} />
        데모 모드 — 더미 데이터로 체험 중입니다
        <Link href="/signup" className="underline ml-1 font-semibold">
          실제로 시작하기
        </Link>
      </div>

      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-tertiary)] text-caption">
            <ArrowLeft size={14} /> 랜딩으로
          </Link>
          <span className="font-body font-bold text-[var(--text-primary)]">사장님비서</span>
          <Link href="/signup" className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-caption font-medium press-effect">
            시작하기
          </Link>
        </div>
      </header>

      {/* ── 탭 네비게이션 ── */}
      <div className="sticky top-12 z-30 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-2 flex overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 text-[11px] font-medium transition-colors relative ${
                  active ? "text-primary-500" : "text-[var(--text-tertiary)]"
                }`}>
                <Icon size={18} />
                {t.label}
                {active && (
                  <motion.div layoutId="demo-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {tab === "home" && <DemoHome />}
            {tab === "closing" && <DemoClosing />}
            {tab === "order" && <DemoOrder />}
            {tab === "receipt" && <DemoReceipt />}
            {tab === "review" && <DemoReview />}
            {tab === "briefing" && <DemoBriefing />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 하단 CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] p-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/signup"
            className="flex-1 py-3 rounded-xl bg-primary-500 text-white text-body-small font-semibold text-center press-effect">
            무료로 시작하기 <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── 홈 탭 ──────────────────────────── */
function DemoHome() {
  const todaySales = 1980000;
  const yesterdaySales = 1680000;
  const diff = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);

  return (
    <div className="space-y-4 pb-20">
      {/* 오늘의 요약 */}
      <div className="glass-card p-5">
        <p className="text-caption text-[var(--text-tertiary)] mb-1">2026년 3월 29일 일요일</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">오늘 매출</p>
            <p className="text-[32px] font-display font-bold text-[var(--text-primary)]">
              {todaySales.toLocaleString()}<span className="text-lg">원</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-success text-body-small font-semibold">
            <TrendingUp size={16} /> +{diff}%
          </div>
        </div>
      </div>

      {/* 주간 매출 그래프 */}
      <div className="glass-card p-5">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-4">이번 주 매출</h3>
        <div className="flex items-end gap-2 h-32">
          {WEEKLY_SALES.map((d, i) => {
            const max = Math.max(...WEEKLY_SALES.map(s => s.amount));
            const h = (d.amount / max) * 100;
            const isToday = i === WEEKLY_SALES.length - 1;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full">
                <span className="text-[10px] text-[var(--text-tertiary)] font-display">
                  {(d.amount / 10000).toFixed(0)}
                </span>
                <div className="flex-1 w-full relative">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`absolute bottom-0 left-0 right-0 rounded-t-md ${isToday ? "bg-primary-500" : "bg-primary-500/30"}`}
                  />
                </div>
                <span className={`text-[11px] ${isToday ? "text-primary-500 font-semibold" : "text-[var(--text-tertiary)]"}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 채널별 비중 */}
      <div className="glass-card p-5">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">채널별 매출</h3>
        <div className="flex h-3 rounded-full overflow-hidden mb-3">
          {CHANNELS.map(ch => (
            <div key={ch.name} className={`${ch.color}`} style={{ width: `${ch.ratio}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(ch => (
            <div key={ch.name} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ch.color}`} />
              <span className="text-caption text-[var(--text-secondary)]">{ch.name} {ch.ratio}%</span>
              <span className="text-caption font-display text-[var(--text-tertiary)] ml-auto">
                {(ch.amount / 10000).toFixed(0)}만
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 한줄 */}
      <div className="glass-card p-4">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-2">오늘 한 줄</h3>
        <p className="text-body-small text-[var(--text-secondary)]">
          일요일 런치 손님 많았음. 김치찌개 추가 준비 필요.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────── 마감 탭 ──────────────────────────── */
function DemoClosing() {
  const totalSales = 1980000;
  const totalFees = 94810;
  const netSales = totalSales - totalFees;

  return (
    <div className="space-y-4 pb-20">
      {/* 매출 카드 */}
      <div className="glass-card p-5">
        <p className="text-caption text-[var(--text-tertiary)] mb-1">3월 29일 (일)</p>
        <p className="text-[36px] font-display font-bold text-[var(--text-primary)] mb-3">
          {totalSales.toLocaleString()}<span className="text-lg">원</span>
        </p>
        <div className="flex justify-between text-caption">
          <span className="text-[var(--text-tertiary)]">수수료</span>
          <span className="text-danger font-display">-{totalFees.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-body-small font-medium mt-1">
          <span className="text-[var(--text-secondary)]">실 수령액</span>
          <span className="text-success font-display">{netSales.toLocaleString()}원</span>
        </div>
      </div>

      {/* 채널별 상세 */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">채널별 매출</h3>
        {CHANNELS.map(ch => (
          <div key={ch.name} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${ch.color}`} />
            <span className="text-body-small text-[var(--text-secondary)] w-16">{ch.name}</span>
            <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${ch.ratio}%` }}
                transition={{ duration: 0.6 }} className={`h-full rounded-full ${ch.color}`} />
            </div>
            <span className="text-caption font-display text-[var(--text-primary)] w-20 text-right">
              {ch.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* 수수료 내역 */}
      <div className="glass-card p-5 space-y-2">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">수수료 내역</h3>
        {[
          { name: "배민 중개수수료 (6.8%)", amount: 29621 },
          { name: "쿠팡이츠 중개수수료 (9.8%)", amount: 19404 },
          { name: "카드 결제수수료 (2.2%)", amount: 39323 },
          { name: "배달대행 (건당 3,200원)", amount: 6462 },
        ].map(f => (
          <div key={f.name} className="flex justify-between text-caption">
            <span className="text-[var(--text-secondary)]">{f.name}</span>
            <span className="text-danger font-display">{f.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="h-px bg-[var(--border-subtle)] my-1" />
        <div className="flex justify-between text-body-small font-medium">
          <span className="text-[var(--text-primary)]">총 수수료</span>
          <span className="text-danger font-display">{totalFees.toLocaleString()}원</span>
        </div>
      </div>

      {/* 월 목표 */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">3월 목표</h3>
          <span className="text-caption text-primary-500 font-display font-semibold">78%</span>
        </div>
        <div className="h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "78%" }}
            transition={{ duration: 0.8 }} className="h-full bg-primary-500 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-caption text-[var(--text-tertiary)]">
          <span>현재: 39,200,000원</span>
          <span>목표: 50,000,000원</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── 발주 탭 ──────────────────────────── */
function DemoOrder() {
  return (
    <div className="space-y-4 pb-20">
      {/* AI 추천 헤더 */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-primary-500" />
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">AI 발주 추천</h3>
        </div>
        <p className="text-caption text-[var(--text-secondary)]">
          최근 4주 사용량 + 날씨(맑음, 12°C) 기반 추천
        </p>
      </div>

      {/* 발주 품목 리스트 */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">발주 필요 품목</h3>
        </div>
        {ORDER_ITEMS.map((item, i) => {
          const statusColor = item.status === "긴급" ? "text-danger bg-danger/10"
            : item.status === "부족" ? "text-warning bg-warning/10"
            : "text-success bg-success/10";
          return (
            <div key={item.name} className={`px-4 py-3 flex items-center gap-3 ${i < ORDER_ITEMS.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-body-small text-[var(--text-primary)] font-medium">{item.name}</p>
                <p className="text-caption text-[var(--text-tertiary)]">
                  재고: {item.stock}{item.unit}
                </p>
              </div>
              {item.recommend > 0 && (
                <div className="text-right">
                  <p className="text-body-small font-display font-semibold text-primary-500">
                    +{item.recommend}{item.unit}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">추천</p>
                </div>
              )}
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                {item.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* 원가율 */}
      <div className="glass-card p-5">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">식자재 원가율</h3>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">이번 달 식자재비</p>
            <p className="text-heading-md font-display text-[var(--text-primary)]">12,340,000원</p>
          </div>
          <p className="text-[28px] font-display font-bold text-warning">31.5%</p>
        </div>
        <div className="h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "31.5%" }}
            transition={{ duration: 0.8 }} className="h-full bg-warning rounded-full" />
        </div>
        <p className="text-caption text-[var(--text-tertiary)] mt-2">업종 평균: 35% (한식)</p>
      </div>
    </div>
  );
}

/* ──────────────────────────── 영수증/경비 탭 ──────────────────────────── */
function DemoReceipt() {
  const totalExpense = RECEIPTS.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* OCR 데모 */}
      <div className="glass-card p-5 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
          <Camera size={24} className="text-primary-500" />
        </div>
        <h3 className="text-body-small font-semibold text-[var(--text-primary)]">AI 영수증 인식</h3>
        <p className="text-caption text-[var(--text-secondary)]">
          영수증을 촬영하면 AI가 자동으로 인식하고 분류합니다
        </p>
        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 text-caption font-medium">
          <Camera size={13} /> 데모에서는 촬영 불가
        </div>
      </div>

      {/* 이번 달 합계 */}
      <div className="glass-card p-5">
        <p className="text-caption text-[var(--text-tertiary)]">3월 경비 합계</p>
        <p className="text-[28px] font-display font-bold text-[var(--text-primary)]">
          {totalExpense.toLocaleString()}<span className="text-lg">원</span>
        </p>
        <div className="flex gap-2 mt-3">
          {[
            { label: "식재료", amount: 643500, color: "bg-orange-500" },
            { label: "공과금", amount: 342000, color: "bg-blue-500" },
            { label: "소모품", amount: 23400, color: "bg-emerald-500" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              <div className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
              {c.label}
            </div>
          ))}
        </div>
      </div>

      {/* 최근 영수증 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">최근 내역</h3>
        </div>
        {RECEIPTS.map((r, i) => (
          <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i < RECEIPTS.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
            <div className="flex-1 min-w-0">
              <p className="text-body-small text-[var(--text-primary)] font-medium truncate">{r.store}</p>
              <p className="text-caption text-[var(--text-tertiary)]">{r.date} · {r.category}</p>
            </div>
            <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">
              {r.amount.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────── 리뷰 탭 ──────────────────────────── */
function DemoReview() {
  const [generatedReply, setGeneratedReply] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateDemo = () => {
    setGenerating(true);
    setGeneratedReply("");
    const reply = "안녕하세요, 맛있는한식당 사장입니다! 된장찌개를 맛있게 드셨다니 정말 감사합니다. 저희가 매일 직접 담근 된장으로 끓이고 있어요. 다음에 오시면 김치찌개도 추천드립니다! 또 뵙겠습니다.";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < reply.length) {
        setGeneratedReply(reply.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 25);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 리뷰 통계 */}
      <div className="glass-card p-5">
        <h3 className="text-body-small font-semibold text-[var(--text-primary)] mb-3">이번 주 리뷰</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-heading-md font-display text-[var(--text-primary)]">12</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">총 리뷰</p>
          </div>
          <div>
            <p className="text-heading-md font-display text-warning">4.2</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">평균 별점</p>
          </div>
          <div>
            <p className="text-heading-md font-display text-success">75%</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">답글 완료</p>
          </div>
        </div>
      </div>

      {/* AI 답글 데모 */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary-500" />
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">AI 답글 생성 체험</h3>
        </div>
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-caption text-orange-400 font-medium">배민</span>
            <div className="flex">
              {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-warning fill-warning" />)}
            </div>
          </div>
          <p className="text-caption text-[var(--text-secondary)]">
            &ldquo;된장찌개 진짜 맛있어요! 고기도 푸짐하고 반찬도 깔끔합니다.&rdquo;
          </p>
        </div>
        <button onClick={generateDemo} disabled={generating}
          className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect disabled:opacity-50">
          {generating ? "생성 중..." : "AI 답글 생성하기"}
        </button>
        {generatedReply && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-primary-500/20">
            <p className="text-caption text-[var(--text-primary)] leading-relaxed">{generatedReply}</p>
          </motion.div>
        )}
      </div>

      {/* 리뷰 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">최근 리뷰</h3>
        </div>
        {REVIEWS.map((r, i) => (
          <div key={i} className={`px-4 py-3 ${i < REVIEWS.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                r.platform === "배민" ? "bg-blue-500/10 text-blue-400"
                : r.platform === "쿠팡이츠" ? "bg-emerald-500/10 text-emerald-400"
                : "bg-green-500/10 text-green-400"
              }`}>{r.platform}</span>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} className={s <= r.star ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
                ))}
              </div>
              <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full ${
                r.replied ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              }`}>{r.replied ? "답글 완료" : "미답변"}</span>
            </div>
            <p className="text-caption text-[var(--text-secondary)] line-clamp-2">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────── 브리핑 탭 ──────────────────────────── */
function DemoBriefing() {
  const cards = [
    {
      title: "매출 요약",
      icon: <TrendingUp size={16} className="text-primary-500" />,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-caption text-[var(--text-tertiary)]">주간 총매출</span>
            <span className="text-body-small font-display font-semibold text-[var(--text-primary)]">12,320,000원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-[var(--text-tertiary)]">일 평균</span>
            <span className="text-body-small font-display text-[var(--text-primary)]">1,760,000원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-[var(--text-tertiary)]">전주 대비</span>
            <span className="text-body-small font-display text-success">+8.3%</span>
          </div>
        </div>
      ),
    },
    {
      title: "수수료 분석",
      icon: <BarChart3 size={16} className="text-danger" />,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-caption text-[var(--text-tertiary)]">주간 수수료</span>
            <span className="text-body-small font-display font-semibold text-danger">-586,740원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-[var(--text-tertiary)]">매출 대비</span>
            <span className="text-body-small font-display text-[var(--text-primary)]">4.8%</span>
          </div>
        </div>
      ),
    },
    {
      title: "AI 경영 코칭",
      icon: <Sparkles size={16} className="text-primary-500" />,
      content: (
        <div className="space-y-2">
          <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
            이번 주 매출이 전주 대비 8.3% 상승했습니다. 특히 토요일 매출이 가장 높았으며,
            홀 매출 비중이 62%로 안정적입니다.
          </p>
          <div className="space-y-1.5 mt-3">
            <p className="text-caption font-medium text-[var(--text-primary)]">이번 주 실행 제안:</p>
            {[
              "토요일 런치 세트 메뉴 프로모션 진행",
              "대파·양파 재고 확인 후 화요일 발주",
              "2점 리뷰 고객에게 정중한 사과 답글 작성",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-caption text-[var(--text-secondary)]">
                <span className="text-primary-500 mt-0.5">{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="glass-card p-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-primary-500" />
        <span className="text-body-small font-semibold text-[var(--text-primary)]">3월 4주차 브리핑</span>
        <span className="text-caption text-[var(--text-tertiary)] ml-auto">3/23 ~ 3/29</span>
      </div>

      {cards.map((card) => (
        <div key={card.title} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            {card.icon}
            <h3 className="text-body-small font-semibold text-[var(--text-primary)]">{card.title}</h3>
          </div>
          {card.content}
        </div>
      ))}
    </div>
  );
}
