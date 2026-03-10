import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CategoryBudgetStore {
  budgets: Record<string, number>; // categoryId -> monthly budget amount
  setBudget: (categoryId: string, amount: number) => void;
  removeBudget: (categoryId: string) => void;
}

export const useCategoryBudget = create<CategoryBudgetStore>()(
  persist(
    (set) => ({
      budgets: {},
      setBudget: (categoryId, amount) =>
        set((state) => ({
          budgets: { ...state.budgets, [categoryId]: amount },
        })),
      removeBudget: (categoryId) =>
        set((state) => {
          const next = { ...state.budgets };
          delete next[categoryId];
          return { budgets: next };
        }),
    }),
    {
      name: "sajang-category-budget",
    }
  )
);
