import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreSettings {
  /** 매장 ID */
  storeId: string | null;
  /** 매장명 */
  storeName: string;
  /** 업종 */
  businessType: string;
  /** 온보딩 완료 여부 */
  onboardingComplete: boolean;
  /** 월 매출 목표 */
  monthlyGoal: number;

  setStoreId: (id: string) => void;
  setStoreName: (name: string) => void;
  setBusinessType: (type: string) => void;
  completeOnboarding: () => void;
  setMonthlyGoal: (goal: number) => void;
  reset: () => void;
}

export const useStoreSettings = create<StoreSettings>()(
  persist(
    (set) => ({
      storeId: null,
      storeName: "",
      businessType: "",
      onboardingComplete: false,
      monthlyGoal: 30_000_000,

      setStoreId: (id) => set({ storeId: id }),
      setStoreName: (name) => set({ storeName: name }),
      setBusinessType: (type) => set({ businessType: type }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setMonthlyGoal: (goal) => set({ monthlyGoal: goal }),
      reset: () =>
        set({
          storeId: null,
          storeName: "",
          businessType: "",
          onboardingComplete: false,
          monthlyGoal: 30_000_000,
        }),
    }),
    {
      name: "sajang-store-settings",
    }
  )
);
