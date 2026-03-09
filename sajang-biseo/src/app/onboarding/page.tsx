"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { FEE_PRESETS, CARD_FEE_TIERS } from "@/lib/fees/presets";
import { StepStoreInfo } from "@/components/onboarding/StepStoreInfo";
import { StepFeeSetup } from "@/components/onboarding/StepFeeSetup";

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setStoreId, setStoreName, setBusinessType, completeOnboarding } = useStoreSettings();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [storeName, setStoreNameLocal] = useState("");
  const [businessType, setBusinessTypeLocal] = useState("");

  // Step 2
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [cardTierIndex, setCardTierIndex] = useState(0);

  const totalSteps = 2;

  function goNext() { setDirection(1); setStep((s) => s + 1); }
  function goBack() { setDirection(-1); setStep((s) => s - 1); }

  function toggleChannel(key: string) {
    setSelectedChannels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleComplete() {
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileErr } = await supabase.from("sb_user_profiles").upsert(
      { id: user.id, display_name: storeName, onboarding_complete: true },
      { onConflict: "id" }
    );
    if (profileErr) { console.error("프로필 생성 실패:", profileErr); setLoading(false); return; }

    const { data: store, error: storeErr } = await supabase
      .from("sb_stores")
      .insert({ user_id: user.id, store_name: storeName, business_type: businessType })
      .select("id")
      .single();

    if (storeErr || !store) {
      console.error("매장 생성 실패:", storeErr);
      setLoading(false);
      return;
    }

    const cardTier = CARD_FEE_TIERS[cardTierIndex];
    const { error: feeErr } = await supabase.from("sb_store_fee_settings").insert({
      store_id: store.id, credit_card_rate: cardTier.rate,
    });
    if (feeErr) console.error("수수료 설정 생성 실패:", feeErr);

    if (selectedChannels.length > 0) {
      const channels = selectedChannels.map((key) => {
        const preset = FEE_PRESETS[key];
        return {
          store_id: store.id, channel_name: preset.name,
          fee_type: preset.type as "percentage" | "fixed",
          rate: preset.rate ?? null, fixed_amount: preset.amount ?? null,
          category: preset.category, is_active: true,
        };
      });
      const { error: channelErr } = await supabase.from("sb_fee_channels").insert(channels);
      if (channelErr) console.error("채널 생성 실패:", channelErr);
    }

    setStoreId(store.id);
    setStoreName(storeName);
    setBusinessType(businessType);
    completeOnboarding();
    router.push("/closing");
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* 프로그레스 바 */}
      <div className="w-full px-5 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-2">
          {step > 1 && (
            <button onClick={goBack} className="p-1.5 -ml-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="text-caption text-[var(--text-tertiary)] ml-auto">{step} / {totalSteps}</span>
        </div>
        <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary-500 rounded-full" initial={false} animate={{ width: `${(step / totalSteps) * 100}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      {/* 스텝 콘텐츠 */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <StepStoreInfo
              direction={direction}
              storeName={storeName}
              businessType={businessType}
              onStoreNameChange={setStoreNameLocal}
              onBusinessTypeChange={setBusinessTypeLocal}
              onNext={goNext}
              slideVariants={slideVariants}
            />
          )}
          {step === 2 && (
            <StepFeeSetup
              direction={direction}
              selectedChannels={selectedChannels}
              cardTierIndex={cardTierIndex}
              loading={loading}
              onToggleChannel={toggleChannel}
              onCardTierChange={setCardTierIndex}
              onComplete={handleComplete}
              slideVariants={slideVariants}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
