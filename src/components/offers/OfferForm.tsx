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

  // State local pour afficher une conversion en temps réel ou formater la saisie
  const [displayPrice, setDisplayPrice] = useState("");

  return (
    <form
      action={formAction}
      className="cyber-card rounded-2xl p-6 backdrop-blur-sm border-white/5 bg-white/[0.01] space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-base font-black text-white tracking-tight uppercase tracking-wider">
          Proposer une offre
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
          Soumettez votre meilleure proposition tarifaire pour ce mandat.
        </p>
      </div>

      {/* Payload masqué transmis à la Server Action */}
      <input type="hidden" name="requestId" value={requestId} />

      {/* Champ Prix : conversion transparente dollars -> cents */}
      <div className="space-y-2">
        <label htmlFor="displayPrice" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Votre tarif
        </label>
        <div className="relative rounded-xl">
          <input
            id="displayPrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={displayPrice}
            onChange={(e) => setDisplayPrice(e.target.value)}
            placeholder="0.00"
            className="w-full pl-4 pr-20 py-3 bg-white/[0.02] text-sm text-slate-100 placeholder-slate-600 rounded-xl border border-white/5 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all font-medium"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">$ CAD</span>
          </div>
        </div>

        {/* Injection de la valeur convertie en cents pour l'architecture backend (Zod / Prisma) */}
        <input 
          type="hidden" 
          name="price" 
          value={displayPrice ? Math.round(parseFloat(displayPrice) * 100) : ""} 
        />

        {state.errors?.price && (
          <p className="text-xs font-semibold text-rose-400/90 pt-0.5">⚠️ {state.errors.price[0]}</p>
        )}
      </div>

      {/* Champ Message de motivation */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Détails de la proposition
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Décrivez votre expertise, votre matériel et vos disponibilités pour réaliser ce mandat..."
          className="w-full px-4 py-3 bg-white/[0.02] text-sm text-slate-100 placeholder-slate-600 rounded-xl border border-white/5 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all resize-none leading-relaxed font-medium"
        />
        {state.errors?.message && (
          <p className="text-xs font-semibold text-rose-400/90 pt-0.5">⚠️ {state.errors.message[0]}</p>
        )}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-wait disabled:pointer-events-none"
      >
        {isPending ? (
          <>
            <svg className="animate-spin text-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          className={`rounded-xl border p-4 text-xs font-bold text-center tracking-wide uppercase transition-all ${
            state.success 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
              : "bg-rose-500/5 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
          }`}
        >
          {state.success ? "✓ " : "⚠️ "} {state.message}
        </div>
      )}
    </form>
  );
}