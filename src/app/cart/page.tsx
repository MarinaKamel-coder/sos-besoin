import {
  getCart,
  removeFromCart,
  clearCart,
} from "../../action/cart";
import { createCheckoutSession } from "../../action/checkout";

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="mx-auto w-full max-w-5xl p-6 text-slate-100 bg-slate-950 min-h-screen">
      <h1 className="mb-8 text-2xl font-black text-white sm:text-3xl tracking-tight">
        Votre Panier
      </h1>

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-12 text-center max-w-xl mx-auto space-y-2">
          <p className="text-base font-bold text-slate-200">Votre panier est actuellement vide.</p>
          <p className="text-xs text-slate-500">
            Parcourez les offres disponibles de nos prestataires et sélectionnez-en une pour initier la réservation.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          
          {/* Liste des éléments du panier (2/3) */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div 
                key={item.id} 
                className="relative rounded-2xl border border-slate-900 bg-slate-900/40 p-5 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {item.offer.request.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Prestataire : <span className="text-slate-200 font-medium">{item.offer.provider.name ?? item.offer.provider.email}</span>
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    {item.offer.message}
                  </p>
                </div>

                {/* Prix et Action de suppression */}
                <div className="flex flex-row items-center justify-between border-t border-slate-900/50 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-3 shrink-0">
                  <p className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {(item.offer.price / 100).toFixed(2)} $
                  </p>

                  <form
                    action={async () => {
                      "use server";
                      await removeFromCart(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.77 0L9 9m11.11 8.55a2.42 2.42 0 0 1-2.345 2.341H7.29a2.42 2.42 0 0 1-2.345-2.341V5.75m14.312 0a2.414 2.414 0 0 0-2.128-2.049 4.847 4.847 0 0 0-5.545 0 2.414 2.414 0 0 0-2.128 2.049m12.013 0H3.58" />
                      </svg>
                      Retirer
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Panneau Sommaire de facturation (1/3) */}
          <div className="h-fit rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-sm space-y-5 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-900 pb-3">
              Récapitulatif de commande
            </h2>
            
            <div className="space-y-3 text-xs tracking-wide">
              <div className="flex justify-between text-slate-400">
                <span>Sous-total</span>
                <span className="font-semibold text-slate-200">{(cart.subtotal / 100).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Frais de plateforme</span>
                <span className="font-semibold text-slate-200">{(cart.platformFee / 100).toFixed(2)} $</span>
              </div>
              
              <div className="flex justify-between border-t border-slate-900 pt-3 text-sm text-white font-bold">
                <span>Montant total</span>
                <span className="text-base font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {(cart.total / 100).toFixed(2)} $
                </span>
              </div>
            </div>

            {/* Actions de validation */}
            <div className="space-y-2 pt-2">
              <form action={createCheckoutSession}>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/5 transition-all active:scale-[0.98]"
                >
                  🔒 Passer au paiement sécurisé
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await clearCart();
                }}
              >
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 border border-slate-900 hover:text-slate-200 hover:border-slate-800 transition-all active:scale-[0.98]"
                >
                  Vider le panier
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}