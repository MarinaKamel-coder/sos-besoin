"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/src/action/adminActions";
import { Role } from "@/src/generated/prisma/client";

type RoleSelectProps = {
  userId: string;
  currentRole: Role; // Typer avec l'enum de ton schéma
};

export default function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const router = useRouter();

  const handleRoleChange = (newRole: Role) => {
    const confirmed = window.confirm(`Voulez-vous vraiment attribuer le rôle ${newRole} à cet utilisateur ?`);
    if (!confirmed) return;

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (!result.success) {
        alert(result.message);
        return;
      }

      setSelectedRole(newRole);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <select
        disabled={isPending}
        value={selectedRole}
        aria-label="role"
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="appearance-none bg-slate-950 border border-slate-900 text-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-wait"
      >
        <option value="CLIENT">CLIENT</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      
      {/* Flèche du sélecteur */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500">
        {isPending ? (
          <svg className="animate-spin text-blue-400 w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </div>
    </div>
  );
}