"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { FAQ_ITEMS } from "@/components/landing/data";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-16 px-5">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-heading-lg md:text-[2rem] font-bold text-[var(--text-primary)] mb-3">
              자주 묻는 질문
            </h2>
            <p className="text-body-small text-[var(--text-secondary)]">
              궁금한 점이 있으신가요?
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-body-small font-medium text-[var(--text-primary)] pr-4">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-4 pb-4 text-caption text-[var(--text-secondary)] leading-relaxed">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
