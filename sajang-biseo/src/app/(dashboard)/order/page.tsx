"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ClipboardList, BarChart3, Settings2,
  Plus, Sparkles, CheckSquare, Trash2, EyeOff, X,
} from "lucide-react";
import { ItemGroupAccordion } from "@/components/order/ItemGroupAccordion";
import { ItemEditModal } from "@/components/order/ItemEditModal";
import { ItemSearch } from "@/components/order/ItemSearch";
import { TemplateSelector } from "@/components/order/TemplateSelector";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PlanGate } from "@/components/shared/PlanGate";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderAnalytics } from "@/hooks/useOrderAnalytics";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useUIState } from "@/stores/useUIState";
import { useTeamRole } from "@/hooks/useTeamRole";

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
  const orderTab = useUIState((s) => s.orderTab);
  const setOrderTab = useUIState((s) => s.setOrderTab);
  const tab = orderTab as Tab;
  const setTab = setOrderTab;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  const analyticsOpen = useUIState((s) => s.orderAnalyticsOpen);
  const setAnalyticsOpenKey = useUIState((s) => s.setOrderAnalyticsOpen);

  const { businessType } = useStoreSettings();
  const { canEdit, isViewer } = useTeamRole();
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    generateRecs, initializeFromSelected,
    handleConfirm, handleRemoveConfirmed, handleUpdateConfirmedQty, handleClearAllConfirmed,
    handleAddGroup, handleSaveItem, handleDeleteItem, handleToggleItem,
    handleRenameGroup, handleDeleteGroup, handleReorderGroup, handleMoveItem, handleBulkAction,
    applyConfirmedToOrders, saveOrders,
    items, avgUsageMap, autoFillUsage, copyToNextDay,
    stockReceiving, receiveStock,
  } = useOrderData();

  const analyticsItemId = useMemo(() => selectedItemId ?? (activeItems[0]?.id ?? null), [selectedItemId, activeItems]);
  const analytics = useOrderAnalytics(items, analyticsItemId, groups);
  const selectedItem = useMemo(() => items.find((i) => i.id === analyticsItemId), [items, analyticsItemId]);

  // 발주추천 뱃지를 위해 항상 추천 생성
  useEffect(() => { generateRecs(); }, [generateRecs]);
  useEffect(() => { if (confirmedItems.size > 0) applyConfirmedToOrders(); }, [confirmedItems, applyConfirmedToOrders]);

  const hasItems = activeItems.length > 0;
  const showOnboarding = !loading && (!hasItems || !usageSaved && !hasUsageData || !orderSaved);
  const hasAutoFillData = Object.keys(avgUsageMap).length > 0;

  useEffect(() => {
    if (!loading && hasItems && tab === "settings") setTab("usage");
  }, [loading, hasItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const scrollToGroup = (groupId: string) => {
    groupRefs.current[groupId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 미저장 경고: 사용량 탭에서 데이터가 있는데 저장 안 했으면 확인
  const switchTab = (t: Tab) => {
    if (tab === "usage" && hasUsageData && !usageSaved && t !== "usage") {
      setPendingTab(t);
      return;
    }
    setTab(t);
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">발주 추천</h1>
        <p className="text-body-small text-[var(--text-secondary)]">AI가 내일 필요한 식자재를 추천해드려요</p>
        {isViewer && <p className="text-caption text-warning mt-1">조회 전용 권한입니다</p>}
      </div>

      {showOnboarding && (
        <OrderOnboarding hasItems={hasItems} hasUsage={hasUsageData || usageSaved} hasOrders={orderSaved} onGoToTab={(t) => setTab(t as Tab)} />
      )}

      {hasItems && !showOnboarding && (
        <div className="mb-4">
          <StockAlertBanner items={items} stockMap={stockMap} avgUsageMap={avgUsageMap} onGoToRecommend={() => setTab("recommend")} />
        </div>
      )}

      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5 overflow-x-auto">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => switchTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 whitespace-nowrap relative ${tab === key ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm" : "text-[var(--text-tertiary)]"}`}>
            <Icon size={15} />{label}
            {/* 발주추천 뱃지 */}
            {key === "recommend" && needOrderRecs.length > 0 && tab !== "recommend" && (
              <span className="px-1.5 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                {needOrderRecs.length}
              </span>
            )}
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
                <p className="text-caption text-[var(--text-tertiary)]">업종에 맞는 기본 품목을 골라서 추가할 수 있어요</p>
                <button onClick={() => setShowTemplateSelector(true)} disabled={!canEdit}
                  className="mx-auto px-6 py-2.5 rounded-xl bg-primary-500 text-white text-body-small font-medium hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Package size={15} />품목 선택해서 불러오기
                </button>
                <AddGroupInline adding={addingGroup} name={newGroupName}
                  onToggle={() => { setAddingGroup((v) => !v); setNewGroupName(""); }}
                  onNameChange={setNewGroupName}
                  onSubmit={async () => { const ok = await handleAddGroup(newGroupName); if (ok) { setAddingGroup(false); setNewGroupName(""); } }} />
              </div>
            ) : (
              <>
                <ItemSearch items={items} groups={groups} onScrollToGroup={scrollToGroup} />
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setShowTemplateSelector(true)} disabled={!canEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-caption text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:text-primary-500 transition-colors press-effect disabled:opacity-50">
                    <Package size={13} />템플릿 추가
                  </button>
                  <div className="flex items-center gap-1.5">
                    {selectMode ? (
                      <>
                        <span className="text-caption text-[var(--text-tertiary)]">{selectedIds.size}개 선택</span>
                        <button onClick={async () => { await handleBulkAction(Array.from(selectedIds), "deactivate"); exitSelectMode(); }}
                          disabled={selectedIds.size === 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-caption text-warning bg-warning/10 disabled:opacity-40">
                          <EyeOff size={12} />비활성화
                        </button>
                        <button onClick={async () => { await handleBulkAction(Array.from(selectedIds), "delete"); exitSelectMode(); }}
                          disabled={selectedIds.size === 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-caption text-danger bg-danger/10 disabled:opacity-40">
                          <Trash2 size={12} />삭제
                        </button>
                        <button onClick={exitSelectMode} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]">
                          <X size={14} />
                        </button>
                      </>
                    ) : canEdit ? (
                      <button onClick={() => setSelectMode(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-caption text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:text-primary-500 transition-colors press-effect">
                        <CheckSquare size={13} />선택
                      </button>
                    ) : null}
                  </div>
                </div>

                {groups.map((group, idx) => (
                  <div key={group.id} ref={(el) => { groupRefs.current[group.id] = el; }}>
                    <ItemGroupAccordion group={group}
                      items={items.filter((i) => i.group_id === group.id)}
                      allGroups={groups} isFirst={idx === 0} isLast={idx === groups.length - 1}
                      selectMode={selectMode} selectedIds={selectedIds} onToggleSelect={toggleSelectId}
                      onAddItem={(groupId) => setEditModal({ open: true, item: null, groupId })}
                      onSaveItem={handleSaveItem} onDeleteItem={handleDeleteItem} onToggleItem={handleToggleItem}
                      onRenameGroup={handleRenameGroup} onDeleteGroup={handleDeleteGroup}
                      onReorderGroup={handleReorderGroup} onMoveItem={handleMoveItem}
                      editingItemId={editingItemId} onSetEditingItemId={setEditingItemId} />
                  </div>
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
              copyToNextDay={copyToNextDay}
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
          <PlanGate requiredPlan="pro" featureName="AI 발주 추천">
            <OrderRecommendTab
              recLoading={recLoading} recommendations={recommendations}
              needOrderRecs={needOrderRecs} sufficientRecs={sufficientRecs}
              confirmedItems={confirmedItems} confirmedList={confirmedList}
              orderDateLabel={orderDateLabel} handleConfirm={handleConfirm}
              handleRemoveConfirmed={handleRemoveConfirmed}
              handleUpdateConfirmedQty={handleUpdateConfirmedQty}
              handleClearAllConfirmed={handleClearAllConfirmed}
              orderMap={orderMap} setOrderMap={setOrderMap}
              orderSaving={orderSaving} orderSaved={orderSaved} saveOrders={saveOrders}
              applyConfirmedToOrders={applyConfirmedToOrders}
              activeItems={activeItems} stockMap={stockMap} usageMap={usageMap} wasteMap={wasteMap}
              itemsMap={itemsMap} items={items}
              onGoToUsage={() => setTab("usage")}
            />
          </PlanGate>
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
                  open={analyticsOpen.chart} onToggle={() => setAnalyticsOpenKey("chart", !analyticsOpen.chart)}>
                  <UsageChart data={analytics.usageChartData} itemName={selectedItem?.item_name ?? "식자재"} unit={selectedItem?.unit ?? ""} />
                </AccordionSection>
                <AccordionSection title="원가율" icon={<BarChart3 size={14} className="text-primary-500" />}
                  open={analyticsOpen.cost} onToggle={() => setAnalyticsOpenKey("cost", !analyticsOpen.cost)}>
                  <CostRatioCard totalCost={analytics.totalCost} grossSales={analytics.grossSales} netSales={analytics.netSales}
                    monthLabel={analytics.monthLabel} categoryCosts={analytics.categoryCosts} businessType={businessType ?? undefined} />
                </AccordionSection>
                <AccordionSection title="폐기 분석" icon={<BarChart3 size={14} className="text-warning" />}
                  open={analyticsOpen.waste} onToggle={() => setAnalyticsOpenKey("waste", !analyticsOpen.waste)}>
                  <WasteTracker totalWasteCost={analytics.totalWasteCost} topWasteItems={analytics.topWasteItems} monthLabel={analytics.monthLabel} />
                </AccordionSection>
                <AccordionSection title="유통기한 알림" icon={<BarChart3 size={14} className="text-danger" />}
                  open={analyticsOpen.shelf} onToggle={() => setAnalyticsOpenKey("shelf", !analyticsOpen.shelf)}>
                  <ShelfLifeAlert items={items} stockMap={stockMap} usageMap={usageMap} />
                </AccordionSection>
                <AccordionSection title="단가 이력" icon={<BarChart3 size={14} className="text-info" />}
                  open={analyticsOpen.price} onToggle={() => setAnalyticsOpenKey("price", !analyticsOpen.price)}>
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

      <AnimatePresence>
        {showTemplateSelector && (
          <TemplateSelector
            businessType={businessType || "한식"}
            onImport={initializeFromSelected}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* 미저장 경고 다이얼로그 */}
      <ConfirmDialog
        open={!!pendingTab}
        title="저장되지 않은 데이터"
        message="사용량 데이터가 저장되지 않았습니다. 저장하지 않고 이동하시겠습니까?"
        confirmLabel="이동" cancelLabel="머물기" danger
        onConfirm={() => { if (pendingTab) setTab(pendingTab); setPendingTab(null); }}
        onCancel={() => setPendingTab(null)}
      />
    </div>
  );
}
