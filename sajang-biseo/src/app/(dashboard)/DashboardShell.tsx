"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { PullToRefresh } from "@/components/shared/PullToRefresh";
import { InvitationBanner } from "@/components/shared/InvitationBanner";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useTeamRoleStore } from "@/stores/useTeamRole";
import { createClient } from "@/lib/supabase/client";

function useStoreHydration() {
  const { storeId, setStoreId, setStoreName, setBusinessType } = useStoreSettings();
  const setRole = useTeamRoleStore((s) => s.setRole);

  // 매장이 없을 때: 소유 매장 → 팀 매장 순으로 hydrate
  useEffect(() => {
    if (storeId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: owned } = await supabase
        .from("sb_stores")
        .select("id, store_name, business_type")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .limit(1)
        .maybeSingle();

      if (owned) {
        setStoreId(owned.id);
        setStoreName(owned.store_name);
        setBusinessType(owned.business_type);
        setRole("owner");
        return;
      }

      if (!user.email) return;
      const res = await fetch("/api/stores/accessible");
      const json = await res.json();
      const stores = json.stores ?? [];
      if (stores.length > 0) {
        const first = stores[0];
        setStoreId(first.id);
        setStoreName(first.storeName);
        setBusinessType(first.businessType);
        setRole(first.role);
      }
    });
  }, [storeId, setStoreId, setStoreName, setBusinessType, setRole]);

  // 매장이 이미 설정된 경우: 역할만 서버에서 갱신
  useEffect(() => {
    if (!storeId) return;
    fetch("/api/stores/accessible")
      .then((r) => r.json())
      .then((data) => {
        const stores = data.stores ?? [];
        const current = stores.find((s: { id: string }) => s.id === storeId);
        if (current) setRole(current.role);
      })
      .catch(() => { /* ignore */ });
  }, [storeId, setRole]);
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
          <InvitationBanner />
          <PullToRefresh>{children}</PullToRefresh>
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
