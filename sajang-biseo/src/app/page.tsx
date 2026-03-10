"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, Zap, Shield, ArrowRight, Check,
  ChevronRight, Sparkles, CreditCard,
} from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { FeeCalculatorDemo } from "@/components/landing/FeeCalculatorDemo";
import { ImpactCounter } from "@/components/landing/ImpactCounter";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { ComparisonChart } from "@/components/landing/ComparisonChart";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FEATURES, PLANS } from "@/components/landing/data";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* ────────────── 네비게이션 ────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-body font-bold text-[var(--text-primary)] text-lg">
            사장님비서
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-body-small text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              로그인
            </Link>
            <Link href="/signup"
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect hover:bg-primary-600 transition-colors">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ────────────── 히어로 섹션 ────────────── */}
      <section className="pt-28 pb-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
          >
            <Sparkles size={14} className="text-primary-500" />
            <span className="text-caption text-primary-500">AI 기반 매장 운영 솔루션</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[2.5rem] md:text-[3.5rem] font-bold text-[var(--text-primary)] leading-tight mb-5 tracking-tight"
          >
            매일 밤 1시간,
            <br />
            이제 <span className="text-primary-500">5분</span>이면 끝.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed"
          >
            마감 정산, 식자재 발주, 경비 관리, 리뷰 응대까지.
            <br className="hidden md:block" />
            외식업 사장님을 위한 올인원 AI 비서.
          </motion.p>

          {/* CTA + 리스크 리버설 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-500 text-white font-semibold text-lg flex items-center justify-center gap-2 press-effect hover:bg-primary-600 hover:shadow-glow-orange-md transition-all">
                무료로 시작하기 <ArrowRight size={20} />
              </Link>
              <a href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-medium text-lg flex items-center justify-center gap-2 press-effect hover:bg-[var(--bg-elevated)] transition-colors">
                기능 살펴보기 <ChevronRight size={18} />
              </a>
            </div>
            {/* 리스크 리버설 */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1"><CreditCard size={11} />신용카드 필요 없음</span>
              <span>·</span>
              <span>3분 가입</span>
              <span>·</span>
              <span>언제든 해지 가능</span>
            </div>
          </motion.div>

          {/* 신뢰 지표 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-8 text-caption text-[var(--text-tertiary)]"
          >
            <div className="flex items-center gap-1.5">
              <Shield size={14} /> 무료 플랜 제공
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} /> 3분 내 가입
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} /> 즉시 사용 가능
            </div>
          </motion.div>
        </div>

        {/* 앱 목업 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-sm mx-auto mt-12"
        >
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption text-[var(--text-tertiary)]">오늘의 매출</span>
              <span className="text-[11px] text-success">+12.5%</span>
            </div>
            <p className="amount-card text-[var(--text-primary)]">₩1,870,000</p>
            <div className="flex gap-2 text-caption">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400">홀 68%</span>
              <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400">배달 24%</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">포장 8%</span>
            </div>
            <div className="h-px bg-[var(--border-subtle)]" />
            <div className="flex justify-between text-caption">
              <span className="text-[var(--text-tertiary)]">수수료</span>
              <span className="text-danger font-display">-₩89,810</span>
            </div>
            <div className="flex justify-between text-body-small font-medium">
              <span className="text-[var(--text-secondary)]">실 수령액</span>
              <span className="text-success font-display">₩1,780,190</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ────────────── 임팩트 숫자 카운터 ────────────── */}
      <ImpactCounter />

      {/* ────────────── 기능 소개 ────────────── */}
      <section id="features" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
                사장님에게 필요한 모든 기능
              </h2>
              <p className="text-body-small text-[var(--text-secondary)] max-w-md mx-auto">
                마감부터 발주, 경비, 리뷰, 브리핑까지 하나의 앱에서
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <ScrollReveal key={feat.title} delay={i * 0.08}>
                  <div className={`glass-card p-5 bg-gradient-to-br ${feat.gradient} h-full`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <Icon size={20} className={feat.color} />
                      </div>
                      <div className="text-right">
                        <p className="text-heading-md font-display text-[var(--text-primary)]">
                          {feat.stat}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">{feat.statLabel}</p>
                      </div>
                    </div>
                    <h3 className="text-heading-md text-[var(--text-primary)] mb-1.5">{feat.title}</h3>
                    <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── 앱 실제 화면 데모 ────────────── */}
      <AppShowcase />

      {/* ────────────── 수수료 계산기 ────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
                수수료, 정확히 알고 계세요?
              </h2>
              <p className="text-body-small text-[var(--text-secondary)] max-w-md mx-auto">
                매출을 입력하면 채널별 수수료와 실 수령액을 바로 확인할 수 있어요
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <FeeCalculatorDemo />
          </ScrollReveal>
        </div>
      </section>

      {/* ────────────── 비교 차트 ────────────── */}
      <ComparisonChart />

      {/* ────────────── 사장님 후기 ────────────── */}
      <TestimonialsSection />

      {/* ────────────── 요금제 ────────────── */}
      <section id="pricing" className="py-16 px-5 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
                합리적인 요금제
              </h2>
              <p className="text-body-small text-[var(--text-secondary)]">
                무료로 시작하고, 필요할 때 업그레이드하세요
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                모든 플랜 언제든 변경·해지 가능 · 신용카드 없이 시작
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 max-w-3xl mx-auto">
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 0.1}>
                <div className={`glass-card p-5 h-full flex flex-col relative ${
                  plan.popular ? "border-primary-500/40 shadow-glow-orange" : ""
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-500 text-white text-[11px] font-bold">
                      추천
                    </div>
                  )}
                  <h3 className="text-heading-md text-[var(--text-primary)] mb-0.5">{plan.name}</h3>
                  {(plan as { desc?: string }).desc && (
                    <p className="text-[11px] text-primary-500 font-medium mb-1">{(plan as { desc?: string }).desc}</p>
                  )}
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-[28px] font-display font-bold text-[var(--text-primary)]">
                      {plan.price}
                    </span>
                    <span className="text-caption text-[var(--text-tertiary)] mb-1">{plan.period}</span>
                  </div>
                  <div className="space-y-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-caption text-[var(--text-secondary)]">
                        <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/signup"
                    className={`w-full py-3 rounded-xl text-body-small font-medium text-center press-effect transition-colors ${
                      plan.popular
                        ? "bg-primary-500 text-white hover:bg-primary-600"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── FAQ ────────────── */}
      <FAQSection />

      {/* ────────────── 최종 CTA ────────────── */}
      <section className="py-20 px-5">
        <ScrollReveal>
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-4">
              오늘부터 시작하세요
            </h2>
            <p className="text-body-small text-[var(--text-secondary)] mb-8 leading-relaxed">
              가입 3분, 첫 마감 입력 30초.
              <br />
              이제 사장님도 데이터로 경영하세요.
            </p>
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-500 text-white font-semibold text-lg press-effect hover:bg-primary-600 hover:shadow-glow-orange-md transition-all">
              무료로 시작하기 <ArrowRight size={20} />
            </Link>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
              신용카드 없이 무료 시작 · 언제든 해지 가능
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ────────────── 푸터 ────────────── */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-body font-bold text-[var(--text-primary)]">사장님비서</span>
            <span className="text-caption text-[var(--text-tertiary)]">AI 매장 운영 비서</span>
          </div>
          <div className="flex items-center gap-4 text-caption text-[var(--text-tertiary)]">
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">로그인</Link>
            <Link href="/signup" className="hover:text-[var(--text-secondary)] transition-colors">회원가입</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">개인정보처리방침</Link>
            <span>2025 사장님비서</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
