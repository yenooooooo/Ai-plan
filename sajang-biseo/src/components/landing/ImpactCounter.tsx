"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { IMPACT_STATS } from "@/components/landing/data";

function CounterItem({ value, suffix, label, delay }: {
  value: number; suffix: string; label: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCountUp(isInView ? value : 0, { duration: 1200 });

  return (
    <div ref={ref} className="text-center" style={{ transitionDelay: `${delay}ms` }}>
      <div className="text-[2rem] md:text-[2.5rem] font-bold font-display text-[var(--text-primary)]">
        {count.toLocaleString("ko-KR")}
        <span className="text-primary-500">{suffix}</span>
      </div>
      <p className="text-caption text-[var(--text-secondary)] mt-1">{label}</p>
    </div>
  );
}

export function ImpactCounter() {
  return (
    <section className="py-14 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {IMPACT_STATS.map((stat, i) => (
            <CounterItem key={stat.label} {...stat} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}
