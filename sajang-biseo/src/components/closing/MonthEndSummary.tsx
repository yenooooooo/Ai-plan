"use client";

import { useState, useEffect } from "react";
import { X, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";

interface MonthData {
  totalSales: number;
  totalFees: number;
  totalExpenses: number;
  netProfit: number;
  closingCount: number;
  dailyAvg: number;
  bestDay: { date: string; sales: number };
  worstDay: { date: string; sales: number };
  prevMonthSales: number;
}

interface MonthEndSummaryProps {
  selectedMonth: string; // "YYYY-MM"
  onClose: () => void;
}

function StatCard({ label, value, sub, icon }: {
  label: string; value: string; sub?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
      <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-body-small font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
      {sub && <p className="text-[11px] text-[var(--text-tertiary)]">{sub}</p>}
    </div>
  );
}

export function MonthEndSummary({ selectedMonth, onClose }: MonthEndSummaryProps) {
  const { storeId } = useStoreSettings();
  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);

  const monthLabel = `${parseInt(selectedMonth.split("-")[1])}월`;

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      const supabase = createClient();
      const monthStart = `${selectedMonth}-01`;
      const nextMonth = new Date(selectedMonth + "-01T00:00:00");
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthEnd = new Date(nextMonth.getTime() - 86400000).toISOString().split("T")[0];

      const prevMonth = new Date(selectedMonth + "-01T00:00:00");
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevStart = prevMonth.toISOString().split("T")[0].slice(0, 8) + "01";
      const prevEnd = new Date(new Date(selectedMonth + "-01T00:00:00").getTime() - 86400000)
        .toISOString().split("T")[0];

      const [currentRes, prevRes] = await Promise.all([
        supabase.from("sb_daily_closing").select("*")
          .eq("store_id", storeId).gte("date", monthStart).lte("date", monthEnd)
          .is("deleted_at", null).order("date"),
        supabase.from("sb_daily_closing").select("total_sales")
          .eq("store_id", storeId).gte("date", prevStart).lte("date", prevEnd)
          .is("deleted_at", null),
      ]);

      const closings = currentRes.data ?? [];
      const prevClosings = prevRes.data ?? [];

      if (closings.length === 0) { setLoading(false); return; }

      const totalSales = closings.reduce((s, c) => s + c.total_sales, 0);
      const totalFees = closings.reduce((s, c) => s + c.total_fees, 0);
      const expenses = closings.reduce((s, c) => {
        const exp = (c.daily_expenses as { amount: number }[] | null) ?? [];
        return s + exp.reduce((a, e) => a + e.amount, 0);
      }, 0);

      const sorted = [...closings].sort((a, b) => b.total_sales - a.total_sales);
      const prevMonthSales = prevClosings.reduce((s, c) => s + c.total_sales, 0);

      setData({
        totalSales, totalFees, totalExpenses: expenses,
        netProfit: totalSales - totalFees - expenses,
        closingCount: closings.length,
        dailyAvg: Math.round(totalSales / closings.length),
        bestDay: { date: sorted[0].date, sales: sorted[0].total_sales },
        worstDay: { date: sorted[sorted.length - 1].date, sales: sorted[sorted.length - 1].total_sales },
        prevMonthSales,
      });
      setLoading(false);
    })();
  }, [storeId, selectedMonth]);

  const changeRate = data && data.prevMonthSales > 0
    ? ((data.totalSales - data.prevMonthSales) / data.prevMonthSales) * 100
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[var(--bg-primary)] rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" />
              <h2 className="text-heading-md text-[var(--text-primary)]">{monthLabel} 요약</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
              <X size={18} className="text-[var(--text-tertiary)]" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-center text-[var(--text-tertiary)] py-4">해당 월의 마감 데이터가 없습니다</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="총매출" value={formatCurrency(data.totalSales)} />
                <StatCard label="순이익" value={formatCurrency(data.netProfit)}
                  sub={`수수료 ${formatCurrency(data.totalFees)}`} />
                <StatCard label="영업일수" value={`${data.closingCount}일`}
                  sub={`일 평균 ${formatCurrency(data.dailyAvg)}`} />
                <StatCard label="전월 대비"
                  value={changeRate !== null ? `${changeRate >= 0 ? "+" : ""}${changeRate.toFixed(1)}%` : "-"}
                  icon={changeRate !== null ? (
                    changeRate > 0 ? <TrendingUp size={14} className="text-success" />
                    : changeRate < 0 ? <TrendingDown size={14} className="text-danger" />
                    : <Minus size={14} />
                  ) : undefined}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-caption px-1">
                  <span className="text-[var(--text-tertiary)]">최고 매출일</span>
                  <span className="text-success font-medium">
                    {data.bestDay.date.slice(5)} · {formatCurrency(data.bestDay.sales)}
                  </span>
                </div>
                <div className="flex justify-between text-caption px-1">
                  <span className="text-[var(--text-tertiary)]">최저 매출일</span>
                  <span className="text-danger font-medium">
                    {data.worstDay.date.slice(5)} · {formatCurrency(data.worstDay.sales)}
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
