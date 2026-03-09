"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronRight, Flame,
  BarChart3, Package, Receipt, MessageSquare,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useHomeData } from "@/hooks/useHomeData";
import { formatCurrency } from "@/lib/utils/format";

const QUICK_MENU = [
  { label: "마감", icon: BarChart3, href: "/closing", color: "text-primary-500" },
  { label: "발주", icon: Package, href: "/order", color: "text-[var(--net-income)]" },
  { label: "장부", icon: Receipt, href: "/receipt", color: "text-warning" },
  { label: "리뷰", icon: MessageSquare, href: "/review", color: "text-[#8B5CF6]" },
];

export default function HomePage() {
  const { loading, storeName, greeting, summary, todos } = useHomeData();

  const salesChange = summary.todaySales !== null && summary.yesterdaySales !== null && summary.yesterdaySales > 0
    ? Math.round(((summary.todaySales - summary.yesterdaySales) / summary.yesterdaySales) * 100)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 max-w-lg mx-auto">
      {/* 인사말 */}
      <div className="pt-1">
        <p className="text-caption text-[var(--text-tertiary)]">{greeting}</p>
        <h1 className="text-heading-lg text-[var(--text-primary)]">
          {storeName || "사장님"}, 오늘도 화이팅!
        </h1>
      </div>

      {/* 스트릭 */}
      {summary.streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20"
        >
          <Flame size={18} className="text-[var(--accent-orange)]" />
          <span className="text-body-small font-medium text-[var(--accent-orange)]">
            {summary.streak}일 연속 마감 기록 중!
          </span>
        </motion.div>
      )}

      {/* 오늘의 할 일 */}
      <section className="glass-card p-4 space-y-3">
        <h2 className="text-body-small font-semibold text-[var(--text-primary)]">오늘의 할 일</h2>
        <div className="space-y-2">
          {todos.map((todo) => (
            <Link
              key={todo.key}
              href={todo.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors press-effect ${
                todo.done
                  ? "bg-[var(--bg-tertiary)]/50"
                  : "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {todo.done ? (
                <CheckCircle2 size={20} className="text-success shrink-0" />
              ) : (
                <Circle size={20} className={`shrink-0 ${todo.urgent ? "text-[var(--accent-orange)]" : "text-[var(--text-tertiary)]"}`} />
              )}
              <span className={`flex-1 text-body-small font-medium ${
                todo.done ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"
              }`}>
                {todo.label}
              </span>
              {!todo.done && <ChevronRight size={16} className="text-[var(--text-tertiary)]" />}
            </Link>
          ))}
        </div>
      </section>

      {/* 매출 요약 카드 */}
      <section className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-body-small font-semibold text-[var(--text-primary)]">매출 현황</h2>
          <Link href="/closing" className="text-caption text-primary-500 font-medium press-effect">
            자세히
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 오늘 매출 */}
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-[var(--text-tertiary)]">오늘 매출</p>
            <p className="text-body-small font-display font-bold text-[var(--text-primary)]">
              {summary.todaySales !== null ? formatCurrency(summary.todaySales) : "미입력"}
            </p>
            {salesChange !== null && (
              <div className={`flex items-center gap-0.5 ${salesChange >= 0 ? "text-success" : "text-danger"}`}>
                {salesChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="text-[10px] font-medium">전일 대비 {Math.abs(salesChange)}%</span>
              </div>
            )}
          </div>

          {/* 이번 달 누적 */}
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-[var(--text-tertiary)]">이번 달 누적</p>
            <p className="text-body-small font-display font-bold text-[var(--text-primary)]">
              {formatCurrency(summary.monthlySales)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{summary.monthlyDays}일 기록</p>
          </div>

          {/* 일 평균 */}
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-[var(--text-tertiary)]">일 평균</p>
            <p className="text-body-small font-display font-bold text-[var(--text-primary)]">
              {summary.monthlyDays > 0
                ? formatCurrency(Math.round(summary.monthlySales / summary.monthlyDays))
                : "-"}
            </p>
          </div>

          {/* 이번 달 지출 */}
          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-[var(--text-tertiary)]">이번 달 경비</p>
            <p className="text-body-small font-display font-bold text-[var(--fee-deducted)]">
              {summary.recentExpenseTotal > 0
                ? formatCurrency(summary.recentExpenseTotal)
                : "-"}
            </p>
          </div>
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="glass-card p-4 space-y-3">
        <h2 className="text-body-small font-semibold text-[var(--text-primary)]">빠른 메뉴</h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 py-3 rounded-xl
                bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]
                transition-colors press-effect"
            >
              <item.icon size={22} className={item.color} />
              <span className="text-caption font-medium text-[var(--text-secondary)]">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 주간 브리핑 바로가기 */}
      <Link
        href="/briefing"
        className="glass-card p-4 flex items-center justify-between press-effect group block"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary-500" />
          </div>
          <div>
            <p className="text-body-small font-semibold text-[var(--text-primary)]">주간 경영 브리핑</p>
            <p className="text-caption text-[var(--text-tertiary)]">AI가 분석한 이번 주 인사이트</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-primary-500 transition-colors" />
      </Link>
    </div>
  );
}
