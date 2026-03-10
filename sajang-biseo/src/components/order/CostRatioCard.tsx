"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingDown, Lightbulb } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { useFeeToggle } from "@/stores/useFeeToggle";

interface CategoryCost {
  name: string;
  icon: string;
  cost: number;
}

interface CostRatioCardProps {
  totalCost: number;
  grossSales: number;
  netSales: number;
  monthLabel: string;
  categoryCosts?: CategoryCost[];
  businessType?: string;
}

const INDUSTRY_AVG: Record<string, number> = {
  "한식": 35, "중식": 33, "일식": 38, "양식": 32,
  "카페": 28, "베이커리": 30, "치킨": 35, "피자": 30,
  "분식": 28, "고깃집": 40, "주점": 30, "패스트푸드": 28,
};

function getTips(ratio: number, industryAvg: number, categoryCosts: CategoryCost[]): string[] {
  const tips: string[] = [];
  if (ratio === 0) return ["사용량 데이터가 쌓이면 원가 분석이 시작됩니다"];
  if (ratio <= industryAvg - 5) tips.push(`원가율 ${ratio.toFixed(1)}%로 업종 평균(${industryAvg}%) 대비 우수합니다`);
  else if (ratio <= industryAvg) tips.push(`원가율이 업종 평균(${industryAvg}%) 수준입니다`);
  else if (ratio <= industryAvg + 5) tips.push(`원가율이 업종 평균(${industryAvg}%)보다 ${(ratio - industryAvg).toFixed(1)}%p 높습니다`);
  else tips.push(`원가율이 업종 평균(${industryAvg}%)을 크게 초과합니다. 개선이 필요합니다`);

  if (categoryCosts.length > 0) {
    const top = categoryCosts[0];
    const totalCat = categoryCosts.reduce((s, c) => s + c.cost, 0);
    const topPct = totalCat > 0 ? (top.cost / totalCat) * 100 : 0;
    if (topPct > 40) tips.push(`${top.icon} ${top.name} 카테고리가 원가의 ${topPct.toFixed(0)}%를 차지합니다`);
  }
  if (ratio > 35) tips.push("폐기량 줄이기, 대량구매 단가 협상을 검토해보세요");
  return tips;
}

export function CostRatioCard({
  totalCost, grossSales, netSales, monthLabel,
  categoryCosts = [], businessType,
}: CostRatioCardProps) {
  const { mode } = useFeeToggle();
  const baseSales = mode === "gross" ? grossSales : netSales;
  const ratio = baseSales > 0 ? (totalCost / baseSales) * 100 : 0;
  const animatedRatio = useCountUp(ratio, { duration: 600, decimals: 1 });
  const industryAvg = INDUSTRY_AVG[businessType ?? ""] ?? 33;

  const [target, setTarget] = useState(33);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("33");

  useEffect(() => {
    const saved = localStorage.getItem("cost-ratio-target");
    if (saved) { const v = parseFloat(saved); if (!isNaN(v)) { setTarget(v); setTargetInput(String(v)); } }
  }, []);

  const saveTarget = () => {
    const v = parseFloat(targetInput);
    if (!isNaN(v) && v > 0 && v <= 100) { setTarget(v); localStorage.setItem("cost-ratio-target", String(v)); }
    setEditingTarget(false);
  };

  const ratioColor = ratio > 40 ? "text-danger" : ratio > 35 ? "text-warning" : "text-success";
  const barColor = ratio > 40 ? "bg-danger" : ratio > 35 ? "bg-warning" : "bg-success";
  const totalCategoryCost = categoryCosts.reduce((s, c) => s + c.cost, 0);
  const tips = getTips(ratio, industryAvg, categoryCosts);

  return (
    <div className="space-y-4">
      {/* 메인 원가율 */}
      <div className="glass-card p-5">
        <h3 className="text-heading-md text-[var(--text-primary)] mb-1">식자재 원가율</h3>
        <p className="text-caption text-[var(--text-tertiary)] mb-4">{monthLabel}</p>

        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-caption text-[var(--text-tertiary)] mb-0.5">식자재비</p>
            <p className="text-heading-md font-display text-[var(--text-primary)]">{formatCurrency(totalCost)}</p>
          </div>
          <div className="text-right">
            <p className="text-caption text-[var(--text-tertiary)] mb-0.5">원가율</p>
            <p className={`text-amount-card font-display ${ratioColor}`}>{animatedRatio.toFixed(1)}%</p>
          </div>
        </div>

        {/* 프로그레스 바 + 업종 평균 마커 */}
        <div className="relative">
          <div className="h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(ratio, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${barColor}`} />
          </div>
          {/* 업종 평균 마커 */}
          <div className="absolute top-0 h-2.5 flex items-center" style={{ left: `${Math.min(industryAvg, 100)}%` }}>
            <div className="w-0.5 h-4 bg-[var(--text-tertiary)] rounded-full -mt-0.5" />
          </div>
          {/* 목표 마커 */}
          {target !== industryAvg && (
            <div className="absolute top-0 h-2.5 flex items-center" style={{ left: `${Math.min(target, 100)}%` }}>
              <div className="w-0.5 h-4 bg-primary-500 rounded-full -mt-0.5" />
            </div>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-caption text-[var(--text-tertiary)]">
            {mode === "gross" ? "총매출" : "순매출"}: {formatCurrency(baseSales)}
          </span>
          <span className="text-caption text-[var(--text-tertiary)]">
            업종평균: {industryAvg}%
          </span>
        </div>
      </div>

      {/* 카테고리별 원가 비중 */}
      {categoryCosts.length > 0 && totalCategoryCost > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-primary-500" />
            <h4 className="text-body-small font-semibold text-[var(--text-primary)]">카테고리별 원가</h4>
          </div>
          <div className="space-y-2">
            {categoryCosts.map((cat) => {
              const pct = (cat.cost / totalCategoryCost) * 100;
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{cat.icon}</span>
                  <span className="text-caption text-[var(--text-secondary)] w-14 truncate">{cat.name}</span>
                  <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-primary-500/60" />
                  </div>
                  <span className="text-caption text-[var(--text-tertiary)] w-10 text-right">{pct.toFixed(0)}%</span>
                  <span className="text-caption font-display text-[var(--text-secondary)] w-16 text-right">
                    {cat.cost >= 10000 ? `${Math.round(cat.cost / 10000)}만` : formatCurrency(cat.cost)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 목표 설정 */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary-500" />
            <span className="text-body-small font-medium text-[var(--text-primary)]">목표 원가율</span>
          </div>
          {editingTarget ? (
            <div className="flex items-center gap-1.5">
              <input type="number" value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTarget(); if (e.key === "Escape") setEditingTarget(false); }}
                className="w-16 h-7 text-center rounded-lg bg-[var(--bg-tertiary)] border border-primary-500 text-caption text-[var(--text-primary)] outline-none"
                autoFocus min={1} max={100} />
              <span className="text-caption text-[var(--text-tertiary)]">%</span>
              <button onClick={saveTarget} className="px-2 py-1 rounded-lg text-[11px] text-primary-500 bg-primary-500/10">저장</button>
            </div>
          ) : (
            <button onClick={() => { setTargetInput(String(target)); setEditingTarget(true); }}
              className="text-body-small font-display font-semibold text-primary-500 hover:underline">
              {target}%
            </button>
          )}
        </div>
        {ratio > 0 && target > 0 && (
          <p className={`text-caption mt-2 ${ratio <= target ? "text-success" : "text-warning"}`}>
            {ratio <= target
              ? `목표 대비 ${(target - ratio).toFixed(1)}%p 여유가 있습니다`
              : `목표 대비 ${(ratio - target).toFixed(1)}%p 초과하고 있습니다`}
          </p>
        )}
      </div>

      {/* 원가 관리 팁 */}
      {tips.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-warning" />
            <h4 className="text-body-small font-semibold text-[var(--text-primary)]">원가 관리 팁</h4>
          </div>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="text-caption text-[var(--text-secondary)] flex gap-2">
                <span className="text-[var(--text-tertiary)] shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
