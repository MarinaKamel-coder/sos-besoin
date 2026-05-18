import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import AdminNav from "@/src/components/admin/AdminNav";
import DeleteRequestAdminButton from "@/src/components/admin/DeleteRequestAdminButton";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouverte",
  FILLED: "Complétée",
  CANCELLED: "Annulée",
  HIDDEN: "Masquée",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  FILLED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CANCELLED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  HIDDEN: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default async function AdminServiceRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/");
  }

  const serviceRequests = await prisma.serviceRequest.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      _count: { select: { offers: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      <AdminNav active="requests" />

      {/* En-tête de section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-wider text-white sm:text-3xl tracking-tight">
          Gestion des demandes
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Consultez, analysez et modérez l&apos;ensemble des requêtes d&apos;assistance publiées par les clients.
        </p>
      </div>

      {/* Conteneur principal de la liste */}
      <div className="cyber-card rounded-2xl p-6 border-white/5 bg-white/[0.01]">
        {serviceRequests.length === 0 ? (
          <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-12 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
            Aucune demande disponible sur le système.
          </div>
        ) : (
          <ul className="space-y-3">
            {serviceRequests.map((request) => (
              <li 
                key={request.id} 
                className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-5 hover:border-white/10 transition-all duration-200"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2.5 flex-1">
                    {/* Badges de métadonnées */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <span className={`px-2 py-0.5 rounded border ${STATUS_STYLES[request.status] ?? "text-slate-400 border-white/5 bg-white/5"}`}>
                        {STATUS_LABELS[request.status] ?? request.status}
                      </span>
                      <span className="text-slate-600 font-normal">•</span>
                      <span className="text-purple-400 font-mono bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded">
                        {request._count.offers} offre(s)
                      </span>
                    </div>

                    {/* Titre & Description */}
                    <div className="space-y-1">
                      <Link 
                        href={`/service-requests/${request.id}`} 
                        className="inline-block text-base font-bold text-slate-100 hover:text-purple-400 transition-colors duration-150 leading-snug"
                      >
                        {request.title}
                      </Link>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 max-w-3xl">
                        {request.description}
                      </p>
                    </div>
                  </div>

                  {/* Bloc Client / Actions à droite */}
                  <div className="flex flex-col items-start gap-4 md:items-end md:justify-between text-xs md:text-right min-w-[180px] border-t border-white/[0.02] pt-4 md:border-none md:pt-0">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auteur (Client)</p>
                      <p className="font-bold text-slate-300">{request.client.name ?? "Utilisateur Anonyme"}</p>
                      <p className="text-[11px] text-slate-500 font-mono break-all max-w-[200px]">{request.client.email}</p>
                    </div>
                    
                    <div className="w-full md:w-auto pt-1">
                      <DeleteRequestAdminButton requestId={request.id} />
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