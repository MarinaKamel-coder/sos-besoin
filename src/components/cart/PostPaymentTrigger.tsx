"use client";

import { useEffect, useState } from "react";
import { handlePostPaymentSuccess } from "@/src/action/cart";

type PostPaymentTriggerProps = {
  bookingId: string;
  offerId: string;
};

export default function PostPaymentTrigger({ bookingId, offerId }: PostPaymentTriggerProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function initCleanup() {
      try {
        const result = await handlePostPaymentSuccess(bookingId, offerId);
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    initCleanup();
  }, [bookingId, offerId]);

  if (status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.03)] animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>⚡ Synchronisation du panier...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.02] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.03)]">
        <span>⚠️ Panier non synchronisé (Paiement validé)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.03)]">
      <span>✨ Traitement complété avec succès !</span>
    </div>
  );
}