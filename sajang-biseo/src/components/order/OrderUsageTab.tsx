"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useUIState } from "@/stores/useUIState";
import { Save, CheckCircle2, Wand2, ArrowRight, Sparkles, Copy } from "lucide-react";
import { AccordionSection } from "@/components/closing/AccordionSection";
import { UsageStepper } from "@/components/order/UsageStepper";
import { StockReceiving } from "@/components/order/StockReceiving";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";

interface OrderUsageTabProps {
  groups: OrderItemGroup[];
  activeItems: DBOrderItem[];
  usageMap: Record<string, number>;
  setUsageMap: (map: Record<string, number>) => void;
  wasteMap: Record<string, number>;
  stockMap: Record<string, number>;
  prevUsageMap: Record<string, number>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  handleUsageChange: (id: string, val: number) => void;
  handleWasteChange: (id: string, val: number) => void;
  applyPreset: (type: "weekday" | "weekend") => void;
  hasAutoFillData: boolean;
  autoFillUsage: () => void;
  copyToNextDay: () => void;
  items: DBOrderItem[];
  receiveStock: (entries: { itemId: string; qty: number }[]) => void;
  stockReceiving: boolean;
  saveUsage: () => void;
  usageSaving: boolean;
  usageSaved: boolean;
  hasUsageData: boolean;
  onGoToRecommend: () => void;
  readOnly?: boolean;
}

const PRESET_BUTTONS = [
  { type: "weekday", label: "평일기본", caption: "평일 평균 사용량 자동 입력" },
  { type: "weekend", label: "주말기본", caption: "주말 평균 사용량 자동 입력" },
  { type: "reset",   label: "직접입력", caption: "모든 항목 초기화" },
] as const;

export function OrderUsageTab({
  groups, activeItems, usageMap, setUsageMap, wasteMap, stockMap, prevUsageMap,
  selectedDate, setSelectedDate, handleUsageChange, handleWasteChange,
  applyPreset, hasAutoFillData, autoFillUsage, copyToNextDay, items, receiveStock,
  stockReceiving, saveUsage, usageSaving, usageSaved, hasUsageData, onGoToRecommend,
  readOnly = false,
}: OrderUsageTabProps) {
  const openGroups = useUIState((s) => s.orderUsageGroups);
  const setUsageGroup = useUIState((s) => s.setOrderUsageGroup);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const receivingRef = useRef<HTMLDivElement>(null);

  const toggleGroup = useCallback((id: string) => {
    const next = !openGroups[id];
    setUsageGroup(id, next);
    if (next) {
      setTimeout(() => groupRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 220);
    }
  }, [openGroups, setUsageGroup]);

  const handlePreset = (type: "weekday" | "weekend" | "reset") => {
    if (type === "reset") { setUsageMap({}); return; }
    applyPreset(type);
  };

  return (
    <motion.div key="usage" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
      {/* 날짜 & 프리셋 */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-body-small font-semibold text-[var(--text-primary)]">오늘 사용량 입력</span>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
        </div>
        {!readOnly && (
          <div className="flex gap-2 flex-wrap">
            {PRESET_BUTTONS.map(({ type, label, caption }) => (
              <button key={type} onClick={() => handlePreset(type)}
                className="flex flex-col items-start px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:text-primary-500 transition-colors press-effect">
                <span className="text-caption text-[var(--text-secondary)]">{label}</span>
                <span className="text-[10px] text-[var(--text-tertiary)] leading-tight">{caption}</span>
              </button>
            ))}
            {hasAutoFillData && (
              <button onClick={autoFillUsage}
                className="flex flex-col items-start px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors press-effect">
                <span className="text-caption text-primary-500 font-medium flex items-center gap-1"><Wand2 size={12} />자동 채우기</span>
                <span className="text-[10px] text-primary-400 leading-tight">같은 요일 4주 평균</span>
              </button>
            )}
            {hasUsageData && (
              <button onClick={copyToNextDay}
                className="flex flex-col items-start px-3 py-1.5 rounded-lg bg-success/10 hover:bg-success/20 transition-colors press-effect">
                <span className="text-caption text-success font-medium flex items-center gap-1"><Copy size={12} />내일도 동일</span>
                <span className="text-[10px] text-success/70 leading-tight">내일 날짜로 복사</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 카테고리별 사용량 + 인라인 폐기 입력 */}
      {groups.map((group) => {
        const groupItems = activeItems.filter((i) => i.group_id === group.id);
        if (groupItems.length === 0) return null;
        const filledCount = groupItems.filter((i) => (usageMap[i.id] ?? 0) > 0).length;
        return (
          <div key={group.id} ref={(el) => { groupRefs.current[group.id] = el; }}>
            <AccordionSection
              title={group.group_name}
              icon={<span>{group.icon ?? "📦"}</span>}
              summary={`${filledCount}/${groupItems.length} 입력`}
              open={openGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
            >
              <div className="divide-y divide-[var(--border-subtle)]">
                {groupItems.map((item) => (
                  <UsageStepper key={item.id} itemId={item.id} itemName={item.item_name} unit={item.unit}
                    value={usageMap[item.id] ?? 0} remainingStock={stockMap[item.id]} prevValue={prevUsageMap[item.id]}
                    onChange={handleUsageChange}
                    wasteValue={wasteMap[item.id] ?? 0} onWasteChange={handleWasteChange} readOnly={readOnly} />
                ))}
              </div>
            </AccordionSection>
          </div>
        );
      })}

      {/* 입고 처리 */}
      {!readOnly && (
        <div ref={receivingRef}>
          <StockReceiving items={items} onReceive={receiveStock} receiving={stockReceiving} />
        </div>
      )}

      {/* 저장 완료 안내 배너 */}
      {usageSaved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-success/20 bg-success/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={18} className="text-success shrink-0" />
              <span className="text-body-small font-medium text-success">사용량이 저장되었습니다! 발주추천을 확인하세요</span>
            </div>
            <button onClick={onGoToRecommend}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-caption font-medium press-effect">
              <Sparkles size={12} />발주추천 보기<ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 저장 버튼 */}
      {!readOnly && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={saveUsage} disabled={usageSaving || (!hasUsageData && !usageSaved)}
          className={`w-full py-4 rounded-2xl font-semibold text-body-small flex items-center justify-center gap-2 press-effect ${usageSaved ? "bg-success/10 text-success" : "bg-primary-500 text-white"} disabled:opacity-50`}>
          {usageSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : usageSaved ? <><CheckCircle2 size={18} />저장 완료</>
            : <><Save size={18} />사용량 저장</>}
        </motion.button>
      )}
    </motion.div>
  );
}
