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
import FilterRequestsTabs from "@/src/components/requests/FilterRequestsTabs";
import CategoryFilterSelect from "@/src/components/requests/CategoryFilterSelect";

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
    filter?: string;    // 👈 Ajouté
    category?: string; // 👈 Ajouté
  }>;
}) {
  const params = await searchParams;
  const { userId } = await auth();
  
  let excludeClientId: string | undefined;
  let forClientId: string | undefined;
  let currentDbUserId: string | undefined;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (dbUser) {
      currentDbUserId = dbUser.id;
      if (dbUser.role === "PROVIDER") {
        excludeClientId = dbUser.id;
      }
      if (dbUser.role === "CLIENT") {
        forClientId = dbUser.id;
      }
    }
  }

  const page = Number(params.page ?? 1);
  const q = params.q;
  const status = parseStatus(params.status);
  const sort = params.sort as ServiceRequestSortField | undefined;
  const order = params.order as SortOrder | undefined;
  const filter = params.filter;
  const category = params.category;

  // 1. Récupération en parallèle des requêtes filtrées et de la liste globale des catégories
  const [{ items, meta }, categories] = await Promise.all([
    getPaginatedServiceRequests({
      page,
      q,
      status,
      sort,
      order,
      excludeClientId,
      forClientId,
      filter,       // 👈 À intercepter dans ta fonction Prisma
      category,     // 👈 À intercepter dans ta fonction Prisma
      currentDbUserId, // Optionnel : utile pour filtrer "my-offers" via le dbUserId
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  /* Configuration des badges aux tons néon lissés */
  const statusConfig: Record<string, string> = {
    OPEN: "bg-white/5 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(109,40,217,0.15)]",
    FILLED: "bg-white/5 border-emerald-500/30 text-emerald-300",
    CANCELLED: "bg-white/5 border-rose-500/30 text-rose-300",
    HIDDEN: "bg-white/5 border-white/10 text-slate-400",
  };

  return (
    <main className="w-full max-w-5xl mx-auto p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
            {forClientId ? "Mes demandes publiées" : "Demandes de services disponibles"}
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
            {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} · Page {meta.currentPage} sur {meta.totalPages}
          </p>
        </div>

        {/* Affichage des filtres uniquement pour le rôle PROVIDER (quand excludeClientId est actif) */}
        {excludeClientId && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center self-stretch md:self-auto">
            <CategoryFilterSelect categories={categories} currentCategory={category ?? ""} />
            <FilterRequestsTabs currentFilter={filter ?? "all"} />
          </div>
        )}
      </div>

      {/* Bannières d'informations rôles style Cyber-Box */}
      {forClientId && (
        <div className="rounded-xl border border-purple-500/20 bg-cyber-purple/5 p-4 text-xs font-medium text-purple-300/90 leading-relaxed backdrop-blur-sm">
          💡 Cette liste affiche exclusivement les annonces et appels d&apos;offres liés à votre espace client personnel.
        </div>
      )}

      {excludeClientId && (
        <div className="rounded-xl border border-purple-500/20 bg-cyber-purple/5 p-4 text-xs font-medium text-purple-300/90 leading-relaxed backdrop-blur-sm">
          💼 Mode Prestataire : Pour garantir l&apos;équité du réseau, vous accédez uniquement aux requêtes soumises par les autres membres de la plateforme.
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl backdrop-blur-md shadow-sm">
        <SearchBar placeholder="Rechercher un mot-clé, une ville, un besoin..." />
      </div>

      {/* Liste des demandes */}
      {items.length === 0 ? (
        <div className="cyber-card rounded-2xl p-12 text-center text-xs font-black uppercase tracking-widest text-slate-500">
          Aucun appel d&apos;offre ne correspond à vos critères de recherche actuels.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const currentStatusClass = statusConfig[item.status] || statusConfig.OPEN;
            
            return (
              <li
                key={item.id}
                className="cyber-card group rounded-2xl p-5 border border-white/[0.03] bg-white/[0.005] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1 w-full">
                    
                    {/* Badge de catégorie dynamique sur l'item */}
                    {item.categories && item.categories.length > 0 && (
                      <div className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                        {item.categories[0].category.name}
                      </div>
                    )}

                    <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">
                      <Link href={`/service-requests/${item.id}`} className="block w-full">
                        {item.title}
                      </Link>
                    </h2>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pr-4 font-medium">
                      {item.description}
                    </p>
                    
                    {/* Métadonnées de l'item */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500 pt-1 font-medium">
                      <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-500 text-xs">👤</span> {item.client.name ?? item.client.email}
                      </span>
                      <span className="text-white/10">•</span>
                      <span className="bg-white/[0.02] px-2 py-0.5 border border-white/5 rounded text-[10px] font-black uppercase tracking-wider text-slate-400">
                        📩 {item._count.offers} offre{item._count.offers > 1 ? "s" : ""}
                      </span>
                      {item.location && (
                        <>
                          <span className="text-white/10">•</span>
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="text-slate-500 text-xs">📍</span> {item.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badge de statut à droite */}
                  <div className="shrink-0 pt-0.5 w-full sm:w-auto flex justify-end">
                    <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${currentStatusClass}`}>
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
      <div className="pt-4 border-t border-white/5">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/service-requests"
          extraParams={{ q, status, sort, order, filter, category }} // 👈 Inclus pour maintenir la page active lors des sauts de page
        />
      </div>
    </main>
  );
}