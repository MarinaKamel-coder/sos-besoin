import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import { getPaginatedSentOffers } from "@/src/lib/requetes/offersList";
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
  searchParams: Promise<{ page?: string; offerStatus?: string }>;
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

  const { items, meta } = await getPaginatedSentOffers({
    providerUserId: dbUser.id,
    page,
    offerStatus,
  });

  const filterLinks: { href: string; label: string }[] = [
    { href: "/offres-envoyees", label: "Toutes" },
    ...OFFER_STATUS_TABS.map((s) => ({
      href: `/offres-envoyees?offerStatus=${s}`,
      label: STATUS_LABELS[s],
    })),
  ];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Mes offres envoyées
      </h1>

      <nav
        aria-label="Filtrer par statut"
        className="mb-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-700"
      >
        {filterLinks.map(({ href, label }) => {
          const active =
            href === "/offres-envoyees"
              ? !offerStatus
              : offerStatus !== undefined && href.endsWith(offerStatus);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white"
                  : "rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {meta.totalCount} résultat{meta.totalCount > 1 ? "s" : ""} — page {meta.currentPage}{" "}
        sur {meta.totalPages}
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Aucune offre dans cette sélection.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((offer) => (
            <li
              key={offer.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  <Link
                    href={`/service-requests/${offer.request.id}`}
                    className="hover:underline"
                  >
                    {offer.request.title}
                  </Link>
                </h2>
                <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs dark:border-zinc-600 dark:bg-zinc-800">
                  {STATUS_LABELS[offer.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Demande : statut {offer.request.status}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {offer.message}
              </p>
              <p className="mt-2 font-semibold text-green-600 dark:text-green-400">
                {(offer.price / 100).toFixed(2)} $
              </p>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={meta.currentPage}
        totalPages={meta.totalPages}
        basePath="/offres-envoyees"
        extraParams={{
          ...(offerStatus ? { offerStatus } : {}),
        }}
      />
    </main>
  );
}
