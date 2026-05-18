"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOfferAsAdminAction } from "@/src/action/adminActions";

type Props = {
  offerId: string;
};

export default function DeleteOfferAdminButton({ offerId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette offre ?\n\nCette action est irréversible et sera enregistrée dans le registre d'audit.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteOfferAsAdminAction(offerId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message ?? "Une erreur est survenue lors de la suppression.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-400 transition-all duration-200 hover:bg-rose-500/10 hover:border-rose-500/40 active:scale-[0.98] disabled:scale-100 disabled:cursor-wait disabled:border-white/5 disabled:bg-white/[0.02] disabled:text-slate-500"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-3 w-3 text-rose-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Suppression...</span>
        </>
      ) : (
        "Supprimer l'offre"
      )}
    </button>
  );
}