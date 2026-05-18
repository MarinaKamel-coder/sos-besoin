/**
 * Squelette de chargement pour la page /cart
 * Aligné rigoureusement sur le design système et la géométrie Premium du panier
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 bg-transparent min-h-screen animate-pulse space-y-6">
      
      {/* Titre de la page */}
      <div className="border-b border-white/5 pb-4">
        <div className="h-8 w-48 bg-white/10 rounded-xl" />
      </div>

      {/* Grille Principale Miroir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Liste des items du panier (colonne gauche, 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-3 flex-1 w-full">
                {/* Titre de la demande */}
                <div className="h-5 w-2/3 bg-white/10 rounded-lg" />
                
                {/* Nom du prestataire */}
                <div className="h-3 w-1/4 bg-white/5 rounded" />
                
                {/* Message de l'offre */}
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 w-5/6 bg-white/[0.03] rounded" />
                  <div className="h-3.5 w-4/6 bg-white/[0.03] rounded" />
                </div>
              </div>

              {/* Prix et bouton retirer factices à droite */}
              <div className="flex flex-row items-center justify-between border-t border-white/5 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-4 shrink-0 w-full sm:w-auto">
                {/* Prix */}
                <div className="h-6 w-16 bg-white/10 rounded-lg" />
                {/* Lien retirer */}
                <div className="h-4 w-12 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Résumé des coûts (colonne droite, 1/3) */}
        <aside className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-5 h-fit backdrop-blur-sm">
          {/* Label de section */}
          <div className="border-b border-white/5 pb-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>

          {/* Lignes du récapitulatif */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-3 w-12 bg-white/5 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="h-3 w-12 bg-white/5 rounded" />
            </div>
            
            {/* Ligne Total */}
            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
              <div className="h-4 w-16 bg-white/10 rounded-md" />
              <div className="h-6 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>

          {/* Actions de validation factices */}
          <div className="space-y-2.5 pt-2">
            {/* Bouton Checkout Principal */}
            <div className="h-10 w-full bg-white/10 rounded-xl" />
            {/* Bouton secondaire vider le panier */}
            <div className="h-9 w-full bg-white/[0.02] border border-white/5 rounded-xl" />
          </div>
        </aside>

      </div>
    </main>
  );
}