"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* 데스크톱: 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <Header />

        {/* 콘텐츠 */}
        <main className="flex-1 px-4 py-5 pb-24 lg:pb-5 max-w-screen-lg mx-auto w-full">
          {children}
        </main>

        {/* 모바일: 하단 네비 */}
        <BottomNav />
      </div>

      {/* 스크롤 투 탑 */}
      <ScrollToTop />
    </div>
  );
}
