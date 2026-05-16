/**
 * Squelette de chargement pour la page /service-requests
 * Aligné sur la géométrie et le design système Premium
 */
export default function Loading() {
  return (
    <main className="w-full max-w-5xl mx-auto p-6 bg-slate-950 min-h-screen space-y-6 animate-pulse">
      
      {/* En-tête (Titre + Compteur) */}
      <div className="space-y-3">
        <div className="h-8 w-80 bg-slate-900 rounded-2xl" />
        <div className="h-3.5 w-44 bg-slate-900/60 rounded-lg" />
      </div>

      {/* Zone de la Barre de recherche factice (Pleine largeur) */}
      <div className="bg-slate-900/20 border border-slate-900 p-2 rounded-xl h-14 w-full flex items-center">
        <div className="h-8 w-full bg-slate-900/40 rounded-lg" />
      </div>

      {/* Liste de cartes-fantômes (Feed) */}
      <ul className="space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="rounded-2xl border border-slate-900 bg-slate-900/40 p-5"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              
              <div className="space-y-3 flex-1 w-full">
                {/* Titre de la demande */}
                <div className="h-5 w-2/3 bg-slate-900 rounded-lg" />
                
                {/* Lignes de description */}
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-slate-900/50 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-900/50 rounded" />
                </div>
                
                {/* Métadonnées en ligne */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-3.5 w-28 bg-slate-900/60 rounded" />
                  <div className="h-4 w-16 bg-slate-900 rounded" />
                  <div className="h-3.5 w-20 bg-slate-900/60 rounded" />
                </div>
              </div>

              {/* Badge de statut à droite */}
              <div className="shrink-0 w-full sm:w-auto flex sm:justify-end pt-0.5">
                <div className="h-6 w-16 bg-slate-900 rounded-lg" />
              </div>

            </div>
          </li>
        ))}
      </ul>

      {/* Barre de pagination fantôme */}
      <div className="pt-6 border-t border-slate-900/60 flex items-center justify-center gap-2">
        <div className="h-8 w-20 bg-slate-900 rounded-xl" />
        <div className="h-8 w-8 bg-slate-900 rounded-xl" />
        <div className="h-8 w-8 bg-slate-900 rounded-xl" />
        <div className="h-8 w-20 bg-slate-900 rounded-xl" />
      </div>
      
    </main>
  );
}