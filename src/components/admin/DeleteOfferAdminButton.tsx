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
      "Voulez-vous vraiment supprimer cette offre ?\n\nCette action est irréversible.",
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
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-purple-300 transition-all duration-150 hover:bg-purple-500/10 hover:border-purple-500/30 disabled:cursor-wait disabled:opacity-50"
    >
      {isPending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
