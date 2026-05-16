/**
 * Squelette de chargement pour la page /cart
 * Aligné rigoureusement sur le design système et la géométrie Premium du panier
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 bg-slate-950 min-h-screen animate-pulse space-y-6">
      
      {/* Titre de la page */}
      <div className="h-9 w-40 bg-slate-900 rounded-2xl mb-2" />

      {/* Grille Principale Miroir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Liste des items du panier (colonne gauche, 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-900 bg-slate-900/40 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1 w-full">
                {/* Titre de la demande */}
                <div className="h-5 w-2/3 bg-slate-900 rounded-lg" />
                {/* Nom du prestataire */}
                <div className="h-3.5 w-1/3 bg-slate-900/60 rounded" />
                {/* Message de l'offre */}
                <div className="h-4 w-5/6 bg-slate-900/40 rounded-lg pt-1" />
              </div>

              {/* Prix et bouton retirer factices à droite */}
              <div className="flex flex-row items-center justify-between border-t border-slate-900/50 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-4 shrink-0 w-full sm:w-auto">
                <div className="h-6 w-16 bg-slate-900 rounded-lg" />
                <div className="h-6 w-14 bg-slate-900/40 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Résumé des coûts (colonne droite, 1/3) */}
        <aside className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 space-y-5 h-fit">
          {/* Label de section */}
          <div className="h-3 w-36 bg-slate-900 rounded border-b border-slate-900 pb-4 w-full" />

          {/* Lignes du récapitulatif */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-3.5 w-16 bg-slate-900/50 rounded" />
              <div className="h-3.5 w-12 bg-slate-900/60 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 w-24 bg-slate-900/50 rounded" />
              <div className="h-3.5 w-12 bg-slate-900/60 rounded" />
            </div>
            
            {/* Ligne Total */}
            <div className="border-t border-slate-900 pt-4 flex justify-between">
              <div className="h-4 w-20 bg-slate-900 rounded-lg" />
              <div className="h-5 w-16 bg-slate-900 rounded-lg" />
            </div>
          </div>

          {/* Actions de validation factices */}
          <div className="space-y-2 pt-2">
            {/* Bouton Stripe */}
            <div className="h-11 w-full bg-slate-900 rounded-xl" />
            {/* Bouton vider le panier */}
            <div className="h-9 w-full bg-slate-900/40 rounded-xl" />
          </div>
        </aside>

      </div>
    </main>
  );
}