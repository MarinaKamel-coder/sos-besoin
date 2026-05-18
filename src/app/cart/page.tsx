import {
  getCart,
  removeFromCart,
  clearCart,
} from "../../action/cart";
import { createCheckoutSession } from "../../action/checkout";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="mx-auto w-full max-w-5xl p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      
      {/* En-tête de la page */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
          Votre Panier
        </h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="cyber-card rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3 mt-8">
          <p className="text-base font-bold text-slate-200">Votre panier est actuellement vide.</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Parcourez les offres disponibles de nos prestataires et sélectionnez-en une pour initier la réservation de service.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          
          {/* Liste des éléments du panier (2/3) */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div 
                key={item.id} 
                className="cyber-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group transition-all hover:border-white/10"
              >
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-base font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
                    {item.offer.request.title}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prestataire : <span className="text-slate-300 normal-case font-medium lowercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded ml-1">{item.offer.provider.name ?? item.offer.provider.email}</span>
                  </p>
                  <div className="mt-3 whitespace-pre-wrap text-sm text-slate-300 font-medium leading-relaxed bg-white/[0.01] border border-white/5 rounded-xl p-3 shadow-inner">
                    {item.offer.message}
                  </div>
                </div>

                {/* Prix et Action de suppression */}
                <div className="flex flex-row items-center justify-between border-t border-white/5 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-3 shrink-0">
                  <p className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
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
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors py-1.5 px-2.5 rounded-lg bg-rose-500/0 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
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
          <aside className="cyber-card rounded-2xl p-5 space-y-5 h-fit backdrop-blur-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3">
              Récapitulatif de commande
            </h2>
            
            <div className="space-y-3.5 text-xs font-bold uppercase tracking-wider">
              <div className="flex justify-between text-slate-400">
                <span className="font-medium normal-case">Sous-total</span>
                <span className="text-slate-200 font-mono tracking-normal">{(cart.subtotal / 100).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-medium normal-case">Frais de plateforme</span>
                <span className="text-slate-200 font-mono tracking-normal">{(cart.platformFee / 100).toFixed(2)} $</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-white/5 pt-3 text-sm text-white font-black">
                <span>Montant total</span>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight font-mono">
                  {(cart.total / 100).toFixed(2)} $
                </span>
              </div>
            </div>

            {/* Actions de validation */}
            <div className="space-y-2.5 pt-2">
              <form action={createCheckoutSession}>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 hover:text-slate-950 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                >
                  🔒 Passer au paiement
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
                  className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 border border-white/5 bg-white/[0.01] hover:text-white hover:border-white/10 transition-all active:scale-[0.98]"
                >
                  Vider le panier
                </button>
              </form>
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}