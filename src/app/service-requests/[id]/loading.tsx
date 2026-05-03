/**
 * Squelette pour la page detail d'une demande
 */
export default function Loading() {
  return (
    <main className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-4 w-32 bg-slate-700 rounded mb-4" />

      <div className="border-b border-slate-700 pb-4 mb-6">
        <div className="flex justify-between gap-4">
          <div className="h-9 w-2/3 bg-slate-700 rounded" />
          <div className="h-6 w-16 bg-slate-700 rounded" />
        </div>
        <div className="h-4 w-1/2 bg-slate-800 rounded mt-2" />
      </div>

      <div className="space-y-2 mb-6">
        <div className="h-5 w-32 bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-800 rounded" />
        <div className="h-4 w-4/6 bg-slate-800 rounded" />
      </div>

      <div className="space-y-3">
        <div className="h-5 w-40 bg-slate-700 rounded" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-700 rounded p-4 bg-slate-900/50"
          >
            <div className="flex justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/3 bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-800 rounded" />
              </div>
              <div className="h-7 w-20 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}