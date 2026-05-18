import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { getPaginatedProviderOffers, ProviderOfferView } from "@/src/lib/requetes/offersList";
import Pagination from "@/src/components/Pagination";
import { OfferStatus } from "@/src/generated/prisma/client";

function parseOfferStatus(value?: string): OfferStatus | undefined {
  if (!value) return undefined;
  const allowed: OfferStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"];
  return allowed.includes(value as OfferStatus) ? (value as OfferStatus) : undefined;
}

function parseOfferView(value?: string): ProviderOfferView {
  const allowed: ProviderOfferView[] = ["sent", "received", "all"];
  return allowed.includes(value as ProviderOfferView) ? (value as ProviderOfferView) : "sent";
}

const STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  WITHDRAWN: "Retirée",
};

const OFFER_STATUS_TABS = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;
const OFFER_VIEW_TABS = [
  { view: "sent", label: "Envoyées" },
  { view: "received", label: "Reçues" },
  { view: "all", label: "Toutes" },
] as const;

type OfferViewTab = (typeof OFFER_VIEW_TABS)[number]["view"];

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
  const offerStatus = parseOfferStatus(params.offerStatus);
  const offerView = parseOfferView(params.view);

  const { items, meta } = await getPaginatedProviderOffers({
    providerUserId: dbUser.id,
    page,
    offerStatus,
    view: offerView,
  });

  const viewLinks: { href: string; label: string; view: OfferViewTab }[] = OFFER_VIEW_TABS.map((item) => ({
    href: `/offres-envoyees?view=${item.view}${offerStatus ? `&offerStatus=${offerStatus}` : ""}`,
    label: item.label,
    view: item.view,
  }));

  const filterLinks: { href: string; label: string }[] = [
    { href: `/offres-envoyees?view=${offerView}`, label: "Toutes" },
    ...OFFER_STATUS_TABS.map((s) => ({
      href: `/offres-envoyees?view=${offerView}&offerStatus=${s}`,
      label: STATUS_LABELS[s],
    })),
  ];

  /* Configuration des variations de couleurs néon pour les badges d'état de l'offre */
  const stateBadgeConfig: Record<OfferStatus, string> = {
    PENDING: "border-amber-500/20 bg-amber-500/5 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
    ACCEPTED: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
    REJECTED: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    WITHDRAWN: "border-white/5 bg-white/[0.02] text-slate-400",
  };

  return (
    <main className="mx-auto max-w-4xl w-full p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      
      {/* En-tête */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
          Mes offres
        </h1>
      </div>

      {/* Barre de mode d'affichage */}
      <nav
        aria-label="Afficher les offres"
        className="flex flex-wrap gap-2 border-b border-white/5 pb-4"
      >
        {viewLinks.map(({ href, label, view }) => {
          const active = offerView === view;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 border ${
                active
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white hover:border-white/10"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Barre de Filtres / Onglets statut */}
      <nav
        aria-label="Filtrer par statut"
        className="flex flex-wrap gap-2 border-b border-white/5 pb-4"
      >
        {filterLinks.map(({ href, label }) => {
          const active =
            href === `/offres-envoyees?view=${offerView}`
              ? !offerStatus
              : offerStatus !== undefined && href.endsWith(offerStatus);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 border ${
                active
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white hover:border-white/10"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Compteur de résultats */}
      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} — page {meta.currentPage} sur {meta.totalPages}
      </div>

      {/* Liste des Offres */}
      {items.length === 0 ? (
        <div className="cyber-card rounded-2xl p-12 text-center text-sm text-slate-500 font-medium">
          Aucune offre correspondante trouvée dans votre historique.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((offer) => {
            const isReceivedOffer = offer.request.clientId === dbUser.id;
            return (
              <li
                key={offer.id}
                className="cyber-card rounded-2xl p-5 transition-all group hover:border-white/10"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/5 rounded-full px-2 py-1">
                        {isReceivedOffer ? "Offre reçue" : "Offre envoyée"}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
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

      {/* Section Pagination Bas de page */}
      <div className="pt-4">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/offres-envoyees"
          extraParams={{
            ...(offerStatus ? { offerStatus } : {}),
          }}
        />
      </div>
    </main>
  );
}