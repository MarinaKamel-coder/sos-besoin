/**
 * Squelette de chargement pour la page /service-requests
 * Aligné sur la géométrie et le design système Premium / Cyber-Premium
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 bg-transparent min-h-screen space-y-6 animate-pulse">
      
      {/* En-tête (Titre + Compteur) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
          <div className="h-3 w-36 bg-white/5 rounded" />
        </div>
        {/* Lien de bascule factice à droite */}
        <div className="h-4 w-28 bg-white/5 rounded-md shrink-0 self-start sm:self-center" />
      </div>

      {/* Zone de la Barre de recherche factice (Pleine largeur) */}
      <div className="rounded-xl border border-white/5 bg-white/[0.01] p-2 h-14 w-full flex items-center">
        <div className="h-full w-full bg-white/[0.03] rounded-lg" />
      </div>

      {/* Liste de cartes-fantômes (Feed) */}
      <ul className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="rounded-2xl border border-white/5 bg-white/[0.01] p-5"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              
              <div className="space-y-3 flex-1 w-full">
                {/* Titre de la demande */}
                <div className="h-5 w-2/3 bg-white/10 rounded-lg" />
                
                {/* Lignes de description */}
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                  <div className="h-3.5 w-4/5 bg-white/5 rounded" />
                </div>
                
                {/* Métadonnées en ligne */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-3 w-24 bg-white/5 rounded" />
                  <div className="h-3 w-3 text-slate-700 font-bold">•</div>
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-3 w-3 text-slate-700 font-bold">•</div>
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
              </div>

              {/* Badge de statut à droite */}
              <div className="shrink-0 w-full sm:w-auto flex sm:justify-end pt-0.5">
                <div className="h-6 w-16 bg-white/10 rounded-lg" />
              </div>

            </div>
          </li>
        ))}
      </ul>

      {/* Barre de pagination fantôme */}
      <div className="pt-4 flex items-center justify-center gap-2.5">
        <div className="h-9 w-16 bg-white/[0.02] border border-white/5 rounded-xl" />
        <div className="h-9 w-9 bg-white/10 rounded-xl" />
        <div className="h-9 w-9 bg-white/[0.02] border border-white/5 rounded-xl" />
        <div className="h-9 w-16 bg-white/[0.02] border border-white/5 rounded-xl" />
      </div>
      
    </main>
  );
}