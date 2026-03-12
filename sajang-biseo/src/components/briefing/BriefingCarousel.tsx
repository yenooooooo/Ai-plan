"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Percent, PieChart,
  Package, Star, Brain,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { SalesCard } from "./SalesCard";
import { FeeCard } from "./FeeCard";
import { ExpenseCard } from "./ExpenseCard";
import { IngredientCard } from "./IngredientCard";
import { ReputationCard } from "./ReputationCard";
import { CoachingCard } from "./CoachingCard";
import { CARD_GRADIENTS } from "@/lib/briefing/types";
import type { BriefingData, AiCoachingData } from "@/lib/briefing/types";

const CARD_CONFIG = [
  { key: "sales", title: "매출 요약", icon: DollarSign },
  { key: "fees", title: "수수료 분석", icon: Percent },
  { key: "expenses", title: "비용 분석", icon: PieChart },
  { key: "ingredients", title: "식자재 효율", icon: Package },
  { key: "reputation", title: "고객 평판", icon: Star },
  { key: "coaching", title: "AI 경영 코칭", icon: Brain },
] as const;

interface BriefingCarouselProps {
  data: BriefingData;
  generating: boolean;
  onGenerateCoaching: () => void;
  prevCoaching?: AiCoachingData | null;
  readOnly?: boolean;
}

export function BriefingCarousel({ data, generating, onGenerateCoaching, prevCoaching, readOnly = false }: BriefingCarouselProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(0);
  const currentRef = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const navigate = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= CARD_CONFIG.length) return;
    if (newIndex === currentRef.current) return;
    setDirection(newIndex > currentRef.current ? 1 : -1);
    currentRef.current = newIndex;
    setCurrentCard(newIndex);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // 가로 스와이프만 반응 (세로 스크롤과 구분)
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigate(dx > 0 ? currentRef.current + 1 : currentRef.current - 1);
    }
  }, [navigate]);

  const card = CARD_CONFIG[currentCard];
  const Icon = card.icon;
  const gradient = CARD_GRADIENTS[currentCard];
  const isCoaching = currentCard === 5;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0 }),
  };

  return (
    <div className="space-y-3">
      {/* 카드 인디케이터 */}
      <div className="flex items-center justify-center gap-2">
        {CARD_CONFIG.map((c, i) => (
          <button
            key={c.key}
            onClick={() => navigate(i)}
            className="p-1"
          >
            <div className={`transition-all duration-200 rounded-full ${
              i === currentCard
                ? "w-6 h-2 bg-primary-500"
                : "w-2 h-2 bg-[var(--bg-tertiary)]"
            }`} />
          </button>
        ))}
      </div>

      {/* 카드 영역 */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={currentCard}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`glass-card p-5 bg-gradient-to-br ${gradient} ${
              isCoaching ? "border border-amber-500/20" : ""
            }`}
          >
            {/* 카드 헤더 */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isCoaching ? "bg-amber-500/20" : "bg-primary-500/10"
              }`}>
                <Icon size={16} className={isCoaching ? "text-amber-500" : "text-primary-500"} />
              </div>
              <h3 className={`text-heading-md ${
                isCoaching ? "text-amber-500" : "text-[var(--text-primary)]"
              }`}>
                {card.title}
              </h3>
              <span className="ml-auto text-[11px] text-[var(--text-tertiary)]">
                {currentCard + 1}/{CARD_CONFIG.length}
              </span>
            </div>

            {/* 카드 내용 */}
            {currentCard === 0 && <SalesCard data={data.sales} />}
            {currentCard === 1 && <FeeCard data={data.fees} />}
            {currentCard === 2 && <ExpenseCard data={data.expenses} />}
            {currentCard === 3 && <IngredientCard data={data.ingredients} />}
            {currentCard === 4 && <ReputationCard data={data.reputation} />}
            {currentCard === 5 && (
              <CoachingCard
                data={data.coaching}
                generating={generating}
                onGenerate={onGenerateCoaching}
                weekStart={data.weekStart}
                prevCoaching={prevCoaching}
                readOnly={readOnly}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 좌우 버튼 — 터치 영역 확대 */}
        {currentCard > 0 && (
          <button
            onClick={() => navigate(currentCard - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--bg-elevated)]/90 shadow-md flex items-center justify-center text-[var(--text-tertiary)] active:scale-90 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {currentCard < CARD_CONFIG.length - 1 && (
          <button
            onClick={() => navigate(currentCard + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--bg-elevated)]/90 shadow-md flex items-center justify-center text-[var(--text-tertiary)] active:scale-90 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
