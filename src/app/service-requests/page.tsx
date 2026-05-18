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
    filter?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const { userId } = await auth();
  
  let excludeClientId: string | undefined;
  let forClientId: string | undefined;
  let currentDbUserId: string | undefined;

  const filter = params.filter;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (dbUser) {
      currentDbUserId = dbUser.id;
      
      // Si l'utilisateur est un PROVIDER mais qu'il veut voir ses propres requêtes créées
      if (dbUser.role === "PROVIDER") {
        if (filter === "my-requests") {
          forClientId = dbUser.id; // On bascule pour charger uniquement ses demandes
          excludeClientId = undefined; // On annule l'exclusion globale temporairement pour lui permettre de se voir lui-même
        } else {
          excludeClientId = dbUser.id; // Comportement standard : il voit les autres
        }
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
  const category = params.category;

  // Récupération des données avec le filtre ajusté
  const [{ items, meta }, categories] = await Promise.all([
    getPaginatedServiceRequests({
      page,
      q,
      status,
      sort,
      order,
      excludeClientId,
      forClientId,
      filter,
      category,
      currentDbUserId,
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  /* Badges de statuts aux tons Néon Vifs inspirés du design Vortasky AI */
  const statusConfig: Record<string, string> = {
    OPEN: "bg-[#7000ff]/10 border-[#7000ff]/40 text-[#a366ff] shadow-[0_0_15px_rgba(112,0,255,0.25)]",
    FILLED: "bg-[#ff00e5]/10 border-[#ff00e5]/40 text-[#ff66f0] shadow-[0_0_15px_rgba(255,0,229,0.2)]",
    CANCELLED: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    HIDDEN: "bg-white/[0.02] border-white/[0.08] text-slate-500",
  };

  // Titre dynamique pour le Provider s'il bascule d'onglet
  const dynamicTitle = filter === "my-requests" 
    ? "Mes demandes personnelles créées" 
    : (forClientId ? "Mes demandes publiées" : "Demandes de services disponibles");

  return (
    <main className="w-full max-w-5xl mx-auto p-6 text-slate-200 bg-transparent min-h-screen space-y-6 relative">
      
      {/* Halo de lumière violet subtil en haut de page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#7000ff]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            {dynamicTitle}
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 bg-white/[0.03] border border-white/[0.06] inline-block px-2.5 py-1 rounded-md">
            {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} · Page {meta.currentPage} sur {meta.totalPages}
          </p>
        </div>

        {/* Boutons de filtres à droite (Garde l'état initial pour le rôle Pro) */}
        {(excludeClientId || filter === "my-requests") && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center self-stretch md:self-auto">
            <CategoryFilterSelect categories={categories} currentCategory={category ?? ""} />
            <FilterRequestsTabs currentFilter={filter ?? "all"} />
          </div>
        )}
      </div>

      {/* Bannières d'informations style Cyber-Box Translucide */}
      {forClientId && filter !== "my-requests" && (
        <div className="rounded-2xl border border-[#7000ff]/20 bg-[#7000ff]/5 p-4 text-xs font-semibold text-[#a366ff] leading-relaxed backdrop-blur-md relative z-10">
          💡 Cette liste affiche exclusivement les annonces et appels d&apos;offres liés à votre espace client personnel.
        </div>
      )}

      {filter === "my-requests" && (
        <div className="rounded-2xl border border-[#ff00e5]/20 bg-[#ff00e5]/5 p-4 text-xs font-semibold text-[#ff66f0] leading-relaxed backdrop-blur-md relative z-10">
          ⚙️ Espace Perso : Vous visualisez les demandes d&apos;aide que vous avez vous-même soumises en tant que demandeur.
        </div>
      )}

      {excludeClientId && (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 text-xs font-medium text-slate-400 leading-relaxed backdrop-blur-md relative z-10">
          💼 Mode Prestataire : Pour garantir l&apos;équité du réseau, vous accédez uniquement aux requêtes soumises par les autres membres de la plateforme.
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-[#0c0a15]/40 border border-white/[0.04] p-2 rounded-xl backdrop-blur-xl shadow-2xl relative z-10">
        <SearchBar placeholder="Rechercher un mot-clé, une ville, un besoin..." />
      </div>

      {/* Liste des demandes */}
      {items.length === 0 ? (
        <div className="bg-[#0c0a15]/30 border border-white/[0.04] rounded-3xl p-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-xl relative z-10">
          Aucun appel d&apos;offre ne correspond à vos critères de recherche actuels.
        </div>
      ) : (
        <ul className="space-y-4 relative z-10">
          {items.map((item) => {
            const currentStatusClass = statusConfig[item.status] || statusConfig.OPEN;
            
            return (
              <li
                key={item.id}
                className="group rounded-2xl p-5 border border-white/[0.04] bg-[#0c0a15]/30 hover:border-white/[0.12] hover:bg-[#120f22]/50 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1 w-full">
                    
                    {/* Catégorie Néon Électrique */}
                    {item.categories && item.categories.length > 0 && (
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#7000ff] filter drop-shadow-[0_0_5px_rgba(112,0,255,0.4)]">
                        {item.categories[0].category.name}
                      </div>
                    )}

                    {/* Titre cliquable interactif */}
                    <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-[#ff00e5] transition-colors duration-200">
                      <Link href={`/service-requests/${item.id}`} className="block w-full cursor-pointer">
                        {item.title}
                      </Link>
                    </h2>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pr-4 font-medium">
                      {item.description}
                    </p>
                    
                    {/* Métadonnées argentées épurées */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500 pt-1 font-medium">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <span className="text-slate-500 text-xs">👤</span> {item.client.name ?? item.client.email}
                      </span>
                      <span className="text-white/[0.05]">•</span>
                      <span className="bg-white/[0.03] px-2 py-0.5 border border-white/[0.06] rounded text-[10px] font-black uppercase tracking-wider text-slate-400">
                        📩 {item._count.offers} offre{item._count.offers > 1 ? "s" : ""}
                      </span>
                      {item.location && (
                        <>
                          <span className="text-white/[0.05]">•</span>
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <span className="text-slate-500 text-xs">📍</span> {item.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Statut Lumineux à droite */}
                  <div className="shrink-0 pt-0.5 w-full sm:w-auto flex justify-end">
                    <span className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${currentStatusClass}`}>
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
      <div className="pt-6 border-t border-white/[0.04] relative z-10">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/service-requests"
          extraParams={{ q, status, sort, order, filter, category }}
        />
      </div>
    </main>
  );
}