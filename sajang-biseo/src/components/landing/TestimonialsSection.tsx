"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { TESTIMONIALS } from "@/components/landing/data";

const BG_COLORS = [
  "bg-blue-500/20 text-blue-400",
  "bg-orange-500/20 text-orange-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-rose-500/20 text-rose-400",
  "bg-amber-500/20 text-amber-400",
  "bg-purple-500/20 text-purple-400",
  "bg-cyan-500/20 text-cyan-400",
];

export function TestimonialsSection() {
  // 하이라이트 후기 (첫 번째)
  const highlight = TESTIMONIALS[0];
  const rest = TESTIMONIALS.slice(1);

  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
              사장님들의 실제 후기
            </h2>
            <p className="text-body-small text-[var(--text-secondary)]">
              이미 많은 사장님들이 경험하고 있습니다
            </p>
          </div>
        </ScrollReveal>

        {/* 하이라이트 후기 */}
        <ScrollReveal delay={0.05}>
          <div className="glass-card p-6 md:p-8 mb-4 border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-transparent">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, n) => (
                <Star key={n} size={16} className={n < highlight.rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
              ))}
            </div>
            <p className="text-body-default md:text-lg text-[var(--text-primary)] leading-relaxed mb-4">
              &quot;{highlight.content}&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold ${BG_COLORS[0]}`}>
                {highlight.name.charAt(0)}
              </div>
              <div>
                <p className="text-body-small font-medium text-[var(--text-primary)]">{highlight.name}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  {highlight.business}{highlight.highlight ? ` · ${highlight.highlight}` : ""}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 나머지 후기 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rest.map((t, i) => (
            <ScrollReveal key={t.name} delay={(i + 1) * 0.06}>
              <div className="glass-card p-5 h-full flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} size={13} className={n < t.rating ? "text-warning fill-warning" : "text-[var(--text-tertiary)]"} />
                  ))}
                </div>
                <p className="text-caption text-[var(--text-primary)] leading-relaxed flex-1 mb-3">
                  &quot;{t.content}&quot;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${BG_COLORS[(i + 1) % BG_COLORS.length]}`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-caption font-medium text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {t.business}{t.highlight ? ` · ${t.highlight}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
