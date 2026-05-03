"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRequestAction } from "@/src/action/requestActions";

type Props = {
  requestId: string;
};

export default function DeleteRequestButton({ requestId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette demande ?\n\nCette action est irreversible.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteRequestAction(requestId);
      if (result.success) {
        router.push("/service-requests");
      } else {
        alert(result.message ?? "Erreur lors de la suppression.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-wait disabled:bg-red-400"
    >
      {isPending ? "Suppression..." : "🗑 Supprimer"}
    </button>
  );
}