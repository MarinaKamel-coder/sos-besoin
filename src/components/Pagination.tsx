import Link from "next/link";

// Les "props" = les informations que le composant reçoit de l'extérieur
type PaginationProps = {
  currentPage: number;   // Page affichée actuellement (ex: 2)
  totalPages: number;    // Nombre total de pages (ex: 5)
  basePath: string;      // URL de base (ex: "/service-requests")
  // extraParams permet de conserver les autres filtres dans l'URL (ex: q=urgent&status=OPEN)
  extraParams?: Record<string, string | undefined>;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}: PaginationProps) {
  // Si une seule page (ou moins), inutile d'afficher la pagination
  if (totalPages <= 1) return null;

  // Fonction qui construit l'URL pour une page donnée
  // Elle ajoute aussi les filtres actuels (q, status, etc.) pour ne pas les perdre en changeant de page
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

  // Génération de la liste [1, 2, 3, ..., totalPages]
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-6"
    >
      {/* Bouton "Précédent" : actif si on n'est pas sur la 1re page */}
      {hasPrevious ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          ← Précédent
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
          ← Précédent
        </span>
      )}

      {/* Numéros de page : la page active est mise en surbrillance */}
      {pageNumbers.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={buildPageUrl(page)}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "px-3 py-1 border rounded bg-blue-600 text-white"
                : "px-3 py-1 border rounded hover:bg-gray-100"
            }
          >
            {page}
          </Link>
        );
      })}

      {/* Bouton "Suivant" : actif si on n'est pas sur la dernière page */}
      {hasNext ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Suivant →
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
          Suivant →
        </span>
      )}
    </nav>
  );
}
