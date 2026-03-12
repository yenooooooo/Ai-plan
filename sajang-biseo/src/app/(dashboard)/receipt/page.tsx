"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Download,
  Plus,
  Grid3X3,
  List,
} from "lucide-react";
import { CaptureFlowPanel } from "@/components/receipt/CaptureFlowPanel";
import { FilterBar } from "@/components/receipt/FilterBar";
import { ReceiptList } from "@/components/receipt/ReceiptList";
import { ReceiptDetailModal } from "@/components/receipt/ReceiptDetailModal";
import { SummaryCards } from "@/components/receipt/SummaryCards";
import { ReceiptGallery } from "@/components/receipt/ReceiptGallery";
import { MonthlyExpenseReport } from "@/components/receipt/MonthlyExpenseReport";
import CategoryBudget from "@/components/receipt/CategoryBudget";
import { ReceiptExport } from "@/components/receipt/ReceiptExport";
import { useReceiptData } from "@/hooks/useReceiptData";
import { useToast } from "@/stores/useToast";
import { usePlan } from "@/hooks/usePlan";
import { receiptsToCsv, downloadCsv } from "@/lib/receipt/csvExport";
import type { Receipt } from "@/lib/supabase/types";

type Tab = "list" | "capture";
type GroupBy = "date" | "category";
type ViewMode = "list" | "gallery";

export default function ReceiptPage() {
  const {
    receipts,
    categories,
    loading,
    filter,
    setFilter,
    saveReceipt,
    updateReceipt,
    deleteReceipt,
    hasMore,
    loadMore,
  } = useReceiptData();
  const toast = useToast((s) => s.show);
  const { limits } = usePlan();

  const [tab, setTab] = useState<Tab>("list");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // 경비 저장 (CaptureFlowPanel에서 호출)
  async function handleSaveEntry(data: {
    date: string;
    merchantName: string;
    totalAmount: number;
    vatAmount: number | null;
    paymentMethod: "카드" | "현금" | "이체";
    cardLastFour: string | null;
    categoryId: string | null;
    memo: string;
    confidence: number;
    imageUrl: string;
  }) {
    await saveReceipt(data);
    toast("경비가 저장되었습니다", "success");

    // 저장된 날짜가 현재 필터 범위 밖이면 해당 월로 필터 이동
    const savedMonth = data.date.slice(0, 7);
    const filterMonth = filter.dateFrom.slice(0, 7);
    if (savedMonth !== filterMonth) {
      const monthStart = `${savedMonth}-01`;
      const lastDay = new Date(parseInt(savedMonth.slice(0, 4)), parseInt(savedMonth.slice(5, 7)), 0).getDate();
      const monthEnd = `${savedMonth}-${String(lastDay).padStart(2, "0")}`;
      setFilter((prev) => ({ ...prev, dateFrom: monthStart, dateTo: monthEnd }));
    }

    setTab("list");
  }

  // CSV 다운로드
  function handleDownloadCsv() {
    const csv = receiptsToCsv(receipts, categories);
    if (csv) {
      const filename = `영수증_${filter.dateFrom}_${filter.dateTo}.csv`;
      downloadCsv(csv, filename);
    }
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-heading-lg text-[var(--text-primary)] mb-1">
            영수증 장부
          </h1>
          <p className="text-body-small text-[var(--text-secondary)]">
            경비를 카테고리별로 관리하세요
          </p>
        </div>
        {tab === "list" && receipts.length > 0 && limits.csvExport && (
          <button
            onClick={handleDownloadCsv}
            className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] press-effect"
          >
            <Download size={18} />
          </button>
        )}
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-5">
        <button
          onClick={() => setTab("list")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
            tab === "list"
              ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
              : "text-[var(--text-tertiary)]"
          }`}
        >
          <ClipboardList size={15} />
          장부 조회
        </button>
        <button
          onClick={() => setTab("capture")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
            tab === "capture"
              ? "bg-[var(--bg-elevated)] text-primary-500 shadow-sm"
              : "text-[var(--text-tertiary)]"
          }`}
        >
          <Plus size={15} />
          경비 등록
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── 장부 조회 탭 ── */}
        {tab === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <FilterBar filter={filter} onChange={setFilter} categories={categories} />
            <SummaryCards receipts={receipts} categories={categories} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-caption text-[var(--text-tertiary)]">
                  {receipts.length}건
                </span>
                <div className="flex bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                  <button onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-primary-500/15 text-primary-500" : "text-[var(--text-tertiary)]"}`}>
                    <List size={14} />
                  </button>
                  <button onClick={() => setViewMode("gallery")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "gallery" ? "bg-primary-500/15 text-primary-500" : "text-[var(--text-tertiary)]"}`}>
                    <Grid3X3 size={14} />
                  </button>
                </div>
              </div>
              {viewMode === "list" && (
                <div className="flex bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                  {(["date", "category"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGroupBy(g)}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                        groupBy === g
                          ? "bg-primary-500/15 text-primary-500"
                          : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {g === "date" ? "날짜별" : "카테고리별"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : viewMode === "gallery" ? (
              <ReceiptGallery receipts={receipts} onItemClick={setSelectedReceipt} />
            ) : (
              <>
                <ReceiptList
                  receipts={receipts}
                  categories={categories}
                  groupBy={groupBy}
                  onItemClick={setSelectedReceipt}
                />
                {hasMore && (
                  <button onClick={loadMore}
                    className="w-full py-3 rounded-xl text-caption font-medium text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 transition-colors press-effect mt-3">
                    더 보기
                  </button>
                )}
              </>
            )}

            <MonthlyExpenseReport receipts={receipts} categories={categories} />
            <CategoryBudget receipts={receipts} categories={categories} />
            <ReceiptExport receipts={receipts} categories={categories} dateFrom={filter.dateFrom} dateTo={filter.dateTo} />
          </motion.div>
        )}

        {/* ── 경비 등록 탭 ── */}
        {tab === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <CaptureFlowPanel
              categories={categories}
              onSave={handleSaveEntry}
              onDone={() => setTab("list")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상세 모달 */}
      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptDetailModal
            receipt={selectedReceipt}
            categories={categories}
            onClose={() => setSelectedReceipt(null)}
            onDelete={deleteReceipt}
            onUpdate={updateReceipt}
          />
        )}
      </AnimatePresence>

      {/* FAB 경비 등록 버튼 (장부 조회 시) */}
      {tab === "list" && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setTab("capture")}
          className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center press-effect z-40"
        >
          <Plus size={24} />
        </motion.button>
      )}
    </div>
  );
}
