"use client";

import { useCallback } from "react";
import { useSettingsData } from "@/hooks/useSettingsData";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { createClient } from "@/lib/supabase/client";
import { StoreInfoSection } from "@/components/settings/StoreInfoSection";
import { FeeDefaultsSection } from "@/components/settings/FeeDefaultsSection";
import { MonthlyGoalSection } from "@/components/settings/MonthlyGoalSection";
import { PresetsSection } from "@/components/settings/PresetsSection";
import { ThemeSection } from "@/components/settings/ThemeSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { AppInfoSection } from "@/components/settings/AppInfoSection";
import { TeamSection } from "@/components/settings/TeamSection";
import { CouponSection } from "@/components/settings/CouponSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { PlanUsageSection } from "@/components/settings/PlanUsageSection";
import { LeaveStoreSection } from "@/components/settings/LeaveStoreSection";
import { SupportSection } from "@/components/settings/SupportSection";
import { useTeamRole } from "@/hooks/useTeamRole";

export default function SettingsPage() {
  const {
    loading,
    storeName, setStoreName,
    businessType, setBusinessType,
    address, setAddress,
    phone, setPhone,
    storeInfoSaving, storeInfoSaved, saveStoreInfo,
    deliveryChannels, setDeliveryChannels,
    deliveryFeePerOrder, setDeliveryFeePerOrder,
    cardTierIndex, setCardTierIndex,
    feeSaving, feeSaved, saveFeeSettings,
    addDeliveryChannel, removeDeliveryChannel,
    email, logout,
  } = useSettingsData();

  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const { isOwner } = useTeamRole();

  const handleChannelRateChange = (id: string, rate: number) => {
    setDeliveryChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, rate } : ch));
  };

  const handleChannelActiveToggle = (id: string, active: boolean) => {
    setDeliveryChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, is_active: active } : ch));
  };

  // #12 CSV 내보내기
  const handleExportData = useCallback(async () => {
    if (!storeId) { toast("매장 정보가 없습니다", "error"); return; }
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sb_daily_closing")
        .select("date, total_sales, total_fees, net_sales, fee_rate, memo")
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .order("date", { ascending: false })
        .limit(365);
      if (error) throw error;
      if (!data || data.length === 0) { toast("내보낼 데이터가 없습니다", "info"); return; }

      const header = "날짜,총매출,총수수료,순매출,수수료율(%),메모";
      const rows = data.map((r) =>
        `${r.date},${r.total_sales},${r.total_fees},${r.net_sales},${r.fee_rate},"${(r.memo ?? "").replace(/"/g, '""')}"`
      );
      const csv = "\uFEFF" + [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `매출데이터_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast("CSV 파일이 다운로드되었습니다", "success");
    } catch { toast("데이터 내보내기에 실패했습니다", "error"); }
  }, [storeId, toast]);

  // #4 로딩 스피너
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 max-w-lg mx-auto pb-8">
      <div>
        <h1 className="text-heading-lg text-[var(--text-primary)]">설정</h1>
        <p className="text-caption text-[var(--text-tertiary)] mt-0.5">매장 정보와 수수료를 관리하세요</p>
      </div>

      {isOwner && (
        <>
          <StoreInfoSection
            storeName={storeName}
            businessType={businessType}
            address={address}
            phone={phone}
            saving={storeInfoSaving}
            saved={storeInfoSaved}
            onStoreNameChange={setStoreName}
            onBusinessTypeChange={setBusinessType}
            onAddressChange={setAddress}
            onPhoneChange={setPhone}
            onSave={saveStoreInfo}
          />

          <FeeDefaultsSection
            deliveryChannels={deliveryChannels}
            deliveryFeePerOrder={deliveryFeePerOrder}
            cardTierIndex={cardTierIndex}
            saving={feeSaving}
            saved={feeSaved}
            onChannelRateChange={handleChannelRateChange}
            onChannelActiveToggle={handleChannelActiveToggle}
            onDeliveryFeeChange={setDeliveryFeePerOrder}
            onCardTierChange={setCardTierIndex}
            onAddChannel={addDeliveryChannel}
            onRemoveChannel={removeDeliveryChannel}
            onSave={saveFeeSettings}
          />
        </>
      )}

      <MonthlyGoalSection />

      {isOwner && <PresetsSection />}

      <NotificationSection />

      {/* #8 다크모드 토글 */}
      <ThemeSection />

      {isOwner && <PlanUsageSection />}

      {isOwner && <TeamSection />}

      {!isOwner && <LeaveStoreSection />}

      {isOwner && <CouponSection />}

      <SupportSection />

      <AccountSection email={email} onLogout={logout} />

      {/* #13 앱 정보 + #12 데이터 내보내기 */}
      <AppInfoSection onExportData={handleExportData} />
    </div>
  );
}
