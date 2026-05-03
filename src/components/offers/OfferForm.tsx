"use client";

import { useActionState } from "react";
import { createOfferAction } from "@/src/action/offerActions";

type OfferFormProps = {
  requestId: string;
};

export default function OfferForm({ requestId }: OfferFormProps) {
  const [state, formAction, isPending] = useActionState(createOfferAction, {
    success: false,
    message: "",
  });

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <h3 className="text-lg font-semibold">Soumettre une offre</h3>

      <input type="hidden" name="requestId" value={requestId} />

      <div className="space-y-1">
        <label htmlFor="price" className="block text-sm font-medium">
          Prix (en cents - ex : 25000 pour 250.00 $)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="1"
          required
          placeholder="25000"
          className="w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {state.errors?.price && (
          <p className="text-xs text-red-500">{state.errors.price[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="block text-sm font-medium">
          Message (10 caracteres minimum)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Decrivez votre experience et votre disponibilite..."
          className="w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {state.errors?.message && (
          <p className="text-xs text-red-500">{state.errors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:bg-zinc-400"
      >
        {isPending ? "Envoi..." : "Envoyer mon offre"}
      </button>

      {state.message && (
        <p
          className={`text-sm ${
            state.success ? "text-green-600 dark:text-green-400" : "text-red-500"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}