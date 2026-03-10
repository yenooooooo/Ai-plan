"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ClipboardList, BarChart3, Settings2, Save, Trash2,
  ChevronDown, Plus, Sparkles, AlertTriangle, CheckCircle2, Wand2,
} from "lucide-react";
import { ItemGroupAccordion } from "@/components/order/ItemGroupAccordion";
import { ItemEditModal } from "@/components/order/ItemEditModal";
import { UsageStepper } from "@/components/order/UsageStepper";
import { RecommendationCard } from "@/components/order/RecommendationCard";
import { OrderSheet } from "@/components/order/OrderSheet";
import { StockFlowCard } from "@/components/order/StockFlowCard";
import { PriceHistoryCard } from "@/components/order/PriceHistoryCard";
import { OrderOnboarding } from "@/components/order/OrderOnboarding";
import { OrderHistory } from "@/components/order/OrderHistory";
import { ShelfLifeAlert } from "@/components/order/ShelfLifeAlert";
import { UsageChart } from "@/components/order/UsageChart";
import { CostRatioCard } from "@/components/order/CostRatioCard";
import { WasteTracker } from "@/components/order/WasteTracker";
import { StockAlertBanner } from "@/components/order/StockAlertBanner";
import { SupplierDirectory } from "@/components/order/SupplierDirectory";
import { OrderExport } from "@/components/order/OrderExport";
import { OrderTemplates } from "@/components/order/OrderTemplates";
import { StockReceiving } from "@/components/order/StockReceiving";
import { formatDateShort, addDays } from "@/lib/utils/date";
import { useOrderData } from "@/hooks/useOrderData";
import { useOrderAnalytics } from "@/hooks/useOrderAnalytics";

type Tab = "usage" | "recommend" | "analytics" | "settings";

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
  { key: "usage", label: "사용량", icon: ClipboardList },
  { key: "recommend", label: "발주추천", icon: Sparkles },
  { key: "analytics", label: "분석", icon: BarChart3 },
  { key: "settings", label: "품목관리", icon: Settings2 },
];

export default function OrderPage() {
  const [tab, setTab] = useState<Tab>("usage");
  const [showWaste, setShowWaste] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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
  const showOnboarding = !loading && !hasItems;
  const hasAutoFillData = Object.keys(avgUsageMap).length > 0;

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5">
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">발주 추천</h1>
        <p className="text-body-small text-[var(--text-secondary)]">AI가 내일 필요한 식자재를 추천해드려요</p>
      </div>

      {showOnboarding && (
        <OrderOnboarding hasItems={hasItems} hasUsage={hasUsageData || usageSaved} hasOrders={orderSaved} onGoToTab={(t) => setTab(t as Tab)} />
      )}

      {/* 재고 부족 알림 배너 */}
      {hasItems && !showOnboarding && (
        <div className="mb-4">
          <StockAlertBanner items={items} stockMap={stockMap} avgUsageMap={avgUsageMap} onGoToRecommend={() => setTab("recommend")} />
        </div>
      )}

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5 overflow-x-auto">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${tab === key ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm" : "text-[var(--text-tertiary)]"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── 사용량 입력 탭 ── */}
        {tab === "usage" && (
          <motion.div key="usage" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span className="text-body-small font-semibold text-[var(--text-primary)]">오늘 사용량 입력</span>
                </div>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[var(--bg-tertiary)] rounded-lg px-3 py-1.5 text-caption text-[var(--text-primary)] outline-none" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => applyPreset("weekday")} className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-caption text-[var(--text-secondary)] hover:text-primary-500 transition-colors press-effect">평일기본</button>
                <button onClick={() => applyPreset("weekend")} className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-caption text-[var(--text-secondary)] hover:text-primary-500 transition-colors press-effect">주말기본</button>
                <button onClick={() => setUsageMap({})} className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-caption text-[var(--text-secondary)] hover:text-primary-500 transition-colors press-effect">직접입력</button>
                {hasAutoFillData && (
                  <button onClick={autoFillUsage} className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-caption text-primary-500 font-medium hover:bg-primary-500/20 transition-colors press-effect flex items-center gap-1">
                    <Wand2 size={12} />자동 채우기
                  </button>
                )}
              </div>
            </div>

            {groups.map((group) => {
              const groupItems = activeItems.filter((i) => i.group_id === group.id);
              if (groupItems.length === 0) return null;
              return (
                <div key={group.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                    <span>{group.icon ?? "📦"}</span>
                    <span className="text-body-small font-semibold text-[var(--text-primary)]">{group.group_name}</span>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {groupItems.map((item) => (
                      <UsageStepper key={item.id} itemId={item.id} itemName={item.item_name} unit={item.unit} value={usageMap[item.id] ?? 0} remainingStock={stockMap[item.id]} prevValue={prevUsageMap[item.id]} onChange={handleUsageChange} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* 폐기 입력 토글 */}
            <button onClick={() => setShowWaste(!showWaste)} className="flex items-center gap-2 w-full glass-card p-4 press-effect">
              <Trash2 size={16} className="text-danger" />
              <span className="text-body-small text-danger font-medium">폐기 입력</span>
              <motion.div animate={{ rotate: showWaste ? 180 : 0 }} className="ml-auto">
                <ChevronDown size={16} className="text-[var(--text-tertiary)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showWaste && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {groups.map((group) => {
                    const groupItems = activeItems.filter((i) => i.group_id === group.id);
                    if (groupItems.length === 0) return null;
                    return (
                      <div key={`waste-${group.id}`} className="glass-card p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                          <span>{group.icon ?? "📦"}</span>
                          <span className="text-body-small font-semibold text-[var(--text-primary)]">{group.group_name} (폐기)</span>
                        </div>
                        <div className="divide-y divide-[var(--border-subtle)]">
                          {groupItems.map((item) => (
                            <UsageStepper key={`waste-${item.id}`} itemId={item.id} itemName={item.item_name} unit={item.unit} value={wasteMap[item.id] ?? 0} onChange={handleWasteChange} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 입고 처리 */}
            <StockReceiving items={items} onReceive={receiveStock} receiving={stockReceiving} />

            {/* 저장 버튼 */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={saveUsage} disabled={usageSaving || (!hasUsageData && !usageSaved)}
              className={`w-full py-4 rounded-2xl font-semibold text-body-small flex items-center justify-center gap-2 press-effect ${usageSaved ? "bg-success/10 text-success" : "bg-primary-500 text-white"} disabled:opacity-50`}>
              {usageSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : usageSaved ? <><CheckCircle2 size={18} />저장 완료</>
                : <><Save size={18} />사용량 저장</>}
            </motion.button>
          </motion.div>
        )}

        {/* ── 발주 추천 탭 ── */}
        {tab === "recommend" && (
          <motion.div key="recommend" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
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
                // 템플릿 품목을 확정 상태에 반영
                Array.from(Object.entries(templateItems)).forEach(([itemId, qty]) => {
                  if (qty > 0) handleConfirm(itemId, qty);
                });
              }}
            />

            {recLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-body-small text-[var(--text-tertiary)]">사용량 데이터가 부족합니다.<br />일일 사용량을 먼저 입력해주세요.</p>
              </div>
            ) : (
              <>
                {needOrderRecs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-warning" />
                      <span className="text-body-small font-medium text-[var(--text-secondary)]">발주 필요 ({needOrderRecs.length}개)</span>
                    </div>
                    <div className="space-y-3">
                      {needOrderRecs.map((rec) => (
                        <RecommendationCard key={rec.itemId} rec={rec} onConfirm={handleConfirm} confirmed={confirmedItems.has(rec.itemId)} />
                      ))}
                    </div>
                  </div>
                )}
                {sufficientRecs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-success" />
                      <span className="text-body-small font-medium text-[var(--text-secondary)]">재고 충분 ({sufficientRecs.length}개)</span>
                    </div>
                    <div className="glass-card p-3">
                      <div className="space-y-1.5">
                        {sufficientRecs.map((rec) => (
                          <div key={rec.itemId} className="flex items-center justify-between text-caption">
                            <span className="text-[var(--text-secondary)]">{rec.itemName}</span>
                            <span className="text-[var(--text-tertiary)]">재고 {rec.currentStock}{rec.unit}, 예상 {rec.expectedUsage}{rec.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {confirmedItems.size > 0 && (
                  <>
                    <OrderSheet confirmedItems={confirmedList} itemsMap={itemsMap} orderDate={formatDateShort(addDays(new Date(), 1))} />
                    <OrderExport confirmedItems={confirmedList} itemsMap={itemsMap} orderDate={formatDateShort(addDays(new Date(), 1))} />
                    <motion.button whileTap={{ scale: 0.97 }} onClick={saveOrders} disabled={orderSaving}
                      className={`w-full py-3.5 rounded-2xl font-semibold text-body-small flex items-center justify-center gap-2 press-effect ${orderSaved ? "bg-success/10 text-success" : "bg-primary-500 text-white"} disabled:opacity-50`}>
                      {orderSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : orderSaved ? <><CheckCircle2 size={18} />발주 저장 완료</>
                        : <><Save size={18} />발주 저장</>}
                    </motion.button>
                  </>
                )}

                <StockFlowCard items={activeItems} stockMap={stockMap} usageMap={usageMap} wasteMap={wasteMap} orderMap={orderMap} />
                <OrderHistory items={items} />
              </>
            )}
          </motion.div>
        )}

        {/* ── 분석 탭 ── */}
        {tab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
            {analytics.loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
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
                <UsageChart data={analytics.usageChartData} itemName={selectedItem?.item_name ?? "식자재"} unit={selectedItem?.unit ?? ""} />
                <CostRatioCard totalCost={analytics.totalCost} grossSales={analytics.grossSales} netSales={analytics.netSales} monthLabel={analytics.monthLabel} />
                <WasteTracker totalWasteCost={analytics.totalWasteCost} topWasteItems={analytics.topWasteItems} monthLabel={analytics.monthLabel} />
                <ShelfLifeAlert items={items} stockMap={stockMap} usageMap={usageMap} />
                <PriceHistoryCard items={items} />
              </>
            )}
          </motion.div>
        )}

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
                {/* 거래처 관리 */}
                <SupplierDirectory items={items} />
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
