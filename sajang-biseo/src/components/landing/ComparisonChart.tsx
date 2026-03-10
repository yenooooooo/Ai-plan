"use client";

import { Check, X, Clock, Calculator, Brain, Camera, BarChart3, MessageSquare } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

const ROWS = [
  { item: "마감 정산", icon: Clock, old: "30~60분 수기 작업", now: "30초 자동 완료" },
  { item: "수수료 계산", icon: Calculator, old: "수동 계산, 누락 빈번", now: "채널별 자동 실시간" },
  { item: "발주 예측", icon: Brain, old: "감과 경험에 의존", now: "AI 데이터 분석 87%" },
  { item: "영수증 관리", icon: Camera, old: "종이/사진 보관", now: "AI 자동 인식·분류" },
  { item: "경영 분석", icon: BarChart3, old: "직접 엑셀 정리", now: "주간 AI 브리핑" },
  { item: "리뷰 답글", icon: MessageSquare, old: "30분+ 직접 작성", now: "3초 AI 생성" },
];

export function ComparisonChart() {
  return (
    <section className="py-16 px-5">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
              수기 관리 vs 사장님비서
            </h2>
            <p className="text-body-small text-[var(--text-secondary)]">
              같은 업무, 완전히 다른 시간과 결과
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card overflow-hidden">
            {/* 헤더 */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-0 border-b border-[var(--border-subtle)]">
              <div className="p-3 md:p-4 text-caption font-medium text-[var(--text-tertiary)]">항목</div>
              <div className="p-3 md:p-4 text-caption font-medium text-[var(--text-tertiary)] text-center border-x border-[var(--border-subtle)]">
                수기/엑셀
              </div>
              <div className="p-3 md:p-4 text-caption font-medium text-primary-500 text-center">사장님비서</div>
            </div>

            {/* 행 */}
            {ROWS.map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className={`grid grid-cols-[1fr_1fr_1fr] gap-0 ${
                  i < ROWS.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                }`}>
                  <div className="p-3 md:p-4 flex items-center gap-2">
                    <Icon size={14} className="text-[var(--text-tertiary)] flex-shrink-0 hidden sm:block" />
                    <span className="text-caption text-[var(--text-primary)] font-medium">{row.item}</span>
                  </div>
                  <div className="p-3 md:p-4 flex items-center justify-center gap-1.5 border-x border-[var(--border-subtle)]">
                    <X size={12} className="text-danger flex-shrink-0" />
                    <span className="text-[11px] md:text-caption text-[var(--text-tertiary)]">{row.old}</span>
                  </div>
                  <div className="p-3 md:p-4 flex items-center justify-center gap-1.5">
                    <Check size={12} className="text-success flex-shrink-0" />
                    <span className="text-[11px] md:text-caption text-success font-medium">{row.now}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
