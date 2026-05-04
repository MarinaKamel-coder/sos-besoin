/**
 * Squelette de chargement pour la page /cart
 * Affiche pendant que le panier de l'utilisateur est recupere
 */
export default function Loading() {
  return (
    <main className="p-6 max-w-6xl mx-auto animate-pulse">
      {/* Titre */}
      <div className="h-9 w-32 bg-slate-700 rounded mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des items du panier (col gauche, 2/3) */}
        <div className="md:col-span-2 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="border border-slate-700 rounded-xl p-6 bg-slate-900/50"
            >
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-slate-700 rounded" />
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-800 rounded" />
                <div className="flex justify-between items-center pt-3">
                  <div className="h-5 w-24 bg-slate-700 rounded" />
                  <div className="h-9 w-24 bg-red-900/40 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resume des couts (col droite, 1/3) */}
        <aside className="border border-slate-700 rounded-xl p-6 bg-slate-900/50 h-fit space-y-4">
          <div className="h-6 w-24 bg-slate-700 rounded mb-2" />

          <div className="flex justify-between">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-4 w-16 bg-slate-800 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-4 w-14 bg-slate-800 rounded" />
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between">
            <div className="h-5 w-12 bg-slate-700 rounded" />
            <div className="h-5 w-20 bg-slate-700 rounded" />
          </div>

          <div className="h-12 w-full bg-blue-900/40 rounded mt-4" />
          <div className="h-10 w-full bg-slate-700 rounded" />
        </aside>
      </div>
    </main>
  );
}