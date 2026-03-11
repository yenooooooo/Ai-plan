"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { createClient } from "@/lib/supabase/client";

function useStoreHydration() {
  const { storeId, setStoreId, setStoreName, setBusinessType } = useStoreSettings();

  useEffect(() => {
    if (storeId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("sb_stores")
        .select("id, store_name, business_type")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setStoreId(data.id);
            setStoreName(data.store_name);
            setBusinessType(data.business_type);
          }
        });
    });
  }, [storeId, setStoreId, setStoreName, setBusinessType]);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useStoreHydration();

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

      {/* 토스트 알림 */}
      <ToastContainer />

      {/* iOS 홈 화면 추가 안내 */}
      <IOSInstallPrompt />

      {/* 오프라인 표시 */}
      <OfflineIndicator />
    </div>
  );
}
