"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { toDateString } from "@/lib/utils/date";

/** 홈 배지에 표시할 미완료 항목 수 */
export function useHomeBadge() {
  const { storeId } = useStoreSettings();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!storeId) return;
    const supabase = createClient();
    const today = toDateString(new Date());
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = toDateString(d);

    async function check() {
      let pending = 0;

      // 오늘 마감 안 됨
      const { data: todayClosing } = await supabase
        .from("sb_daily_closing")
        .select("id")
        .eq("store_id", storeId!)
        .eq("date", today)
        .single();

      if (!todayClosing) pending++;

      // 어제 마감 안 됨
      const { data: yesterdayClosing } = await supabase
        .from("sb_daily_closing")
        .select("id")
        .eq("store_id", storeId!)
        .eq("date", yesterday)
        .single();

      if (!yesterdayClosing) pending++;

      setCount(pending);
    }

    check();
  }, [storeId]);

  return count;
}
