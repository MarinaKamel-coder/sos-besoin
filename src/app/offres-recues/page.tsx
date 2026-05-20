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
  const currentStatus = parseOfferStatus(params.offerStatus);

  // Récupération des données filtrées par le statut sélectionné
  const { items, meta } = await getPaginatedReceivedOffers({
    clientUserId: dbUser.id,
    page,
    offerStatus: currentStatus,
  });

  /* Configuration des badges néon de l'offre reçue */
  const stateBadgeConfig: Record<OfferStatus, string> = {
    PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    REJECTED: "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    WITHDRAWN: "border-white/10 bg-white/[0.04] text-slate-400",
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl w-full p-6 text-slate-100 bg-transparent space-y-6 relative">
      
      {/* Halos lumineux d'arrière-plan */}
      <div className="absolute top-0 left-1/3 w-[450px] h-[250px] bg-[#7000ff]/5 rounded-full blur-[110px] pointer-events-none z-0" />

      {/* En-tête de page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 relative z-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            Offres reçues pour mes demandes
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Consultez et acceptez les propositions des prestataires disponibles.
          </p>
        </div>
        
        {/* Compteur de résultats */}
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] backdrop-blur-md inline-block px-3 py-1.5 rounded-xl shadow-inner">
          ⚡ {meta.totalCount} proposition{meta.totalCount > 1 ? "s" : ""} · Page {meta.currentPage}/{meta.totalPages}
        </div>
      </div>

      {/* Barre d'onglets de filtrage par statut corrigée */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3 relative z-10">
        <Link
          href="/offres-recues"
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300 ${
            !currentStatus
              ? "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(112,0,255,0.15)] backdrop-blur-md"
              : "border-transparent bg-white/[0.01] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          🗂️ Toutes les offres
        </Link>
        {OFFER_STATUS_TABS.map((status) => (
          <Link
            key={status}
            href={`/offres-recues?offerStatus=${status}`}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300 ${
              currentStatus === status
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(112,0,255,0.15)] backdrop-blur-md"
                : "border-transparent bg-white/[0.01] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* Liste principale ou état à vide */}
      <div className="relative z-10">
        {items.length === 0 ? (
          <div className="bg-[#0c0a15]/30 border border-white/[0.04] rounded-3xl p-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-xl shadow-inner">
            Aucune offre dans cette sélection.
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((offer) => (
              <li
                key={offer.id}
                className="group rounded-2xl p-6 border border-white/[0.04] bg-[#0c0a15]/30 hover:border-white/[0.12] hover:bg-[#120f22]/50 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <h2 className="text-lg font-black text-white tracking-tight group-hover:text-[#ff00e5] transition-colors duration-200">
                      <Link href={`/service-requests/${offer.request.id}`}>
                        {offer.request.title}
                      </Link>
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Prestataire : <span className="text-slate-300 normal-case font-medium lowercase bg-white/5 border border-white/5 px-2 py-0.5 rounded-md ml-1">{offer.provider.name ?? offer.provider.email}</span>
                    </p>
                  </div>
                  
                  {/* Badge d'état dynamique */}
                  <span className={`self-start rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl transition-all duration-300 ${stateBadgeConfig[offer.status]}`}>
                    {STATUS_LABELS[offer.status]}
                  </span>
                </div>

                {/* Message de description */}
                <div className="mt-4 whitespace-pre-wrap text-xs md:text-sm text-slate-300 font-medium leading-relaxed bg-[#06040a]/40 border border-white/[0.03] rounded-xl p-4 shadow-inner">
                  {offer.message}
                </div>

                {/* Pied de carte : Actions et Prix */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/[0.04]">
                  <p className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight font-mono">
                    {(offer.price / 100).toFixed(2)} $
                  </p>

                  {offer.status === "PENDING" && (
                    <form action={async () => {
                      "use server";
                      await addToCart(offer.id);
                    }}>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white border border-purple-500/30 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(112,0,255,0.1)] active:scale-95"
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
      </div>

      {/* Pagination globale */}
      <div className="pt-6 border-t border-white/[0.04] relative z-10">
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          basePath="/offres-recues"
          extraParams={{ offerStatus: currentStatus }}
        />
      </div>
    </main>
  );
}