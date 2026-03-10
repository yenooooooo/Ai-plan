"use client";

import { useState } from "react";
import { BarChart3, Receipt, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

const TABS = [
  { key: "closing", label: "마감 리포트", icon: BarChart3 },
  { key: "fee", label: "수수료 분석", icon: Receipt },
  { key: "briefing", label: "AI 브리핑", icon: TrendingUp },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ClosingMock() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-caption text-[var(--text-tertiary)]">3/9(일) 마감</span>
        <span className="text-[11px] text-success">저장됨</span>
      </div>
      <p className="text-[1.75rem] font-bold font-display text-[var(--text-primary)]">
        <span className="text-[var(--text-tertiary)] text-lg">₩</span>2,340,000
      </p>
      <div className="flex gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400">홀 55%</span>
        <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400">배민 30%</span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">포장 15%</span>
      </div>
      <div className="h-px bg-[var(--border-subtle)]" />
      <div className="flex justify-between text-caption">
        <span className="text-[var(--text-tertiary)]">수수료</span>
        <span className="text-danger font-display">-₩112,320</span>
      </div>
      <div className="flex justify-between text-caption">
        <span className="text-[var(--text-tertiary)]">경비</span>
        <span className="text-danger font-display">-₩85,000</span>
      </div>
      <div className="flex justify-between text-body-small font-medium">
        <span className="text-[var(--text-secondary)]">순이익</span>
        <span className="text-success font-display">₩2,142,680</span>
      </div>
    </div>
  );
}

function FeeMock() {
  const channels = [
    { name: "홀 매출", fee: "₩16,731", rate: "1.3%" },
    { name: "배민", fee: "₩47,736", rate: "6.8%" },
    { name: "쿠팡이츠", fee: "₩34,398", rate: "9.8%" },
    { name: "배달대행", fee: "₩13,200", rate: "건당 3,300" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-caption text-[var(--text-tertiary)]">수수료 상세</span>
        <span className="text-body-small font-display text-danger font-semibold">-₩112,065</span>
      </div>
      <div className="space-y-2">
        {channels.map((ch) => (
          <div key={ch.name} className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <div>
              <span className="text-caption text-[var(--text-primary)]">{ch.name}</span>
              <span className="text-[11px] text-[var(--text-tertiary)] ml-1.5">({ch.rate})</span>
            </div>
            <span className="text-caption font-display text-[var(--text-secondary)]">{ch.fee}</span>
          </div>
        ))}
      </div>
      <div className="text-center pt-1">
        <span className="text-[11px] text-primary-500">수수료율 4.8% · 실수령률 95.2%</span>
      </div>
    </div>
  );
}

function BriefingMock() {
  return (
    <div className="space-y-3">
      <span className="text-caption text-[var(--text-tertiary)]">3월 1주차 브리핑</span>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-2.5">
          <p className="text-[11px] text-[var(--text-tertiary)]">총매출</p>
          <p className="text-body-small font-display font-semibold text-[var(--text-primary)]">₩14.2M</p>
        </div>
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-2.5">
          <p className="text-[11px] text-[var(--text-tertiary)]">전주 대비</p>
          <p className="text-body-small font-display font-semibold text-success">+8.3%</p>
        </div>
      </div>
      <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
        <p className="text-[11px] text-primary-500 font-medium mb-1">AI 코칭</p>
        <p className="text-caption text-[var(--text-secondary)] leading-relaxed">
          금요일 매출이 평균 대비 23% 높습니다. 금요일 한정 세트 메뉴를 고려해보세요.
        </p>
      </div>
    </div>
  );
}

const MOCK_MAP: Record<TabKey, React.FC> = {
  closing: ClosingMock,
  fee: FeeMock,
  briefing: BriefingMock,
};

export function AppShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>("closing");
  const MockComponent = MOCK_MAP[activeTab];

  return (
    <section className="py-16 px-5 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
              실제 화면을 확인해보세요
            </h2>
            <p className="text-body-small text-[var(--text-secondary)]">
              터치 몇 번이면 하루 마감이 끝납니다
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-sm mx-auto">
            {/* 탭 */}
            <div className="flex bg-[var(--bg-tertiary)] rounded-xl p-0.5 mb-4">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
                    activeTab === key
                      ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
                      : "text-[var(--text-tertiary)]"
                  }`}
                >
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>

            {/* 화면 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5"
              >
                <MockComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
