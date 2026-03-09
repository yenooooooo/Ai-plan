import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChannelRatio } from "@/components/closing/ChannelSlider";

export interface Preset {
  name: string;
  channels: ChannelRatio[];
  cardRatio: number;
}

export const DEFAULT_PRESETS: Preset[] = [
  {
    name: "평일 기본",
    channels: [
      { channel: "홀", ratio: 55 },
      { channel: "배민", ratio: 25, deliveryCount: 15 },
      { channel: "쿠팡이츠", ratio: 10, deliveryCount: 6 },
      { channel: "포장", ratio: 10 },
    ],
    cardRatio: 90,
  },
  {
    name: "주말",
    channels: [
      { channel: "홀", ratio: 65 },
      { channel: "배민", ratio: 15, deliveryCount: 10 },
      { channel: "쿠팡이츠", ratio: 5, deliveryCount: 3 },
      { channel: "포장", ratio: 15 },
    ],
    cardRatio: 85,
  },
];

interface PresetsStore {
  presets: Preset[];
  addPreset: (preset: Preset) => void;
  updatePreset: (index: number, preset: Preset) => void;
  removePreset: (index: number) => void;
  resetToDefaults: () => void;
}

export const usePresetsStore = create<PresetsStore>()(
  persist(
    (set) => ({
      presets: DEFAULT_PRESETS,
      addPreset: (preset) => set((s) => ({ presets: [...s.presets, preset] })),
      updatePreset: (index, preset) =>
        set((s) => ({ presets: s.presets.map((p, i) => (i === index ? preset : p)) })),
      removePreset: (index) =>
        set((s) => ({ presets: s.presets.filter((_, i) => i !== index) })),
      resetToDefaults: () => set({ presets: DEFAULT_PRESETS }),
    }),
    { name: "sajang-presets" }
  )
);
