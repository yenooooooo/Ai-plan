"use client";

import { useTeamRoleStore } from "@/stores/useTeamRole";

export function useTeamRole() {
  const role = useTeamRoleStore((s) => s.role);
  return {
    role,
    isOwner: role === "owner",
    canEdit: role === "owner" || role === "editor",
    isViewer: role === "viewer",
  };
}
