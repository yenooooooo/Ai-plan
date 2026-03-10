"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, AlertTriangle, CheckCircle2, Save,
  Package, ClipboardList, ArrowRight,
} from "lucide-react";
import { RecommendationCard } from "@/components/order/RecommendationCard";
import { OrderSheet } from "@/components/order/OrderSheet";
import { StockFlowCard } from "@/components/order/StockFlowCard";
import { OrderExport } from "@/components/order/OrderExport";
import { OrderTemplates } from "@/components/order/OrderTemplates";
import { OrderHistory } from "@/components/order/OrderHistory";
import { AccordionSection } from "@/components/closing/AccordionSection";
import { formatDateShort, addDays } from "@/lib/utils/date";
import type { RecommendationResult } from "@/lib/order/recommend";
import type { OrderItem as DBOrderItem } from "@/lib/supabase/types";

export interface OrderRecommendTabProps {
  recLoading: boolean;
  recommendations: RecommendationResult[];
  needOrderRecs: RecommendationResult[];
  sufficientRecs: RecommendationResult[];
  confirmedItems: Map<string, number>;
  confirmedList: { itemId: string; qty: number }[];
  orderDateLabel: string;
  handleConfirm: (itemId: string, qty: number) => void;
  orderMap: Record<string, number>;
  setOrderMap: (map: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  orderSaving: boolean;
  orderSaved: boolean;
  saveOrders: () => void;
  applyConfirmedToOrders: () => void;
  activeItems: DBOrderItem[];
  stockMap: Record<string, number>;
  usageMap: Record<string, number>;
  wasteMap: Record<string, number>;
  itemsMap: Map<string, DBOrderItem>;
  items: DBOrderItem[];
  onGoToUsage: () => void;
}

export function OrderRecommendTab({
  recLoading, recommendations, needOrderRecs, sufficientRecs,
  confirmedItems, confirmedList, orderDateLabel, handleConfirm,
  orderMap, setOrderMap, orderSaving, orderSaved, saveOrders,
  activeItems, stockMap, usageMap,
  wasteMap, itemsMap, items, onGoToUsage,
}: OrderRecommendTabProps) {
  const [openNeed, setOpenNeed] = useState(true);
  const [openSufficient, setOpenSufficient] = useState(false);
  const [openFlow, setOpenFlow] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const confirmedRef = useRef<HTMLDivElement>(null);
  const prevConfirmedSize = useRef(confirmedItems.size);

  useEffect(() => {
    if (confirmedItems.size > prevConfirmedSize.current && confirmedRef.current) {
      confirmedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevConfirmedSize.current = confirmedItems.size;
  }, [confirmedItems.size]);

  const hasData = recommendations.length > 0;
  const isEmpty = !recLoading && !hasData && activeItems.length === 0;
  const noRecs = !recLoading && !hasData && activeItems.length > 0;

  return (
    <motion.div
      key="recommend"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* 헤더 */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-primary-500" />
          <h3 className="text-body-small font-semibold text-[var(--text-primary)]">내일 발주 추천</h3>
        </div>
        <p className="text-caption text-[var(--text-tertiary)]">{orderDateLabel}</p>
      </div>

      {/* 발주 템플릿 */}
      <OrderTemplates
        currentOrderMap={orderMap}
        onApplyTemplate={(templateItems) => {
          setOrderMap(templateItems);
          Array.from(Object.entries(templateItems)).forEach(([itemId, qty]) => {
            if (qty > 0) handleConfirm(itemId, qty);
          });
        }}
      />

      {/* 로딩 */}
      {recLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}

      {/* 빈 상태: 사용량 데이터 없음 */}
      {isEmpty && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <ClipboardList size={24} className="text-primary-500" />
          </div>
          <p className="text-body-small font-medium text-[var(--text-secondary)]">사용량 데이터가 필요합니다</p>
          <p className="text-caption text-[var(--text-tertiary)]">일일 사용량을 입력하면 AI가 발주를 추천해드려요</p>
          <button onClick={onGoToUsage}
            className="mx-auto px-5 py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium hover:bg-primary-600 transition-colors flex items-center gap-2 press-effect">
            사용량 입력하러 가기 <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* 사용량은 있으나 추천 결과 없음 */}
      {noRecs && (
        <div className="glass-card p-8 text-center">
          <p className="text-body-small text-[var(--text-tertiary)]">사용량 데이터가 부족합니다.<br />일일 사용량을 먼저 입력해주세요.</p>
        </div>
      )}

      {/* 추천 결과 */}
      {!recLoading && hasData && (
        <>
          {needOrderRecs.length > 0 && (
            <AccordionSection
              title={`발주 필요 (${needOrderRecs.length}개)`}
              icon={<AlertTriangle size={14} className="text-warning" />}
              open={openNeed}
              onToggle={() => setOpenNeed((v) => !v)}
            >
              <div className="space-y-3">
                {needOrderRecs.map((rec) => (
                  <RecommendationCard key={rec.itemId} rec={rec} onConfirm={handleConfirm} confirmed={confirmedItems.has(rec.itemId)} />
                ))}
              </div>
            </AccordionSection>
          )}

          {sufficientRecs.length > 0 && (
            <AccordionSection
              title="재고 충분"
              summary={`${sufficientRecs.length}개 품목`}
              icon={<CheckCircle2 size={14} className="text-success" />}
              open={openSufficient}
              onToggle={() => setOpenSufficient((v) => !v)}
            >
              <div className="space-y-1.5">
                {sufficientRecs.map((rec) => (
                  <div key={rec.itemId} className="flex items-center justify-between text-caption">
                    <span className="text-[var(--text-secondary)]">{rec.itemName}</span>
                    <span className="text-[var(--text-tertiary)]">재고 {rec.currentStock}{rec.unit}, 예상 {rec.expectedUsage}{rec.unit}</span>
                  </div>
                ))}
              </div>
            </AccordionSection>
          )}

          {confirmedItems.size > 0 && (
            <div ref={confirmedRef} className="space-y-4">
              <OrderSheet confirmedItems={confirmedList} itemsMap={itemsMap} orderDate={formatDateShort(addDays(new Date(), 1))} />
              <OrderExport confirmedItems={confirmedList} itemsMap={itemsMap} orderDate={formatDateShort(addDays(new Date(), 1))} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={saveOrders} disabled={orderSaving}
                className={`w-full py-3.5 rounded-2xl font-semibold text-body-small flex items-center justify-center gap-2 press-effect ${orderSaved ? "bg-success/10 text-success" : "bg-primary-500 text-white"} disabled:opacity-50`}>
                {orderSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : orderSaved ? <><CheckCircle2 size={18} />발주 저장 완료</>
                  : <><Save size={18} />발주 저장</>}
              </motion.button>
            </div>
          )}

          <AccordionSection
            title="재고 흐름"
            icon={<Package size={14} className="text-primary-500" />}
            open={openFlow}
            onToggle={() => setOpenFlow((v) => !v)}
          >
            <StockFlowCard items={activeItems} stockMap={stockMap} usageMap={usageMap} wasteMap={wasteMap} orderMap={orderMap} />
          </AccordionSection>

          <AccordionSection
            title="발주 이력"
            icon={<ClipboardList size={14} className="text-[var(--text-secondary)]" />}
            open={openHistory}
            onToggle={() => setOpenHistory((v) => !v)}
          >
            <OrderHistory items={items} />
          </AccordionSection>
        </>
      )}
    </motion.div>
  );
}
