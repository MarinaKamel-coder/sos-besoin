import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { getPaginatedReceivedOffers } from "@/src/lib/requetes/offersList";
import Pagination from "@/src/components/Pagination";
import { OfferStatus } from "@/src/generated/prisma/client";
import { addToCart } from "@/src/action/cart";

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

export default async function ReceivedOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; offerStatus?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });
  if (!dbUser) redirect("/sign-in");
  if (dbUser.role === "PROVIDER") redirect("/");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const offerStatus = parseOfferStatus(params.offerStatus);

  const { items, meta } = await getPaginatedReceivedOffers({
    clientUserId: dbUser.id,
    page,
    offerStatus,
  });

  const filterLinks: { href: string; label: string }[] = [
    { href: "/offres-recues", label: "Toutes" },
    ...OFFER_STATUS_TABS.map((s) => ({
      href: `/offres-recues?offerStatus=${s}`,
      label: STATUS_LABELS[s],
    })),
  ];

  /* Configuration des badges néon de l'offre reçue */
  const stateBadgeConfig: Record<OfferStatus, string> = {
    PENDING: "border-amber-500/20 bg-amber-500/5 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
    ACCEPTED: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
    REJECTED: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    WITHDRAWN: "border-white/5 bg-white/[0.02] text-slate-400",
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl w-full p-6 text-slate-100 bg-transparent space-y-6">
      
      {/* En-tête de page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
          Offres reçues pour mes demandes
        </h1>
      </div>

      {/* Navigation / Filtres par onglets */}
      <nav
        aria-label="Filtrer par statut"
        className="flex flex-wrap gap-2 border-b border-white/5 pb-4"
      >
        {filterLinks.map(({ href, label }) => {
          const active =
            href === "/offres-recues"
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

      {/* Compteur d'éléments */}
      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} — page {meta.currentPage} sur {meta.totalPages}
      </div>

      {/* Liste principale des propositions d'offres */}
      {items.length === 0 ? (
        <div className="cyber-card rounded-2xl p-12 text-center text-sm text-slate-500 font-medium">
          Aucune offre dans cette sélection.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((offer) => (
            <li
              key={offer.id}
              className="cyber-card rounded-2xl p-5 transition-all group hover:border-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
                    <Link href={`/service-requests/${offer.request.id}`}>
                      {offer.request.title}
                    </Link>
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prestataire : <span className="text-slate-300 normal-case font-medium lowercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded ml-1">{offer.provider.name ?? offer.provider.email}</span>
                  </p>
                </div>
                
                {/* Badge d'état dynamique */}
                <span className={`self-start rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shrink-0 ${stateBadgeConfig[offer.status]}`}>
                  {STATUS_LABELS[offer.status]}
                </span>
              </div>

              {/* Message de description */}
              <div className="mt-4 whitespace-pre-wrap text-sm text-slate-300 font-medium leading-relaxed bg-white/[0.01] border border-white/5 rounded-xl p-4 shadow-inner">
                {offer.message}
              </div>

              {/* Pied de carte : Actions et Prix */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                <p className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  {(offer.price / 100).toFixed(2)} $
                </p>

                {offer.status === "PENDING" && (
                  <form action={async () => {
                    "use server";
                    await addToCart(offer.id);
                  }}>
                    <button
                      type="submit"
                      className="btn-cyber-primary px-4 py-2 text-xs font-bold uppercase tracking-widest"
                    >
                      Ajouter au panier
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination globale */}
      <div className="pt-4">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/offres-recues"
          extraParams={{
            ...(offerStatus ? { offerStatus } : {}),
          }}
        />
      </div>
    </main>
  );
}