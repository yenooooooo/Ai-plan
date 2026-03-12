import { create } from "zustand";

export type StoreRole = "owner" | "editor" | "viewer";

interface TeamRoleState {
  /** 현재 활성 매장에서의 역할 */
  role: StoreRole;
  setRole: (role: StoreRole) => void;
}

export const useTeamRoleStore = create<TeamRoleState>()((set) => ({
  role: "owner",
  setRole: (role) => set({ role }),
}));
