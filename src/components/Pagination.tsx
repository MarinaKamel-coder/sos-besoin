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

  const baseButtonClass = "inline-flex items-center justify-center h-8 px-3 rounded-lg border text-xs font-medium transition-all duration-150 select-none";
  const activeButtonClass = "bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold";
  const inactiveButtonClass = "bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200 hover:bg-slate-900/60";
  const disabledButtonClass = "border-slate-900/50 text-slate-600 opacity-30 cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 w-full">
      
      {/* Bouton Précédent */}
      {hasPrevious ? (
        <Link href={buildPageUrl(currentPage - 1)} className={`${baseButtonClass} ${inactiveButtonClass} gap-1`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span>Précédent</span>
        </Link>
      ) : (
        <span className={`${baseButtonClass} ${disabledButtonClass} gap-1`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span>Précédent</span>
        </span>
      )}

      {/* Numéros de page défilants */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={buildPageUrl(page)}
              aria-current={isActive ? "page" : undefined}
              className={`${baseButtonClass} w-8 !px-0 ${isActive ? activeButtonClass : inactiveButtonClass}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      {hasNext ? (
        <Link href={buildPageUrl(currentPage + 1)} className={`${baseButtonClass} ${inactiveButtonClass} gap-1`}>
          <span>Suivant</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className={`${baseButtonClass} ${disabledButtonClass} gap-1`}>
          <span>Suivant</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
      
    </nav>
  );
}