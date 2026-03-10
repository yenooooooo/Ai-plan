"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ClipboardList, BarChart3, Settings2,
  Plus, Sparkles,
} from "lucide-react";
import { ItemGroupAccordion } from "@/components/order/ItemGroupAccordion";
import { ItemEditModal } from "@/components/order/ItemEditModal";
import { UsageChart } from "@/components/order/UsageChart";
import { CostRatioCard } from "@/components/order/CostRatioCard";
import { WasteTracker } from "@/components/order/WasteTracker";
import { ShelfLifeAlert } from "@/components/order/ShelfLifeAlert";
import { PriceHistoryCard } from "@/components/order/PriceHistoryCard";
import { StockAlertBanner } from "@/components/order/StockAlertBanner";
import { SupplierDirectory } from "@/components/order/SupplierDirectory";
import { OrderOnboarding } from "@/components/order/OrderOnboarding";
import { OrderUsageTab } from "@/components/order/OrderUsageTab";
import { OrderRecommendTab } from "@/components/order/OrderRecommendTab";
import { AccordionSection } from "@/components/closing/AccordionSection";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderAnalytics } from "@/hooks/useOrderAnalytics";

type Tab = "settings" | "usage" | "recommend" | "analytics";

function AddGroupInline({ adding, name, onToggle, onNameChange, onSubmit }: {
  adding: boolean; name: string;
  onToggle: () => void; onNameChange: (v: string) => void; onSubmit: () => void;
}) {
  return adding ? (
    <div className="flex gap-2">
      <input autoFocus type="text" value={name} onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onToggle(); }}
        placeholder="카테고리 이름"
        className="flex-1 h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)] border border-primary-500 focus:outline-none" />
      <button onClick={onSubmit} disabled={!name.trim()} className="px-4 h-10 rounded-xl bg-primary-500 text-white text-body-small font-medium disabled:opacity-40">추가</button>
      <button onClick={onToggle} className="px-3 h-10 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-secondary)]">취소</button>
    </div>
  ) : (
    <button onClick={onToggle} className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--border-default)] text-body-small text-[var(--text-tertiary)] hover:text-primary-500 hover:border-primary-500/30 transition-colors flex items-center justify-center gap-2 press-effect">
      <Plus size={16} />카테고리 추가
    </button>
  );
}

const TAB_CONFIG: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "settings", label: "품목관리", icon: Settings2 },
  { key: "usage", label: "사용량", icon: ClipboardList },
  { key: "recommend", label: "발주추천", icon: Sparkles },
  { key: "analytics", label: "분석", icon: BarChart3 },
];

export default function OrderPage() {
  const [tab, setTab] = useState<Tab>("settings");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // 분석 탭 아코디언
  const [analyticsOpen, setAnalyticsOpen] = useState<Record<string, boolean>>({
    chart: true, cost: false, waste: false, shelf: false, price: false,
  });

  const {
    groups, loading, activeItems, itemsMap,
    selectedDate, setSelectedDate,
    usageMap, setUsageMap, wasteMap, stockMap, prevUsageMap,
    usageSaving, usageSaved, hasUsageData,
    editModal, setEditModal,
    confirmedItems, confirmedList, recLoading,
    needOrderRecs, sufficientRecs, orderDateLabel, recommendations,
    orderMap, setOrderMap, orderSaving, orderSaved,
    handleUsageChange, handleWasteChange, applyPreset, saveUsage,
    generateRecs, initializeFromTemplate,
    handleConfirm, handleAddGroup, handleSaveItem, handleDeleteItem, handleToggleItem,
    applyConfirmedToOrders, saveOrders,
    items,
    avgUsageMap, autoFillUsage,
    stockReceiving, receiveStock,
  } = useOrderData();

  const analyticsItemId = useMemo(() => selectedItemId ?? (activeItems[0]?.id ?? null), [selectedItemId, activeItems]);
  const analytics = useOrderAnalytics(items, analyticsItemId);
  const selectedItem = useMemo(() => items.find((i) => i.id === analyticsItemId), [items, analyticsItemId]);

  useEffect(() => { if (tab === "recommend") generateRecs(); }, [tab, generateRecs]);
  useEffect(() => { if (confirmedItems.size > 0) applyConfirmedToOrders(); }, [confirmedItems, applyConfirmedToOrders]);

  const hasItems = activeItems.length > 0;
  // 온보딩은 전체 플로우 완료 전까지 표시
  const showOnboarding = !loading && (!hasItems || !usageSaved && !hasUsageData || !orderSaved);
  const hasAutoFillData = Object.keys(avgUsageMap).length > 0;

  // 첫 방문 시 품목관리 탭, 품목 있으면 사용량 탭
  useEffect(() => {
    if (!loading && hasItems && tab === "settings") setTab("usage");
  }, [loading, hasItems]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">발주 추천</h1>
        <p className="text-body-small text-[var(--text-secondary)]">AI가 내일 필요한 식자재를 추천해드려요</p>
      </div>

      {showOnboarding && (
        <OrderOnboarding hasItems={hasItems} hasUsage={hasUsageData || usageSaved} hasOrders={orderSaved} onGoToTab={(t) => setTab(t as Tab)} />
      )}

      {/* 재고 부족 알림 */}
      {hasItems && !showOnboarding && (
        <div className="mb-4">
          <StockAlertBanner items={items} stockMap={stockMap} avgUsageMap={avgUsageMap} onGoToRecommend={() => setTab("recommend")} />
        </div>
      )}

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5 overflow-x-auto">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${tab === key ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm" : "text-[var(--text-tertiary)]"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── 품목 관리 탭 ── */}
        {tab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="glass-card p-8 text-center space-y-4">
                <p className="text-body-small text-[var(--text-secondary)] font-medium">등록된 품목이 없어요</p>
                <p className="text-caption text-[var(--text-tertiary)]">업종에 맞는 기본 품목을 자동으로 불러올 수 있어요</p>
                <button onClick={() => initializeFromTemplate()}
                  className="mx-auto px-6 py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
                  <Package size={15} />기본 품목 불러오기
                </button>
                <AddGroupInline adding={addingGroup} name={newGroupName}
                  onToggle={() => { setAddingGroup((v) => !v); setNewGroupName(""); }}
                  onNameChange={setNewGroupName}
                  onSubmit={async () => { const ok = await handleAddGroup(newGroupName); if (ok) { setAddingGroup(false); setNewGroupName(""); } }} />
              </div>
            ) : (
              <>
                {groups.map((group) => (
                  <ItemGroupAccordion key={group.id} group={group}
                    items={items.filter((i) => i.group_id === group.id)}
                    onAddItem={(groupId) => setEditModal({ open: true, item: null, groupId })}
                    onEditItem={(item) => setEditModal({ open: true, item, groupId: item.group_id ?? "" })}
                    onSaveItem={handleSaveItem} onDeleteItem={handleDeleteItem} onToggleItem={handleToggleItem}
                    editingItemId={editingItemId} onSetEditingItemId={setEditingItemId} />
                ))}
                <AddGroupInline adding={addingGroup} name={newGroupName}
                  onToggle={() => { setAddingGroup((v) => !v); setNewGroupName(""); }}
                  onNameChange={setNewGroupName}
                  onSubmit={async () => { const ok = await handleAddGroup(newGroupName); if (ok) { setAddingGroup(false); setNewGroupName(""); } }} />
                <SupplierDirectory items={items} />
              </>
            )}
          </motion.div>
        )}

        {/* ── 사용량 입력 탭 ── */}
        {tab === "usage" && (
          hasItems ? (
            <OrderUsageTab
              groups={groups} activeItems={activeItems}
              usageMap={usageMap} setUsageMap={setUsageMap}
              wasteMap={wasteMap} stockMap={stockMap} prevUsageMap={prevUsageMap}
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              handleUsageChange={handleUsageChange} handleWasteChange={handleWasteChange}
              applyPreset={applyPreset} hasAutoFillData={hasAutoFillData} autoFillUsage={autoFillUsage}
              items={items} receiveStock={receiveStock} stockReceiving={stockReceiving}
              saveUsage={saveUsage} usageSaving={usageSaving} usageSaved={usageSaved} hasUsageData={hasUsageData}
              onGoToRecommend={() => setTab("recommend")}
            />
          ) : (
            <motion.div key="usage-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center space-y-3">
              <Package size={32} className="mx-auto text-[var(--text-tertiary)]" />
              <p className="text-body-small text-[var(--text-secondary)] font-medium">먼저 품목을 등록해주세요</p>
              <p className="text-caption text-[var(--text-tertiary)]">품목관리에서 관리할 식자재를 등록하면 사용량을 입력할 수 있어요</p>
              <button onClick={() => setTab("settings")} className="mx-auto px-5 py-2 rounded-xl bg-primary-500 text-white text-body-small font-medium press-effect">
                품목관리 가기
              </button>
            </motion.div>
          )
        )}

        {/* ── 발주 추천 탭 ── */}
        {tab === "recommend" && (
          <OrderRecommendTab
            recLoading={recLoading} recommendations={recommendations}
            needOrderRecs={needOrderRecs} sufficientRecs={sufficientRecs}
            confirmedItems={confirmedItems} confirmedList={confirmedList}
            orderDateLabel={orderDateLabel} handleConfirm={handleConfirm}
            orderMap={orderMap} setOrderMap={setOrderMap}
            orderSaving={orderSaving} orderSaved={orderSaved} saveOrders={saveOrders}
            applyConfirmedToOrders={applyConfirmedToOrders}
            activeItems={activeItems} stockMap={stockMap} usageMap={usageMap} wasteMap={wasteMap}
            itemsMap={itemsMap} items={items}
            onGoToUsage={() => setTab("usage")}
          />
        )}

        {/* ── 분석 탭 ── */}
        {tab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
            {analytics.loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : !hasItems ? (
              <div className="glass-card p-8 text-center space-y-3">
                <BarChart3 size={32} className="mx-auto text-[var(--text-tertiary)]" />
                <p className="text-body-small text-[var(--text-secondary)] font-medium">분석할 데이터가 없습니다</p>
                <p className="text-caption text-[var(--text-tertiary)]">품목을 등록하고 사용량을 입력하면 분석 데이터가 표시됩니다</p>
              </div>
            ) : (
              <>
                {activeItems.length > 1 && (
                  <div className="glass-card p-3">
                    <select value={analyticsItemId ?? ""} onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full bg-transparent text-body-small text-[var(--text-primary)] outline-none">
                      {activeItems.map((item) => <option key={item.id} value={item.id}>{item.item_name}</option>)}
                    </select>
                  </div>
                )}
                <AccordionSection title="사용량 추이" icon={<ClipboardList size={14} className="text-primary-500" />}
                  open={analyticsOpen.chart} onToggle={() => setAnalyticsOpen((p) => ({ ...p, chart: !p.chart }))}>
                  <UsageChart data={analytics.usageChartData} itemName={selectedItem?.item_name ?? "식자재"} unit={selectedItem?.unit ?? ""} />
                </AccordionSection>
                <AccordionSection title="원가율" icon={<BarChart3 size={14} className="text-primary-500" />}
                  open={analyticsOpen.cost} onToggle={() => setAnalyticsOpen((p) => ({ ...p, cost: !p.cost }))}>
                  <CostRatioCard totalCost={analytics.totalCost} grossSales={analytics.grossSales} netSales={analytics.netSales} monthLabel={analytics.monthLabel} />
                </AccordionSection>
                <AccordionSection title="폐기 분석" icon={<BarChart3 size={14} className="text-warning" />}
                  open={analyticsOpen.waste} onToggle={() => setAnalyticsOpen((p) => ({ ...p, waste: !p.waste }))}>
                  <WasteTracker totalWasteCost={analytics.totalWasteCost} topWasteItems={analytics.topWasteItems} monthLabel={analytics.monthLabel} />
                </AccordionSection>
                <AccordionSection title="유통기한 알림" icon={<BarChart3 size={14} className="text-danger" />}
                  open={analyticsOpen.shelf} onToggle={() => setAnalyticsOpen((p) => ({ ...p, shelf: !p.shelf }))}>
                  <ShelfLifeAlert items={items} stockMap={stockMap} usageMap={usageMap} />
                </AccordionSection>
                <AccordionSection title="단가 이력" icon={<BarChart3 size={14} className="text-info" />}
                  open={analyticsOpen.price} onToggle={() => setAnalyticsOpen((p) => ({ ...p, price: !p.price }))}>
                  <PriceHistoryCard items={items} />
                </AccordionSection>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal.open && (
          <ItemEditModal item={editModal.item} groupId={editModal.groupId} onSave={handleSaveItem} onClose={() => setEditModal({ open: false, groupId: "" })} />
        )}
      </AnimatePresence>
    </div>
  );
}
