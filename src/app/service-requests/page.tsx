import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import {
  getPaginatedServiceRequests,
  ServiceRequestSortField,
  SortOrder,
} from "@/src/lib/requetes/serviceRequests";
import Pagination from "@/src/components/Pagination";
import { RequestStatus } from "@/src/generated/prisma/client";
import SearchBar from "@/src/components/SearchBar";

function parseStatus(value?: string): RequestStatus | undefined {
  if (!value) return undefined;
  const allowed = ["OPEN", "FILLED", "CANCELLED", "HIDDEN"];
  return allowed.includes(value) ? (value as RequestStatus) : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const params = await searchParams;
  const { userId } = await auth();
  
  let excludeClientId: string | undefined;
  let forClientId: string | undefined;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (dbUser?.role === "PROVIDER") {
      excludeClientId = dbUser.id;
    }
    if (dbUser?.role === "CLIENT") {
      forClientId = dbUser.id;
    }
  }

  const page = Number(params.page ?? 1);
  const q = params.q;
  const status = parseStatus(params.status);
  const sort = params.sort as ServiceRequestSortField | undefined;
  const order = params.order as SortOrder | undefined;

  const { items, meta } = await getPaginatedServiceRequests({
    page,
    q,
    status,
    sort,
    order,
    excludeClientId,
    forClientId,
  });

  const statusConfig: Record<string, string> = {
    OPEN: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    FILLED: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    CANCELLED: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    HIDDEN: "bg-slate-800 border-slate-700 text-slate-400",
  };

  return (
    <main className="w-full max-w-5xl mx-auto p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      
      {/* En-tête de la page */}
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
          {forClientId ? "Mes demandes publiées" : "Demandes de services disponibles"}
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
          {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} · Page {meta.currentPage} sur {meta.totalPages}
        </p>
      </div>

      {/* Bannières d'informations rôles */}
      {forClientId && (
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs font-medium text-blue-400/90 leading-relaxed">
          💡 Cette liste affiche exclusivement les annonces et appels d&apos;offres liés à votre espace client personnel.
        </div>
      )}

      {excludeClientId && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-medium text-emerald-400/90 leading-relaxed">
          💼 Mode Prestataire : Pour garantir l&apos;équité du réseau, vous accédez uniquement aux requêtes soumises par les autres membres de la plateforme.
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-slate-900/20 border border-slate-900 p-2 rounded-xl backdrop-blur-sm">
        <SearchBar placeholder="Rechercher un mot-clé, une ville, un besoin..." />
      </div>

      {/* Liste des demandes */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-12 text-center text-sm text-slate-500">
          Aucun appel d&apos;offre ne correspond à vos critères de recherche actuels.
        </div>
      ) : (
        <ul className="space-y-3.5">
          {items.map((item) => {
            const currentStatusClass = statusConfig[item.status] || statusConfig.OPEN;
            
            return (
              <li
                key={item.id}
                className="group rounded-2xl border border-slate-900 bg-slate-900/40 p-5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-slate-800 hover:bg-slate-900/60"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1 w-full">
                    <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                      <Link href={`/service-requests/${item.id}`} className="hover:underline block w-full">
                        {item.title}
                      </Link>
                    </h2>
                    
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 pr-4">
                      {item.description}
                    </p>
                    
                    {/* Métadonnées de l'item */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-400">
                        👤 {item.client.name ?? item.client.email}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-950 px-2 py-0.5 border border-slate-900 rounded font-medium text-slate-400">
                        📩 {item._count.offers} offre{item._count.offers > 1 ? "s" : ""}
                      </span>
                      {item.location && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">📍 {item.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badge de statut à droite */}
                  <div className="shrink-0 pt-0.5 w-full sm:w-auto flex justify-end">
                    <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${currentStatusClass}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Barre de pagination */}
      <div className="pt-4 border-t border-slate-900/60">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/service-requests"
          extraParams={{ q, status, sort, order }}
        />
      </div>
    </main>
  );
}