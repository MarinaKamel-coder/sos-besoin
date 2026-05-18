import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import AdminNav from "@/src/components/admin/AdminNav";
import DeleteOfferAdminButton from "@/src/components/admin/DeleteOfferAdminButton";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  WITHDRAWN: "Retirée",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ACCEPTED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  REJECTED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  WITHDRAWN: "text-slate-500 bg-white/[0.02] border-white/5",
};

export default async function AdminOffersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/");
  }

  const offers = await prisma.offer.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      request: { 
        select: { 
          id: true, 
          title: true, 
          status: true 
        } 
      },
      provider: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      <AdminNav active="offers" />

      {/* En-tête de section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-wider text-white sm:text-3xl tracking-tight">
          Gestion des offres
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Consultez les propositions financières soumises par les prestataires et surveillez l&apos;état des négociations.
        </p>
      </div>

      {/* Conteneur principal de la liste */}
      <div className="cyber-card rounded-2xl p-6 border-white/5 bg-white/[0.01]">
        {offers.length === 0 ? (
          <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-12 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
            Aucune proposition soumise actuellement sur le marché.
          </div>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => (
              <li 
                key={offer.id} 
                className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-5 hover:border-white/10 transition-all duration-200"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  
                  {/* Détails de la proposition (Gauche) */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <span className={`px-2 py-0.5 rounded border ${STATUS_STYLES[offer.status] ?? "text-slate-400 border-white/5 bg-white/5"}`}>
                        {STATUS_LABELS[offer.status] ?? offer.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Demande associée</p>
                      <Link 
                        href={`/service-requests/${offer.request.id}`} 
                        className="inline-block text-base font-bold text-slate-100 hover:text-purple-400 transition-colors duration-150 leading-snug"
                      >
                        {offer.request.title}
                      </Link>
                    </div>

                    <p className="text-xs font-bold text-slate-400">
                      Par : <span className="text-slate-300 font-medium">{offer.provider.name ?? offer.provider.email}</span>
                    </p>
                    
                    <div className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-3 text-xs text-slate-400 font-medium leading-relaxed max-w-3xl">
                      {offer.message}
                    </div>
                  </div>

                  {/* Prix / Métadonnées demande / Actions (Droite) */}
                  <div className="flex min-w-[180px] flex-col items-start gap-4 md:items-end md:justify-between text-xs md:text-right self-stretch border-t border-white/[0.02] pt-4 md:border-none md:pt-0">
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-white tracking-tight font-mono">
                        {(offer.price / 100).toFixed(2)} $ CAD
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Statut requête : <span className="text-slate-400">{offer.request.status}</span>
                      </p>
                    </div>
                    
                    <div className="w-full md:w-auto pt-1">
                      <DeleteOfferAdminButton offerId={offer.id} />
                    </div>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}