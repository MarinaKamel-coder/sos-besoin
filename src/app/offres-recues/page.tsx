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

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6 bg-slate-950 text-slate-100">
      
      {/* Header section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Offres reçues pour mes demandes
        </h1>
        <Link
          href="/cart"
          className="inline-flex justify-center items-center rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          🛒 Voir le panier
        </Link>
      </div>

      {/* Tabs de filtrage */}
      <nav
        aria-label="Filtrer par statut"
        className="mb-6 flex flex-wrap gap-2 border-b border-slate-900 pb-3"
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
              className={
                active
                  ? "rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all"
                  : "rounded-full border border-slate-800 bg-slate-900/30 px-4 py-1 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-200 transition-all"
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Résultats info */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} — page {meta.currentPage} sur {meta.totalPages}
      </p>

      {/* Liste des offres */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-12 text-center text-sm text-slate-500 backdrop-blur-sm">
          Aucune offre dans cette sélection.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((offer) => (
            <li
              key={offer.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg shadow-slate-950/20 hover:border-slate-800 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                    <Link href={`/service-requests/${offer.request.id}`}>
                      {offer.request.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Prestataire : <span className="text-slate-300 font-medium">{offer.provider.name ?? offer.provider.email}</span>
                  </p>
                </div>
                
                {/* Badge de Statut customisé */}
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide uppercase border ${
                  offer.status === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  offer.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {STATUS_LABELS[offer.status]}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300 bg-slate-950/40 rounded-xl p-3 border border-slate-900/60">
                {offer.message}
              </p>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-900/60">
                <p className="text-xl font-extrabold text-blue-400 tracking-tight">
                  {(offer.price / 100).toFixed(2)} $
                </p>

                {offer.status === "PENDING" && (
                  /* Utilisation sécurisée d'une Server Action via l'attribut formAction */
                  <form action={async () => {
                    "use server";
                    await addToCart(offer.id);
                  }}>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-950/50 active:scale-[0.98]"
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

      {/* Pagination */}
      <div className="mt-8">
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