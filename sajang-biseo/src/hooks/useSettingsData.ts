"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { CARD_FEE_TIERS } from "@/lib/fees/presets";

export interface DeliveryChannelSetting {
  id: string;
  channel_name: string;
  rate: number;
  is_active: boolean;
}

export function useSettingsData() {
  const { storeId, setStoreName: setGlobalStoreName, setBusinessType: setGlobalBusinessType } =
    useStoreSettings();

  // 매장 정보
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [storeInfoSaving, setStoreInfoSaving] = useState(false);
  const [storeInfoSaved, setStoreInfoSaved] = useState(false);

  // 수수료 기본값
  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannelSetting[]>([]);
  const [deliveryAgencyId, setDeliveryAgencyId] = useState<string | null>(null);
  const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(3300);
  const [cardTierIndex, setCardTierIndex] = useState(1);
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);

  // 계정
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    if (!storeId) return;
    const supabase = createClient();

    const { data: store } = await supabase
      .from("sb_stores")
      .select("store_name, business_type, address, phone")
      .eq("id", storeId)
      .single();
    if (store) {
      setStoreName(store.store_name);
      setBusinessType(store.business_type);
      setAddress(store.address ?? "");
      setPhone(store.phone ?? "");
    }

    const { data: channels } = await supabase
      .from("sb_fee_channels")
      .select("id, channel_name, rate, fixed_amount, category, is_active")
      .eq("store_id", storeId)
      .is("deleted_at", null)
      .order("sort_order");
    if (channels) {
      setDeliveryChannels(
        channels
          .filter((ch) => ch.category === "delivery")
          .map((ch) => ({ id: ch.id, channel_name: ch.channel_name, rate: ch.rate ?? 0, is_active: ch.is_active }))
      );
      const agency = channels.find((ch) => ch.category === "delivery_agency");
      if (agency) {
        setDeliveryAgencyId(agency.id);
        setDeliveryFeePerOrder(agency.fixed_amount ?? 3300);
      }
    }

    const { data: feeSettings } = await supabase
      .from("sb_store_fee_settings")
      .select("credit_card_rate")
      .eq("store_id", storeId)
      .single();
    if (feeSettings) {
      const idx = CARD_FEE_TIERS.findIndex((t) => t.rate === feeSettings.credit_card_rate);
      setCardTierIndex(idx >= 0 ? idx : 1);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setEmail(user.email);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const saveStoreInfo = async () => {
    if (!storeName.trim()) return;
    setStoreInfoSaving(true);
    try {
      if (storeId) {
        const supabase = createClient();
        await supabase
          .from("sb_stores")
          .update({ store_name: storeName, business_type: businessType, address: address || null, phone: phone || null })
          .eq("id", storeId);
      }
      setGlobalStoreName(storeName);
      setGlobalBusinessType(businessType);
      setStoreInfoSaved(true);
      setTimeout(() => setStoreInfoSaved(false), 2000);
    } finally {
      setStoreInfoSaving(false);
    }
  };

  const saveFeeSettings = async () => {
    setFeeSaving(true);
    try {
      if (storeId) {
        const supabase = createClient();
        const tier = CARD_FEE_TIERS[cardTierIndex];

        await supabase
          .from("sb_store_fee_settings")
          .upsert(
            { store_id: storeId, credit_card_rate: tier.rate, check_card_rate: tier.checkRate, annual_revenue_tier: tier.label },
            { onConflict: "store_id" }
          );

        await Promise.all(
          deliveryChannels.map((ch) =>
            supabase
              .from("sb_fee_channels")
              .update({ rate: ch.rate, is_active: ch.is_active })
              .eq("id", ch.id)
          )
        );

        if (deliveryAgencyId) {
          await supabase
            .from("sb_fee_channels")
            .update({ fixed_amount: deliveryFeePerOrder })
            .eq("id", deliveryAgencyId);
        }
      }

      setFeeSaved(true);
      setTimeout(() => setFeeSaved(false), 2000);
    } finally {
      setFeeSaving(false);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return {
    storeName, setStoreName, businessType, setBusinessType,
    address, setAddress, phone, setPhone,
    storeInfoSaving, storeInfoSaved, saveStoreInfo,
    deliveryChannels, setDeliveryChannels,
    deliveryFeePerOrder, setDeliveryFeePerOrder,
    cardTierIndex, setCardTierIndex,
    feeSaving, feeSaved, saveFeeSettings,
    email, logout,
  };
}
