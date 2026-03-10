import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecurringExpenseItem {
  name: string;
  amount: number;
}

interface RecurringExpensesStore {
  expenses: RecurringExpenseItem[];
  setExpenses: (expenses: RecurringExpenseItem[]) => void;
}

export const useRecurringExpenses = create<RecurringExpensesStore>()(
  persist(
    (set) => ({
      expenses: [],
      setExpenses: (expenses) => set({ expenses }),
    }),
    {
      name: "sajang-recurring-expenses",
    }
  )
);
