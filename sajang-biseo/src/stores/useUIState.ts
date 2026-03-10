import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  /** 발주 패널 활성 탭 */
  orderTab: string;
  /** 발주 - 분석 탭 아코디언 */
  orderAnalyticsOpen: Record<string, boolean>;
  /** 발주 - 사용량 탭 그룹 아코디언 */
  orderUsageGroups: Record<string, boolean>;
  /** 발주 - 사용량 탭 폐기 섹션 */
  orderWasteOpen: boolean;
  /** 발주 - 추천 탭 아코디언 */
  orderRecommendOpen: Record<string, boolean>;
  /** 발주 - 품목관리 그룹 아코디언 */
  orderItemGroups: Record<string, boolean>;

  /** 마감 패널 활성 탭 */
  closingTab: string;
  /** 마감 - 아코디언 섹션 */
  closingSections: Record<string, boolean>;

  setOrderTab: (tab: string) => void;
  setOrderAnalyticsOpen: (key: string, open: boolean) => void;
  setOrderUsageGroup: (key: string, open: boolean) => void;
  setOrderWasteOpen: (open: boolean) => void;
  setOrderRecommendOpen: (key: string, open: boolean) => void;
  setOrderItemGroup: (key: string, open: boolean) => void;

  setClosingTab: (tab: string) => void;
  setClosingSection: (key: string, open: boolean) => void;
}

export const useUIState = create<UIState>()(
  persist(
    (set) => ({
      orderTab: "settings",
      orderAnalyticsOpen: { chart: true, cost: false, waste: false, shelf: false, price: false },
      orderUsageGroups: {},
      orderWasteOpen: false,
      orderRecommendOpen: { need: true, sufficient: false, flow: false, history: false },
      orderItemGroups: {},

      closingTab: "input",
      closingSections: { channel: true, payment: false, fee: false, expense: false, tag: false },

      setOrderTab: (tab) => set({ orderTab: tab }),
      setOrderAnalyticsOpen: (key, open) =>
        set((s) => ({ orderAnalyticsOpen: { ...s.orderAnalyticsOpen, [key]: open } })),
      setOrderUsageGroup: (key, open) =>
        set((s) => ({ orderUsageGroups: { ...s.orderUsageGroups, [key]: open } })),
      setOrderWasteOpen: (open) => set({ orderWasteOpen: open }),
      setOrderRecommendOpen: (key, open) =>
        set((s) => ({ orderRecommendOpen: { ...s.orderRecommendOpen, [key]: open } })),
      setOrderItemGroup: (key, open) =>
        set((s) => ({ orderItemGroups: { ...s.orderItemGroups, [key]: open } })),

      setClosingTab: (tab) => set({ closingTab: tab }),
      setClosingSection: (key, open) =>
        set((s) => ({ closingSections: { ...s.closingSections, [key]: open } })),
    }),
    { name: "sajang-ui-state" }
  )
);
