import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Alignement sur la géométrie et les styles de hauteur (h-9) du design système Premium
  const baseButtonClass = "inline-flex items-center justify-center h-9 px-3.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 select-none active:scale-[0.98]";
  const activeButtonClass = "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] font-black";
  const inactiveButtonClass = "bg-white/[0.01] border-white/5 text-slate-400 hover:border-purple-500/20 hover:text-purple-400 hover:bg-purple-500/[0.02]";
  const disabledButtonClass = "border-white/[0.02] text-slate-700 opacity-20 cursor-not-allowed pointer-events-none";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 w-full pt-4">
      
      {/* Bouton Précédent */}
      {hasPrevious ? (
        <Link href={buildPageUrl(currentPage - 1)} className={`${baseButtonClass} ${inactiveButtonClass} gap-1.5`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className={`${baseButtonClass} ${disabledButtonClass} gap-1.5`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      {/* Numéros de page défilants */}
      <div className="flex items-center gap-1.5">
        {pageNumbers.map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={buildPageUrl(page)}
              aria-current={isActive ? "page" : undefined}
              className={`${baseButtonClass} w-9 !px-0 font-mono text-xs ${isActive ? activeButtonClass : inactiveButtonClass}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      {hasNext ? (
        <Link href={buildPageUrl(currentPage + 1)} className={`${baseButtonClass} ${inactiveButtonClass} gap-1.5`}>
          <span className="hidden sm:inline">Suivant</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className={`${baseButtonClass} ${disabledButtonClass} gap-1.5`}>
          <span className="hidden sm:inline">Suivant</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
      
    </nav>
  );
}