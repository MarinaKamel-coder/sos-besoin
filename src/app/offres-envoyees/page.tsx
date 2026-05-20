import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { getPaginatedProviderOffers } from "@/src/lib/requetes/offersList";
import Pagination from "@/src/components/Pagination";
import { OfferStatus } from "@/src/generated/prisma/client";

function parseOfferStatus(value?: string): OfferStatus | undefined {
  if (!value) return undefined;
  const allowed: OfferStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"];
  return allowed.includes(value as OfferStatus) ? (value as OfferStatus) : undefined;
}

const STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  WITHDRAWN: "Retirée",
};

const OFFER_STATUS_TABS = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

export default async function SentOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; offerStatus?: string; view?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });
  if (!dbUser) redirect("/sign-in");
  if (dbUser.role !== "PROVIDER" && dbUser.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const currentStatus = parseOfferStatus(params.offerStatus);

  // Récupération des données filtrées par le statut sélectionné
  const { items, meta } = await getPaginatedProviderOffers({
    providerUserId: dbUser.id,
    page,
    offerStatus: currentStatus,
    view: "sent",
  });

  /* Configuration des variations de couleurs néon pour les badges d'état de l'offre */
  const stateBadgeConfig: Record<OfferStatus, string> = {
    PENDING: "border-amber-500/20 bg-amber-500/5 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
    ACCEPTED: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
    REJECTED: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    WITHDRAWN: "border-white/5 bg-white/[0.02] text-slate-400",
  };

  return (
    <main className="mx-auto max-w-4xl w-full p-6 text-slate-100 bg-transparent min-h-screen space-y-6 relative">
      
      {/* En-tête */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
          Mes offres envoyées
        </h1>
        
        {/* Compteur de résultats intégré à l'en-tête */}
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] inline-block px-2.5 py-1 rounded-md self-start sm:self-auto">
          {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} · Page {meta.currentPage} sur {meta.totalPages}
        </div>
      </div>

      {/* Barre d'onglets de filtrage par statut (Cyber Filter Tabs) */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        <Link
          href="/offres-envoyees"
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 ${
            !currentStatus
              ? "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(112,0,255,0.15)]"
              : "border-transparent bg-transparent text-slate-400 hover:text-white"
          }`}
        >
          🔑 Toutes
        </Link>
        {OFFER_STATUS_TABS.map((status) => (
          <Link
            key={status}
            href={`/offres-envoyees?offerStatus=${status}`}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 ${
              currentStatus === status
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(112,0,255,0.15)]"
                : "border-transparent bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* Liste des Offres */}
      {items.length === 0 ? (
        <div className="bg-[#0c0a15]/30 border border-white/[0.04] rounded-3xl p-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-xl">
          Aucune offre correspondante trouvée dans cette catégorie.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((offer) => {
            const isReceivedOffer = offer.request.clientId === dbUser.id;
            return (
              <li
                key={offer.id}
                className="group rounded-2xl p-5 border border-white/[0.04] bg-[#0c0a15]/30 hover:border-white/[0.12] hover:bg-[#120f22]/50 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 rounded-full px-2 py-1">
                        {isReceivedOffer ? "Offre reçue" : "Offre envoyée"}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight group-hover:text-[#ff00e5] transition-colors duration-200">
                      <Link href={`/service-requests/${offer.request.id}`}>
                        {offer.request.title}
                      </Link>
                    </h2>

                    {isReceivedOffer ? (
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Prestataire : <span className="text-slate-300 normal-case font-medium lowercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded ml-1">{offer.provider.name ?? offer.provider.email}</span>
                      </p>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>Demande parente :</span>
                        <span className="text-slate-400 font-medium lowercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                          {offer.request.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badge d'état de la proposition */}
                  <span className={`self-start rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shrink-0 ${stateBadgeConfig[offer.status]}`}>
                    {STATUS_LABELS[offer.status]}
                  </span>
                </div>

                {/* Message descriptif de l'offre */}
                <div className="mt-4 whitespace-pre-wrap text-sm text-slate-300 font-medium leading-relaxed bg-white/[0.01] border border-white/5 rounded-xl p-4 shadow-inner">
                  {offer.message}
                </div>

                {/* Pied de carte avec affichage du prix */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Montant proposé</span>
                  <p className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                    {(offer.price / 100).toFixed(2)} $
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Section Pagination avec transmission de l'état actuel */}
      <div className="pt-6 border-t border-white/[0.04]">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/offres-envoyees"
          extraParams={{ offerStatus: currentStatus }}
        />
      </div>
    </main>
  );
}