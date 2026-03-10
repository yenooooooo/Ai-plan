import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderTemplate {
  name: string;
  /** itemId → qty */
  items: Record<string, number>;
  createdAt: string;
}

interface OrderTemplatesStore {
  templates: OrderTemplate[];
  addTemplate: (template: OrderTemplate) => void;
  removeTemplate: (name: string) => void;
  renameTemplate: (oldName: string, newName: string) => void;
}

export const useOrderTemplates = create<OrderTemplatesStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) =>
        set((s) => ({
          templates: [
            ...s.templates.filter((t) => t.name !== template.name),
            template,
          ],
        })),
      removeTemplate: (name) =>
        set((s) => ({ templates: s.templates.filter((t) => t.name !== name) })),
      renameTemplate: (oldName, newName) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.name === oldName ? { ...t, name: newName } : t
          ),
        })),
    }),
    { name: "sajang-order-templates" }
  )
);
