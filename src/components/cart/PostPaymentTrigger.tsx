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
      <p className="text-xs text-amber-400 bg-amber-500/[0.02] border border-amber-500/10 rounded-lg py-1.5 px-3 inline-block animate-pulse">
        ⚡ Mise à jour de votre panier en cours...
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-xs text-rose-400 bg-rose-500/[0.02] border border-rose-500/10 rounded-lg py-1.5 px-3 inline-block">
        ⚠️ Erreur de synchronisation, mais votre paiement est bien validé.
      </p>
    );
  }

  return (
    <p className="text-xs text-emerald-400 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-lg py-1.5 px-3 inline-block">
      ✨ Panier mis à jour et vidé avec succès !
    </p>
  );
}