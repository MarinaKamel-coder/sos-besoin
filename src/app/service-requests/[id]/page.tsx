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

  /* Configuration des badges de statut en tons néon lissés */
  const statusConfig: Record<string, string> = {
    OPEN: "bg-white/5 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(109,40,217,0.15)]",
    CLOSED: "bg-white/5 border-white/10 text-slate-400",
    PENDING: "bg-white/5 border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  };
  const currentStatusClass = statusConfig[request.status] || statusConfig.OPEN;

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-transparent min-h-screen">
      {/* Fil d'ariane / Retour */}
      <Link
        href="/service-requests"
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-purple-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
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
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Publié par <span className="text-purple-400 font-bold">{request.client.name ?? request.client.email}</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Description du besoin</h2>
            <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed bg-white/[0.01] border border-white/5 rounded-2xl p-6 font-medium shadow-inner">
              {request.description}
            </div>
          </div>

          {/* Catégories */}
          {request.categories.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Secteurs d&apos;activité</h2>
              <div className="flex flex-wrap gap-2">
                {request.categories.map((rc) => (
                  <span
                    key={rc.categoryId}
                    className="rounded-xl border border-purple-500/20 bg-cyber-purple/5 px-3 py-1.5 text-xs font-bold text-purple-300 tracking-wide backdrop-blur-sm"
                  >
                    {rc.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section Liste des Offres */}
          <div className="space-y-5 pt-4 border-t border-white/5">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <span>📩</span> Offres reçues ({request.offers.length})
            </h2> 

            {request.offers.length === 0 ? (
              <div className="cyber-card rounded-2xl p-10 text-center text-sm text-slate-500 font-medium">
                Aucune proposition n&apos;a été soumise pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {request.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="cyber-card rounded-2xl p-5 transition-all"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-bold text-white tracking-tight">
                          {offer.provider.name ?? offer.provider.email}
                        </p>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                          {offer.message}
                        </p>
                      </div>
                      
                      <div className="flex flex-row items-center justify-between border-t border-white/5 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-none sm:pt-0 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                            {(offer.price / 100).toFixed(2)} $
                          </p>
                          <span className="inline-block rounded-md bg-white/[0.02] px-2 py-0.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5 mt-1">
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
                              className="btn-cyber-primary w-full px-4 py-2 text-xs font-bold uppercase tracking-wider"
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
            <div className="mt-10 border-t border-white/5 pt-8">
              <OfferForm requestId={request.id} />
            </div>
          )}
        </div>

        {/* COLONNE DROITE : Sidebar d'informations (1/3) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          
          {/* Panneau d'informations clés */}
          <div className="cyber-card rounded-2xl p-5 space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Statut actuel</span>
              <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${currentStatusClass}`}>
                {request.status}
              </span>
            </div>

            {/* Détails logistiques */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 text-sm">
                <span className="text-base mt-0.5 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">📍</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Lieu d&apos;intervention</p>
                  <p className="text-slate-300 font-bold text-sm mt-0.5 tracking-tight">{request.location ?? "Lieu non spécifié"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-sm">
                <span className="text-base mt-0.5 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">📅</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Date planifiée</p>
                  <p className="text-slate-300 font-bold text-sm mt-0.5 tracking-tight">{new Date(request.neededAt).toLocaleDateString("fr-CA")}</p>
                </div>
              </div>
            </div>

            {/* Actions d'administration/propriétaire de la demande */}
            {request.status === "OPEN" && isRequestOwner && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
                <Link
                  href={`/service-requests/${request.id}/edit`}
                  className="rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2.5 text-center text-xs font-bold text-slate-300 hover:text-white hover:border-white/10 transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  ✏️ Modifier
                </Link>
                <DeleteRequestButton requestId={request.id} />
              </div>
            )}
          </div>

          {/* Bloc de Réservation validée */}
          {request.booking && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3 backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span>🎉</span> Réservation validée
              </h3>
              <div className="text-xs font-medium text-slate-400 space-y-1.5">
                <p>Contrat : <strong className="text-emerald-400 font-bold uppercase tracking-wider">{request.booking.status}</strong></p>
                <p>Fonds déposés : <strong className="text-white text-base font-black tracking-tight">{(request.booking.amountTotal / 100).toFixed(2)} $</strong></p>
              </div>
            </div>
          )}

          {/* Messages de restrictions d'offres contextuels */}
          {request.status === "OPEN" && !canCreateOffer && (
            <div className="cyber-card rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed font-medium">
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