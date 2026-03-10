"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { DEFAULT_CATEGORIES } from "@/lib/receipt/categories";
import type { Receipt, ReceiptCategory } from "@/lib/supabase/types";
import type { ReceiptFilter } from "@/components/receipt/FilterBar";

const PAGE_SIZE = 30;

export function useReceiptData() {
  const supabase = useMemo(() => createClient(), []);
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<ReceiptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(0);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toISOString().split("T")[0];

  const [filter, setFilter] = useState<ReceiptFilter>({
    dateFrom: monthStart,
    dateTo: today,
    categoryIds: [],
    paymentMethods: [],
    amountMin: "",
    amountMax: "",
    weekdays: [],
  });

  // 카테고리 로드 + 초기화
  const loadCategories = useCallback(async () => {
    if (!storeId) return;

    const { data } = await supabase
      .from("sb_receipt_categories")
      .select("*")
      .or(`store_id.is.null,store_id.eq.${storeId}`)
      .is("deleted_at", null)
      .order("sort_order");

    if (data && data.length > 0) {
      setCategories(data);
    } else {
      // DB에 시스템 카테고리 없으면 메모리 기본값 사용 (RLS 우회)
      setCategories(
        DEFAULT_CATEGORIES.map((c, i) => ({
          id: `default-${i}`,
          store_id: null,
          code: c.code,
          label: c.label,
          icon: c.icon,
          tax_item: c.taxItem,
          is_system: true,
          sort_order: i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        }))
      );
    }
  }, [storeId, supabase]);

  // 영수증 로드 (필터 적용 + 페이지네이션)
  const loadReceipts = useCallback(async (append = false) => {
    if (!storeId) return;
    if (!append) { setLoading(true); pageRef.current = 0; }

    const from = pageRef.current * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let query = supabase
      .from("sb_receipts")
      .select("*")
      .eq("store_id", storeId)
      .is("deleted_at", null)
      .gte("date", filter.dateFrom)
      .lte("date", filter.dateTo)
      .order("date", { ascending: false })
      .range(from, to);

    if (filter.categoryIds.length > 0) {
      query = query.in("category_id", filter.categoryIds);
    }
    if (filter.paymentMethods.length > 0) {
      query = query.in("payment_method", filter.paymentMethods as ("카드" | "현금" | "이체")[]);
    }
    if (filter.amountMin) {
      query = query.gte("total_amount", parseInt(filter.amountMin));
    }
    if (filter.amountMax) {
      query = query.lte("total_amount", parseInt(filter.amountMax));
    }

    const { data, error: queryError } = await query;
    if (queryError) {
      setError("영수증 데이터를 불러오지 못했습니다");
      toast("영수증 데이터를 불러오지 못했습니다", "error");
    }
    let filtered = data ?? [];

    // 요일 필터 (클라이언트 사이드)
    if (filter.weekdays.length > 0 && filter.weekdays.length < 7) {
      filtered = filtered.filter((r) => {
        const d = new Date(r.date);
        return filter.weekdays.includes(d.getDay());
      });
    }

    setHasMore((data ?? []).length > PAGE_SIZE);
    const trimmed = filtered.slice(0, PAGE_SIZE);
    setReceipts((prev) => append ? [...prev, ...trimmed] : trimmed);
    setLoading(false);
  }, [storeId, filter, supabase, toast]);

  const loadMore = useCallback(() => {
    pageRef.current += 1;
    loadReceipts(true);
  }, [loadReceipts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadReceipts(false);
  }, [loadReceipts]);

  // 영수증 저장
  const saveReceipt = useCallback(
    async (data: {
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
    }) => {
      if (!storeId) return;

      const { error: insertErr } = await supabase.from("sb_receipts").insert({
        store_id: storeId,
        date: data.date,
        merchant_name: data.merchantName,
        total_amount: data.totalAmount,
        vat_amount: data.vatAmount,
        payment_method: data.paymentMethod,
        card_last_four: data.cardLastFour,
        category_id: data.categoryId,
        memo: data.memo || null,
        image_url: data.imageUrl,
        ocr_confidence: data.confidence,
      });
      if (insertErr) { console.error("영수증 저장 실패:", insertErr); return; }

      await loadReceipts();
    },
    [storeId, supabase, loadReceipts]
  );

  // 영수증 수정
  const updateReceipt = useCallback(
    async (id: string, data: {
      date: string;
      merchantName: string;
      totalAmount: number;
      vatAmount: number | null;
      paymentMethod: "카드" | "현금" | "이체";
      cardLastFour: string | null;
      categoryId: string | null;
      memo: string;
    }) => {
      const { error: updateErr } = await supabase
        .from("sb_receipts")
        .update({
          date: data.date,
          merchant_name: data.merchantName,
          total_amount: data.totalAmount,
          vat_amount: data.vatAmount,
          payment_method: data.paymentMethod,
          card_last_four: data.cardLastFour,
          category_id: data.categoryId,
          memo: data.memo || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (updateErr) {
        console.error("영수증 수정 실패:", updateErr);
        toast("영수증 수정에 실패했습니다", "error");
        return;
      }
      toast("영수증이 수정되었습니다", "success");
      await loadReceipts();
    },
    [supabase, loadReceipts, toast]
  );

  // 영수증 삭제 (soft delete)
  const deleteReceipt = useCallback(
    async (id: string) => {
      const { error: deleteErr } = await supabase
        .from("sb_receipts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (deleteErr) {
        console.error("영수증 삭제 실패:", deleteErr);
        toast("영수증 삭제에 실패했습니다", "error");
        return;
      }
      toast("영수증이 삭제되었습니다", "success");
      await loadReceipts();
    },
    [supabase, loadReceipts, toast]
  );

  return {
    receipts,
    categories,
    loading,
    error,
    filter,
    setFilter,
    saveReceipt,
    updateReceipt,
    deleteReceipt,
    hasMore,
    loadMore,
    reload: loadReceipts,
  };
}
