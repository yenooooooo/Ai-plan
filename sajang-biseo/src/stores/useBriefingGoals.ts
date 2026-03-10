import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BriefingGoalsState {
  /** key: `${weekStart}-${goalIndex}` */
  completed: Record<string, boolean>;
  toggle: (weekStart: string, goalIndex: number) => void;
  getProgress: (weekStart: string, totalGoals: number) => { done: number; total: number };
}

export const useBriefingGoals = create<BriefingGoalsState>()(
  persist(
    (set, get) => ({
      completed: {},
      toggle: (weekStart, goalIndex) =>
        set((s) => {
          const key = `${weekStart}-${goalIndex}`;
          const next = { ...s.completed };
          if (next[key]) {
            delete next[key];
          } else {
            next[key] = true;
          }
          return { completed: next };
        }),
      getProgress: (weekStart, totalGoals) => {
        const state = get();
        let done = 0;
        for (let i = 0; i < totalGoals; i++) {
          if (state.completed[`${weekStart}-${i}`]) done++;
        }
        return { done, total: totalGoals };
      },
    }),
    { name: "sajang-briefing-goals" }
  )
);
