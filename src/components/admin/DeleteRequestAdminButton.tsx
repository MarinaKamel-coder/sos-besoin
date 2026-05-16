"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRequestAsAdminAction } from "@/src/action/adminActions";

type Props = {
  requestId: string;
};

export default function DeleteRequestAdminButton({ requestId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette demande ?\n\nCette action est irréversible.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteRequestAsAdminAction(requestId);
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
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-rose-400 transition-all duration-150 hover:bg-rose-500/10 hover:border-rose-500/30 disabled:cursor-wait disabled:opacity-50"
    >
      {isPending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
