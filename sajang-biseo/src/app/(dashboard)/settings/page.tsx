"use client";

import { useSettingsData } from "@/hooks/useSettingsData";
import { StoreInfoSection } from "@/components/settings/StoreInfoSection";
import { FeeDefaultsSection } from "@/components/settings/FeeDefaultsSection";
import { MonthlyGoalSection } from "@/components/settings/MonthlyGoalSection";
import { PresetsSection } from "@/components/settings/PresetsSection";
import { AccountSection } from "@/components/settings/AccountSection";

export default function SettingsPage() {
  const {
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

  const handleChannelRateChange = (id: string, rate: number) => {
    setDeliveryChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, rate } : ch));
  };

  const handleChannelActiveToggle = (id: string, active: boolean) => {
    setDeliveryChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, is_active: active } : ch));
  };

  return (
    <div className="animate-fade-in space-y-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-heading-lg text-[var(--text-primary)]">설정</h1>
        <p className="text-caption text-[var(--text-tertiary)] mt-0.5">매장 정보와 수수료를 관리하세요</p>
      </div>

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

      <MonthlyGoalSection />

      <PresetsSection />

      <AccountSection email={email} onLogout={logout} />
    </div>
  );
}
