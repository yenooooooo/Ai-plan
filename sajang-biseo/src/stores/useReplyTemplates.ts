import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedTemplate {
  id: string;
  label: string;
  fullText: string;
  savedAt: string;
}

interface ReplyTemplatesState {
  templates: SavedTemplate[];
  addTemplate: (label: string, fullText: string) => void;
  removeTemplate: (id: string) => void;
}

export const useReplyTemplates = create<ReplyTemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (label, fullText) =>
        set((s) => ({
          templates: [
            { id: `tpl_${Date.now()}`, label, fullText, savedAt: new Date().toISOString() },
            ...s.templates,
          ].slice(0, 20),
        })),
      removeTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
    }),
    { name: "sajang-reply-templates" }
  )
);
