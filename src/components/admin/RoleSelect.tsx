"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/src/action/adminActions";
import { Role } from "@/src/generated/prisma/client";

type RoleSelectProps = {
  userId: string;
  currentRole: Role;
};

export default function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const router = useRouter();

  // Garde l'état local parfaitement synchrone si la mutation vient d'ailleurs
  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (newRole: Role) => {
    if (newRole === selectedRole) return;
    
    const confirmed = window.confirm(
      `Voulez-vous vraiment attribuer le rôle ${newRole} à cet utilisateur ?\n\nCette modification sera enregistrée dans le registre d'audit.`,
    );
    if (!confirmed) {
      // Réinitialise la valeur du select si l'admin annule
      setSelectedRole(currentRole);
      return;
    }

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (!result.success) {
        alert(result.message ?? "Une erreur est survenue lors de la mise à jour.");
        setSelectedRole(currentRole);
        return;
      }

      setSelectedRole(newRole);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block w-full sm:w-36">
      <select
        disabled={isPending}
        value={selectedRole}
        aria-label="Rôle utilisateur"
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="w-full appearance-none bg-black border border-white/5 text-slate-300 rounded-xl pl-3 pr-8 py-2 text-[11px] font-black uppercase tracking-wider outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-wait [color-scheme:dark]"
      >
        <option value="CLIENT" className="bg-slate-950 text-slate-300 font-sans py-2">CLIENT</option>
        <option value="PROVIDER" className="bg-slate-950 text-purple-400 font-sans py-2">PROVIDER</option>
        <option value="ADMIN" className="bg-slate-950 text-rose-400 font-sans py-2">ADMIN</option>
      </select>
      
      {/* Indicateur visuel d'état (Flèche ou Spinner) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
        {isPending ? (
          <svg className="animate-spin text-purple-400 w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-slate-500/80">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </div>
    </div>
  );
}