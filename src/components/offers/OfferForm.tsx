"use client";

import { useActionState, useState } from "react";
import { createOfferAction } from "@/src/action/offerActions";

type OfferFormProps = {
  requestId: string;
};

export default function OfferForm({ requestId }: OfferFormProps) {
  const [state, formAction, isPending] = useActionState(createOfferAction, {
    success: false,
    message: "",
  });

  // State local pour afficher une conversion en temps réel si besoin ou formater la saisie
  const [displayPrice, setDisplayPrice] = useState("");

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm shadow-sm"
    >
      <div className="border-b border-slate-900 pb-3">
        <h3 className="text-base font-black text-white tracking-tight">
          Proposer une offre
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Soumettez votre meilleure proposition tarifaire pour ce service.
        </p>
      </div>

      {/* Payload masqué transmis à la Server Action */}
      <input type="hidden" name="requestId" value={requestId} />

      {/* Champ Prix : conversion transparente dollars -> cents */}
      <div className="space-y-1.5">
        <label htmlFor="displayPrice" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Votre tarif
        </label>
        <div className="relative rounded-lg shadow-sm">
          <input
            id="displayPrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={displayPrice}
            onChange={(e) => setDisplayPrice(e.target.value)}
            placeholder="0.00"
            className="w-full pl-4 pr-16 py-2.5 bg-slate-950 text-sm text-slate-200 placeholder-slate-600 rounded-lg border border-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-xs font-bold text-slate-500 tracking-wider">$ CAD</span>
          </div>
        </div>

        {/* On injecte la valeur convertie en cents pour ne rien casser côté backend (Zod / Prisma) */}
        <input 
          type="hidden" 
          name="price" 
          value={displayPrice ? Math.round(parseFloat(displayPrice) * 100) : ""} 
        />

        {state.errors?.price && (
          <p className="text-xs font-medium text-rose-400/90 pt-0.5">{state.errors.price[0]}</p>
        )}
      </div>

      {/* Champ Message de motivation */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Détails de la proposition
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Décrivez votre expertise, votre matériel et vos disponibilités pour réaliser ce mandat..."
          className="w-full px-4 py-2.5 bg-slate-950 text-sm text-slate-200 placeholder-slate-600 rounded-lg border border-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all resize-none leading-relaxed"
        />
        {state.errors?.message && (
          <p className="text-xs font-medium text-rose-400/90 pt-0.5">{state.errors.message[0]}</p>
        )}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait disabled:pointer-events-none"
      >
        {isPending ? (
          <>
            <svg className="animate-spin text-white w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Transmission de l&apos;offre...</span>
          </>
        ) : (
          <span>Envoyer ma proposition</span>
        )}
      </button>

      {/* Alerte globale de retour d'action */}
      {state.message && (
        <div 
          className={`rounded-lg border p-3.5 text-xs font-medium text-center ${
            state.success 
              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
              : "bg-rose-500/5 border-rose-500/10 text-rose-400"
          }`}
        >
          {state.success ? "✓ " : "⚠️ "} {state.message}
        </div>
      )}
    </form>
  );
}