import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeeMode = "gross" | "net";

interface FeeToggleState {
  /** 총매출(gross) / 순매출(net) 표시 모드 */
  mode: FeeMode;
  /** 모드 전환 */
  toggle: () => void;
  /** 특정 모드로 설정 */
  setMode: (mode: FeeMode) => void;
  /** 현재 모드가 순매출(수수료 차감)인지 여부 */
  isNetMode: () => boolean;
}

export const useFeeToggle = create<FeeToggleState>()(
  persist(
    (set, get) => ({
      mode: "gross",

      toggle: () =>
        set((state) => ({
          mode: state.mode === "gross" ? "net" : "gross",
        })),

      setMode: (mode) => set({ mode }),

      isNetMode: () => get().mode === "net",
    }),
    {
      name: "sajang-fee-toggle",
    }
  )
);
