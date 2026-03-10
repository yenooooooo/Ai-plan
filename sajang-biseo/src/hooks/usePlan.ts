"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPlanLimits, type PlanType, type PlanLimits } from "@/lib/plan";

interface PlanState {
  plan: PlanType;
  limits: PlanLimits;
  loading: boolean;
}

/** 현재 사용자 플랜 조회 훅 */
export function usePlan(): PlanState {
  const [plan, setPlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase
        .from("sb_user_profiles")
        .select("plan")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          const p = (data as { plan?: string } | null)?.plan;
          if (p === "pro" || p === "pro_plus") setPlan(p);
          setLoading(false);
        });
    });
  }, []);

  return { plan, limits: getPlanLimits(plan), loading };
}
