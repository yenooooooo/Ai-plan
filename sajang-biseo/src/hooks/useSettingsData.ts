"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";
import { CARD_FEE_TIERS } from "@/lib/fees/presets";

export interface DeliveryChannelSetting {
  id: string;
  channel_name: string;
  rate: number;
  is_active: boolean;
}

export function useSettingsData() {
  const { storeId, setStoreName: setGlobalStoreName, setBusinessType: setGlobalBusinessType } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [storeInfoSaving, setStoreInfoSaving] = useState(false);
  const [storeInfoSaved, setStoreInfoSaved] = useState(false);
  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannelSetting[]>([]);
  const [deliveryAgencyId, setDeliveryAgencyId] = useState<string | null>(null);
  const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(3300);
  const [cardTierIndex, setCardTierIndex] = useState(1);
  const [feeSaving, setFeeSaving] = useState(false);  const [feeSaved, setFeeSaved] = useState(false);  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!storeId) { setLoading(false); return; }
    const supabase = createClient();
    Promise.all([
      supabase.from("sb_stores").select("store_name, business_type, address, phone").eq("id", storeId).maybeSingle(),
      supabase.from("sb_fee_channels").select("id, channel_name, rate, fixed_amount, category, is_active")
        .eq("store_id", storeId).is("deleted_at", null).order("sort_order"),
      supabase.from("sb_store_fee_settings").select("credit_card_rate").eq("store_id", storeId).maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([storeRes, channelsRes, feeRes, userRes]) => {
      if (storeRes.data) {
        setStoreName(storeRes.data.store_name); setBusinessType(storeRes.data.business_type);
        setAddress(storeRes.data.address ?? ""); setPhone(storeRes.data.phone ?? "");
      }
      if (channelsRes.data) {
        setDeliveryChannels(channelsRes.data.filter((ch) => ch.category === "delivery")
          .map((ch) => ({ id: ch.id, channel_name: ch.channel_name, rate: ch.rate ?? 0, is_active: ch.is_active })));
        const agency = channelsRes.data.find((ch) => ch.category === "delivery_agency");
        if (agency) { setDeliveryAgencyId(agency.id); setDeliveryFeePerOrder(agency.fixed_amount ?? 3300); }
      }
      if (feeRes.data) {
        const idx = CARD_FEE_TIERS.findIndex((t) => t.rate === feeRes.data!.credit_card_rate);
        setCardTierIndex(idx >= 0 ? idx : 1);
      }
      if (userRes.data.user?.email) setEmail(userRes.data.user.email);
    }).catch(() => toast("설정을 불러오지 못했습니다", "error"))
      .finally(() => setLoading(false));
  }, [storeId, toast]);

  const saveStoreInfo = async () => {
    if (!storeName.trim() || !storeId) return;
    setStoreInfoSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sb_stores")
        .update({ store_name: storeName, business_type: businessType, address: address || null, phone: phone || null })
        .eq("id", storeId);
      if (error) throw error;
      setGlobalStoreName(storeName); setGlobalBusinessType(businessType);
      setStoreInfoSaved(true); toast("매장 정보가 저장되었습니다", "success");
      setTimeout(() => setStoreInfoSaved(false), 2000);
    } catch { toast("매장 정보 저장에 실패했습니다", "error"); }
    finally { setStoreInfoSaving(false); }
  };

  const saveFeeSettings = async () => {
    if (!storeId) return;
    setFeeSaving(true);
    try {
      const supabase = createClient();
      const tier = CARD_FEE_TIERS[cardTierIndex];
      await Promise.all([
        supabase.from("sb_store_fee_settings").upsert(
          { store_id: storeId, credit_card_rate: tier.rate, check_card_rate: tier.checkRate, annual_revenue_tier: tier.label },
          { onConflict: "store_id" }),
        ...deliveryChannels.map((ch) =>
          supabase.from("sb_fee_channels").update({ rate: ch.rate, is_active: ch.is_active }).eq("id", ch.id)),
        ...(deliveryAgencyId
          ? [supabase.from("sb_fee_channels").update({ fixed_amount: deliveryFeePerOrder }).eq("id", deliveryAgencyId)]
          : []),
      ]);
      setFeeSaved(true); toast("수수료 설정이 저장되었습니다", "success");
      setTimeout(() => setFeeSaved(false), 2000);
    } catch { toast("수수료 설정 저장에 실패했습니다", "error"); }
    finally { setFeeSaving(false); }
  };

  const addDeliveryChannel = async (channelName: string) => {
    if (!channelName.trim()) return;
    if (!storeId) {
      setDeliveryChannels((prev) => [...prev, { id: `local-${Date.now()}`, channel_name: channelName.trim(), rate: 0, is_active: true }]);
      return;
    }
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("sb_fee_channels").insert({
        store_id: storeId, channel_name: channelName.trim(), fee_type: "percentage" as const,
        rate: 0, category: "delivery" as const, is_active: true, sort_order: deliveryChannels.length,
      }).select("id, channel_name, rate, is_active").single();
      if (error) throw error;
      if (data) setDeliveryChannels((prev) => [...prev, { id: data.id, channel_name: data.channel_name, rate: data.rate ?? 0, is_active: data.is_active }]);
      toast("채널이 추가되었습니다", "success");
    } catch { toast("채널 추가에 실패했습니다", "error"); }
  };

  const removeDeliveryChannel = async (channelId: string) => {
    if (channelId.startsWith("local-")) {
      setDeliveryChannels((prev) => prev.filter((ch) => ch.id !== channelId));
      return;
    }
    if (!storeId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sb_fee_channels")
        .update({ deleted_at: new Date().toISOString() }).eq("id", channelId);
      if (error) throw error;
      setDeliveryChannels((prev) => prev.filter((ch) => ch.id !== channelId));
      toast("채널이 삭제되었습니다", "success");
    } catch { toast("채널 삭제에 실패했습니다", "error"); }
  };

  const logout = async () => {
    // 사용자 데이터 localStorage 정리
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        (k) => k.startsWith("closing-draft") || k.startsWith("closing-custom-tags")
          || k === "cost-ratio-target" || k.startsWith("sajang-dismissed-notices")
      );
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch { /* SSR guard */ }
    const supabase = createClient();
    await supabase.auth.signOut(); window.location.href = "/login";
  };

  return {
    loading, storeName, setStoreName, businessType, setBusinessType,
    address, setAddress, phone, setPhone,
    storeInfoSaving, storeInfoSaved, saveStoreInfo,
    deliveryChannels, setDeliveryChannels,
    deliveryFeePerOrder, setDeliveryFeePerOrder,
    cardTierIndex, setCardTierIndex,
    feeSaving, feeSaved, saveFeeSettings,
    addDeliveryChannel, removeDeliveryChannel,
    email, logout,
  };
}
