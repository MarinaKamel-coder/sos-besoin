import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getServiceRequestById } from "@/src/lib/requetes/serviceRequests";
import { addToCart } from "@/src/action/cart";
import OfferForm from "@/src/components/offers/OfferForm";
import DeleteRequestButton from "@/src/components/requests/DeleteRequestButton";
import prisma from "@/src/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  const request = await getServiceRequestById(id);

  if (!request) notFound();

  let currentUser = null;
  let canCreateOffer = false;

  if (clerkId) {
    currentUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (currentUser && (currentUser.role === "PROVIDER" || currentUser.role === "ADMIN")) {
      canCreateOffer = currentUser.id !== request.clientId;
    }
  }

  const isRequestOwner = currentUser?.id === request.clientId;

  const statusConfig: Record<string, string> = {
    OPEN: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    CLOSED: "bg-slate-800 border-slate-700 text-slate-400",
    PENDING: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  const currentStatusClass = statusConfig[request.status] || statusConfig.OPEN;

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-slate-950 min-h-screen">
      {/* Fil d'ariane / Retour */}
      <Link
        href="/service-requests"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Retour aux demandes
      </Link>

      {/* Grille Principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLONNE GAUCHE : Contenu principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* En-tête de la demande */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl leading-tight">
              {request.title}
            </h1>
            <p className="text-sm text-slate-400">
              Publié par <span className="text-slate-200 font-semibold">{request.client.name ?? request.client.email}</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Description du besoin</h2>
            <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed bg-slate-900/20 border border-slate-900 rounded-2xl p-5 shadow-inner">
              {request.description}
            </div>
          </div>

          {/* Catégories */}
          {request.categories.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Secteurs d&apos;activité</h2>
              <div className="flex flex-wrap gap-2">
                {request.categories.map((rc) => (
                  <span
                    key={rc.categoryId}
                    className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-1.5 text-xs font-semibold text-blue-400 tracking-wide"
                  >
                    {rc.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section Liste des Offres */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>📩</span> Offres reçues ({request.offers.length})
            </h2>

            {request.offers.length === 0 ? (
              <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-10 text-center text-sm text-slate-500">
                Aucune proposition n&apos;a été soumise pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {request.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-slate-900 bg-slate-900/30 p-5 backdrop-blur-sm shadow-sm transition-all hover:border-slate-800"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5 flex-1">
                        <p className="text-sm font-bold text-slate-100">
                          {offer.provider.name ?? offer.provider.email}
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {offer.message}
                        </p>
                      </div>
                      
                      <div className="flex flex-row items-center justify-between border-t border-slate-900/50 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            {(offer.price / 100).toFixed(2)} $
                          </p>
                          <span className="inline-block rounded-md bg-slate-950 px-2 py-0.5 text-[9px] font-black text-slate-400 uppercase tracking-wider border border-slate-900 mt-1">
                            {offer.status}
                          </span>
                        </div>

                        {offer.status === "PENDING" && isRequestOwner && (
                          <form
                            action={async () => {
                              "use server";
                              await addToCart(offer.id);
                            }}
                            className="w-full sm:w-auto"
                          >
                            <button
                              type="submit"
                              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-md transition-all active:scale-[0.98]"
                            >
                              Prendre l&apos;offre
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire d'offre pour les prestataires */}
          {request.status === "OPEN" && canCreateOffer && (
            <div className="mt-10 border-t border-slate-900 pt-8">
              <OfferForm requestId={request.id} />
            </div>
          )}
        </div>

        {/* COLONNE DROITE : Sidebar d'informations (1/3) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          
          {/* Panneau d'informations clés */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-sm space-y-4 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Statut actuel</span>
              <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${currentStatusClass}`}>
                {request.status}
              </span>
            </div>

            {/* Détails logistiques */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-sm">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lieu d&apos;intervention</p>
                  <p className="text-slate-300 font-medium mt-0.5">{request.location ?? "Lieu non spécifié"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <span className="text-base mt-0.5">📅</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Date planifiée</p>
                  <p className="text-slate-300 font-medium mt-0.5">{new Date(request.neededAt).toLocaleDateString("fr-CA")}</p>
                </div>
              </div>
            </div>

            {/* Actions d'administration/propriétaire de la demande */}
            {request.status === "OPEN" && isRequestOwner && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900/60">
                <Link
                  href={`/service-requests/${request.id}/edit`}
                  className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-center text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-[0.98]"
                >
                  ✏️ Modifier
                </Link>
                <DeleteRequestButton requestId={request.id} />
              </div>
            )}
          </div>

          {/* Bloc de Réservation validée */}
          {request.booking && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>🎉</span> Réservation validée
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Contrat : <strong className="text-emerald-400 font-bold uppercase">{request.booking.status}</strong></p>
                <p>Fonds déposés : <strong className="text-white text-sm font-black">{(request.booking.amountTotal / 100).toFixed(2)} $</strong></p>
              </div>
            </div>
          )}

          {/* Messages de restrictions d'offres contextuels */}
          {request.status === "OPEN" && !canCreateOffer && (
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4 text-[11px] text-slate-400 leading-relaxed">
              {isRequestOwner
                ? "💡 Cette annonce vous appartient. Vous recevrez des alertes dès qu'un professionnel formulera une proposition budgétaire."
                : currentUser
                  ? "🔒 Votre rôle de profil est configuré sur 'Client'. Seuls les prestataires de services enregistrés peuvent soumettre une proposition commerciale."
                  : "🔒 Connexion requise. Veuillez vous identifier avec un profil prestataire pour pouvoir proposer vos services sur cette fiche."}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}