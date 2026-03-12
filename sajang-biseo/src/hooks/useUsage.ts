"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlanType } from "@/lib/plan";

interface FeatureUsage {
  used: number;
  limit: number; // Infinity는 JSON에서 null로 전달
}

interface UsageData {
  plan: PlanType;
  planLabel: string;
  planExpiresAt: string | null;
  usage: {
    receipt_ocr: FeatureUsage;
    review_generate: FeatureUsage;
  };
  resetDate: string;
  loading: boolean;
  refresh: () => void;
}

/** 사용자 플랜 + 사용량 조회 훅 */
export function useUsage(): UsageData {
  const [data, setData] = useState<Omit<UsageData, "loading" | "refresh"> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/usage");
      const json = await res.json();
      if (json.success && json.data) {
        // JSON에서 null(Infinity)을 복원
        const raw = json.data;
        setData({
          plan: raw.plan,
          planLabel: raw.planLabel,
          planExpiresAt: raw.planExpiresAt,
          usage: {
            receipt_ocr: {
              used: raw.usage.receipt_ocr.used,
              limit: raw.usage.receipt_ocr.limit ?? Infinity,
            },
            review_generate: {
              used: raw.usage.review_generate.used,
              limit: raw.usage.review_generate.limit ?? Infinity,
            },
          },
          resetDate: raw.resetDate,
        });
      }
    } catch {
      // 조용히 실패
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const defaults: Omit<UsageData, "loading" | "refresh"> = {
    plan: "free",
    planLabel: "무료",
    planExpiresAt: null,
    usage: {
      receipt_ocr: { used: 0, limit: 5 },
      review_generate: { used: 0, limit: 3 },
    },
    resetDate: "",
  };

  return {
    ...(data ?? defaults),
    loading,
    refresh: fetchUsage,
  };
}
