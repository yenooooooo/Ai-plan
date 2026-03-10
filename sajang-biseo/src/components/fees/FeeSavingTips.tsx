"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/stores/useToast";
import type { ChannelProfitability } from "@/lib/fees/aggregateFeesData";

interface FeeSavingTipsProps {
  profitability: ChannelProfitability[];
}

function generateTips(data: ChannelProfitability[]): string[] {
  const tips: string[] = [];
  if (data.length === 0) return ["마감 데이터가 쌓이면 맞춤 절감 팁을 제공합니다."];

  const deliveryChannels = data.filter((d) =>
    ["배민", "쿠팡이츠", "요기요", "땡겨요"].includes(d.channel)
  );
  const totalSales = data.reduce((s, d) => s + d.totalSales, 0);
  const deliverySales = deliveryChannels.reduce((s, d) => s + d.totalSales, 0);
  const deliveryRatio = totalSales > 0 ? (deliverySales / totalSales) * 100 : 0;

  if (deliveryRatio > 40) {
    tips.push(`배달 비중이 ${Math.round(deliveryRatio)}%로 높습니다. 홀/포장 비중을 늘리면 수수료를 줄일 수 있습니다.`);
  }
  data.filter((d) => d.feeRate > 10).forEach((ch) => {
    tips.push(`${ch.channel}의 수수료율이 ${ch.feeRate.toFixed(1)}%입니다. 자체 배달이나 포장 전환을 검토해보세요.`);
  });
  if (!data.some((d) => d.channel === "땡겨요") && deliveryRatio > 20) {
    tips.push("땡겨요(수수료 2%)를 병행하면 배달 수수료를 크게 줄일 수 있습니다.");
  }
  data.filter((d) => ["홀", "포장"].includes(d.channel) && d.feeRate > 1.5).forEach((ch) => {
    tips.push(`${ch.channel} 카드 수수료율을 확인하세요. 영세사업자 우대 수수료(0.5%)를 적용받을 수 있습니다.`);
  });
  if (tips.length === 0) tips.push("현재 수수료 구조가 양호합니다. 계속 모니터링하세요.");
  return tips;
}

export function FeeSavingTips({ profitability }: FeeSavingTipsProps) {
  const toast = useToast((s) => s.show);
  const [aiTips, setAiTips] = useState<string[] | null>(null);
  const [generating, setGenerating] = useState(false);

  const tips = aiTips ?? generateTips(profitability);

  const generateAiTips = async () => {
    if (profitability.length === 0) return;
    setGenerating(true);
    try {
      const totalSales = profitability.reduce((s, d) => s + d.totalSales, 0);
      const totalFees = profitability.reduce((s, d) => s + d.totalFees, 0);
      const res = await fetch("/api/fees/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profitability, totalSales, totalFees,
          feeRate: totalSales > 0 ? Math.round((totalFees / totalSales) * 1000) / 10 : 0,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.tips) {
        setAiTips(json.data.tips);
        toast("AI 분석이 완료되었습니다", "success");
      } else {
        throw new Error(json.error || "분석 실패");
      }
    } catch {
      toast("AI 분석에 실패했습니다", "error");
    }
    setGenerating(false);
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Lightbulb size={16} className="text-primary-500" />
          </div>
          <h4 className="text-heading-md text-[var(--text-primary)]">수수료 절감 팁</h4>
        </div>
        {profitability.length > 0 && (
          <button onClick={generateAiTips} disabled={generating}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 text-[11px] font-medium press-effect disabled:opacity-50">
            {generating ? (
              <div className="w-3.5 h-3.5 border border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <Brain size={12} />
            )}
            AI 분석
          </button>
        )}
      </div>

      {aiTips && (
        <div className="text-[11px] text-primary-500 font-medium flex items-center gap-1">
          <Sparkles size={11} /> AI가 분석한 맞춤 절감 팁
        </div>
      )}

      <div className="space-y-2">
        {tips.map((tip, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2 bg-[var(--bg-tertiary)] rounded-xl p-3">
            <Sparkles size={13} className="text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-caption text-[var(--text-secondary)] leading-relaxed">{tip}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
