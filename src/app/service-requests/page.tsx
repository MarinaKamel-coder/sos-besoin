import Link from "next/link";
import {
  getPaginatedServiceRequests,
  ServiceRequestSortField,
  SortOrder,
} from "@/src/lib/requetes/serviceRequests";
import Pagination from "@/src/components/Pagination";
import { RequestStatus } from "@/src/generated/prisma/client";
import SearchBar from "@/src/components/SearchBar";

// cette fonction sert a verifier que la valeur recue est bien en RequestStatus
function parseStatus(value?: string): RequestStatus | undefined {
  if (!value) return undefined;
  const allowed = ["OPEN", "FILLED", "CANCELLED", "HIDDEN"];
  return allowed.includes(value) ? (value as RequestStatus) : undefined;
}

export default async function Page({
  searchParams,
}: {
  // Fusion conflit rebase :
  // LOCAL (notre branche) avait seulement: page, q, status
  // REMOTE (main/PR pagination) avait ajouté: sort, order
  // → On garde les deux
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const q = params.q;
  const status = parseStatus(params.status);

  // Fusion conflit rebase :
  // LOCAL n'avait pas sort/order
  // REMOTE les avait ajoutés via la PR pagination
  // → On les garde pour supporter le tri
  const sort = params.sort as ServiceRequestSortField | undefined;
  const order = params.order as SortOrder | undefined;

  // LOCAL passait seulement { page, q, status }
  // REMOTE passait en plus { sort, order }
  // → On passe tout
  const { items, meta } = await getPaginatedServiceRequests({
    page,
    q,
    status,
    sort,
    order,
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Demandes urgentes</h1>

      {/* SearchBar ajoutée par le REMOTE (PR pagination) — conservée */}
      <SearchBar placeholder="Rechercher une demande..." />

      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {meta.totalCount} resultat{meta.totalCount > 1 ? "s" : ""} - Page{" "}
        {meta.currentPage} sur {meta.totalPages}
      </p>

      {items.length === 0 ? (
        <div className="border rounded p-8 text-center text-zinc-500 dark:text-zinc-400">
          Aucune demande trouvee.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                    <Link
                      href={`/service-requests/${item.id}`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    {item.description}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Par {item.client.name ?? item.client.email}</span>
                    <span>•</span>
                    <span>{item._count.offers} offre(s)</span>
                    {item.location && (
                      <>
                        <span>•</span>
                        <span>{item.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs border border-zinc-200 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination :
          LOCAL passait seulement { q, status }
          REMOTE passait { q, status, sort, order }
          → On passe tout pour que le tri soit préservé entre pages */}
      <Pagination
        currentPage={meta.currentPage}
        totalPages={meta.totalPages}
        basePath="/service-requests"
        extraParams={{ q, status, sort, order }}
      />
    </main>
  );
}
