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
      "Voulez-vous vraiment supprimer cette demande ?\n\nCette action est irréversible.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteRequestAction(requestId);
      if (result.success) {
        router.push("/service-requests");
      } else {
        alert(result.message ?? "Une erreur est survenue lors de la suppression.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait disabled:pointer-events-none transition-all duration-150"
    >
      {isPending ? (
        <>
          <svg className="animate-spin text-rose-400 w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Suppression...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.77 0L9 9m11.11 8.55a2.42 2.42 0 0 1-2.345 2.341H7.29a2.42 2.42 0 0 1-2.345-2.341V5.75m14.312 0a2.414 2.414 0 0 0-2.128-2.049 4.847 4.847 0 0 0-5.545 0 2.414 2.414 0 0 0-2.128 2.049m12.013 0H3.58" />
          </svg>
          <span>Supprimer</span>
        </>
      )}
    </button>
  );
}