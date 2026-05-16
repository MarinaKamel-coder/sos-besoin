/**
 * Squelette d'attente fluide pour la page détail d'une demande
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6 bg-slate-950 min-h-screen animate-pulse">
      
      {/* Lien retour factice */}
      <div className="mb-6 h-3.5 w-36 bg-slate-900 rounded-lg" />

      {/* Grille Principale Miroir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLONNE GAUCHE : Contenu principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* En-tête de la demande */}
          <div className="space-y-3">
            <div className="h-9 w-3/4 bg-slate-900 rounded-2xl" />
            <div className="h-4 w-1/4 bg-slate-900/60 rounded-lg" />
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <div className="h-3 w-32 bg-slate-900 rounded" />
            <div className="border border-slate-900 rounded-2xl p-5 space-y-3 bg-slate-900/10">
              <div className="h-4 w-full bg-slate-900/60 rounded-lg" />
              <div className="h-4 w-5/6 bg-slate-900/60 rounded-lg" />
              <div className="h-4 w-4/6 bg-slate-900/60 rounded-lg" />
            </div>
          </div>

          {/* Catégories */}
          <div className="space-y-2.5">
            <div className="h-3 w-28 bg-slate-900 rounded" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-slate-900 rounded-xl" />
              <div className="h-7 w-24 bg-slate-900 rounded-xl" />
            </div>
          </div>

          {/* Section Liste des Offres */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div className="h-5 w-44 bg-slate-900 rounded-xl" />

            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2.5 flex-1">
                      <div className="h-4 w-1/4 bg-slate-900 rounded-lg" />
                      <div className="h-4 w-full bg-slate-900/50 rounded-lg" />
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="h-6 w-16 bg-slate-900 rounded-lg" />
                      <div className="h-4 w-12 bg-slate-900/40 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Sidebar d'informations (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Panneau latéral factice */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <div className="h-3 w-20 bg-slate-900 rounded" />
              <div className="h-5 w-14 bg-slate-900 rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-slate-900 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-24 bg-slate-900/40 rounded" />
                  <div className="h-3 w-32 bg-slate-900 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-slate-900 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-20 bg-slate-900/40 rounded" />
                  <div className="h-3 w-28 bg-slate-900 rounded-md" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900/60">
              <div className="h-8 bg-slate-900 rounded-xl" />
              <div className="h-8 bg-slate-900/60 rounded-xl" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}