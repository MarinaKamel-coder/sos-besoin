"use client";

import { useEffect } from "react";
import { syncUserRoleFromClerk } from "@/src/action/userActions";

export default function SyncUserRole() {
  useEffect(() => {
    // Synchroniser le rôle au chargement de la page
    syncUserRoleFromClerk().catch(console.error);
  }, []);

  return null;
}
