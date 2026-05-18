/**
 * Squelette d'attente fluide pour la page détail d'une demande
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6 bg-transparent min-h-screen animate-pulse space-y-6">
      
      {/* Lien retour factice */}
      <div className="h-3.5 w-36 bg-white/10 rounded-lg" />

      {/* Grille Principale Miroir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLONNE GAUCHE : Contenu principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* En-tête de la demande */}
          <div className="space-y-3">
            <div className="h-9 w-3/4 bg-white/10 rounded-2xl" />
            <div className="h-4 w-1/4 bg-white/5 rounded-lg" />
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <div className="h-3 w-32 bg-white/10 rounded-md" />
            <div className="border border-white/5 rounded-2xl p-5 space-y-3 bg-white/[0.01]">
              <div className="h-3.5 w-full bg-white/5 rounded-lg" />
              <div className="h-3.5 w-5/6 bg-white/5 rounded-lg" />
              <div className="h-3.5 w-4/6 bg-white/5 rounded-lg" />
            </div>
          </div>

          {/* Catégories */}
          <div className="space-y-2.5">
            <div className="h-3 w-28 bg-white/10 rounded-md" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-white/10 rounded-xl" />
              <div className="h-7 w-24 bg-white/10 rounded-xl" />
            </div>
          </div>

          {/* Section Liste des Offres */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="h-5 w-44 bg-white/10 rounded-xl" />

            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.01] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2.5 flex-1">
                      <div className="h-4 w-1/4 bg-white/10 rounded-lg" />
                      <div className="h-3.5 w-full bg-white/5 rounded-lg" />
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="h-6 w-16 bg-white/10 rounded-lg" />
                      <div className="h-4 w-12 bg-white/5 rounded-md" />
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
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="h-3 w-20 bg-white/10 rounded-md" />
              <div className="h-5 w-14 bg-white/10 rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-white/10 rounded-md" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-24 bg-white/5 rounded" />
                  <div className="h-3 w-32 bg-white/10 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-white/10 rounded-md" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 w-20 bg-white/5 rounded" />
                  <div className="h-3 w-28 bg-white/10 rounded-md" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
              <div className="h-9 bg-white/10 rounded-xl" />
              <div className="h-9 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}