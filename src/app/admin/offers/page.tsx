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
          id: true, // 👈 Ajouté ici pour corriger l'erreur de build TypeScript !
          title: true, 
          status: true 
        } 
      },
      provider: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      <AdminNav active="offers" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Gestion des offres
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les offres soumises par les prestataires et suivez leur statut.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4 backdrop-blur-sm">
        {offers.length === 0 ? (
          <div className="rounded-xl border border-slate-900/60 bg-slate-950/80 p-12 text-center text-xs font-medium text-slate-500">
            Aucune offre disponible actuellement.
          </div>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => (
              <li key={offer.id} className="rounded-xl border border-slate-900 bg-slate-950/60 p-5 transition-all duration-150 hover:border-slate-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-400">
                        {STATUS_LABELS[offer.status]}
                      </span>
                    </div>

                    {/* Le lien fonctionne à nouveau ! */}
                    <Link 
                      href={`/service-requests/${offer.request.id}`} 
                      className="block text-base font-bold text-white hover:text-blue-400 tracking-tight transition-colors"
                    >
                      {offer.request.title}
                    </Link>

                    <p className="text-xs font-semibold text-slate-300">
                      Par : <span className="text-slate-400 font-normal">{offer.provider.name ?? offer.provider.email}</span>
                    </p>
                    
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl bg-slate-900/30 p-2.5 border border-slate-900/40 rounded-lg">
                      {offer.message}
                    </p>
                  </div>

                  <div className="flex min-w-[150px] flex-col items-end justify-between gap-4 text-right self-stretch">
                    <div>
                      <p className="text-lg font-black text-white tracking-tight">
                        {(offer.price / 100).toFixed(2)} $ CAD
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                        Requête : {offer.request.status}
                      </p>
                    </div>
                    
                    <DeleteOfferAdminButton offerId={offer.id} />
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