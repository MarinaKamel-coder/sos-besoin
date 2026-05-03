/**
 * Squelette de chargement pour la page /service-requests
 * Affiche pendant que la requete Prisma se termine (Next.js Suspense automatique)
 */
export default function Loading() {
  return (
    <main className="p-6 max-w-5xl mx-auto animate-pulse">
      {/* Titre */}
      <div className="h-8 w-64 bg-slate-700 rounded mb-4" />

      {/* Barre de recherche */}
      <div className="h-10 w-full max-w-md bg-slate-800 rounded-lg mb-4" />

      {/* Compteur de resultats */}
      <div className="h-4 w-48 bg-slate-700 rounded mb-6" />

      {/* Liste de cartes-fantomes */}
      <ul className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="border border-slate-700 rounded-xl p-4 bg-slate-900/50"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-800 rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-3 w-24 bg-slate-700 rounded" />
                  <div className="h-3 w-16 bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-700 rounded" />
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination-fantome */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-8 w-24 bg-slate-700 rounded" />
        <div className="h-8 w-8 bg-slate-700 rounded" />
        <div className="h-8 w-8 bg-slate-700 rounded" />
        <div className="h-8 w-8 bg-slate-700 rounded" />
        <div className="h-8 w-24 bg-slate-700 rounded" />
      </div>
    </main>
  );
}