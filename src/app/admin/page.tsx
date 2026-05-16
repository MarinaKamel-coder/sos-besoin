import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/src/lib/prisma";
import RoleSelect from "@/src/components/admin/RoleSelect";
import AdminNav from "@/src/components/admin/AdminNav";

export default async function AdminDashboard() {
  // 1. Authentification Clerk
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // 2. Récupération de l'utilisateur en BDD
  const user = await prisma.user.findUnique({ where: { clerkId } });
  
  // 3. Guard de sécurité strict : Refoulement si pas ADMIN
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // 4. Agrégation des statistiques globales basées sur ton schéma Prisma
  const [totalUsers, totalRequests, totalOffers] = await Promise.all([
    prisma.user.count(),
    prisma.serviceRequest.count(),
    prisma.offer.count(),
  ]);

  // 5. Récupération de la liste complète des utilisateurs
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 6. Historique des actions admin
  const adminActions = await prisma.adminAction.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { admin: true },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-slate-950 min-h-screen space-y-8">
      
      {/* En-tête du Dashboard */}
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
            Administration système
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Supervisez l&apos;activité globale et ajustez les rôles d&apos;accès de la plateforme.
        </p>
      </div>

      <AdminNav active="dashboard" />

      {/* Grille des KPIs (Indicateurs clés de performance) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membres inscrits</p>
          <p className="text-2xl font-black text-white mt-1">{totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demandes actives</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{totalRequests}</p>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offres soumises</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{totalOffers}</p>
        </div>

      </div>

      {/* Section de gestion rapide */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Accès rapide aux outils admin
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gérer les utilisateurs, les demandes et les offres sans publier de nouvelle demande ou offre.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-all">
              Dashboard utilisateurs
            </Link>
            <Link href="/admin/service-requests" className="rounded-xl border border-blue-500 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all">
              Gérer les demandes
            </Link>
            <Link href="/admin/offers" className="rounded-xl border border-purple-500 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all">
              Gérer les offres
            </Link>
          </div>
        </div>
      </div>

      {/* Section Tableau des utilisateurs */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Tableau des utilisateurs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Consultez l’état des comptes, les rôles actuels et modifiez les permissions directement.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total : {totalUsers}
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-900 bg-slate-950/80">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/95 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-900/70 odd:bg-slate-950 even:bg-slate-950/70">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-100">
                      {u.name ?? "Utilisateur Anonyme"}
                    </div>
                    <div className="text-[11px] text-slate-500">{u.id === user.id ? "Vous" : ""}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-400 break-all">{u.email}</td>
                  <td className="px-4 py-4 text-slate-300">{u.role}</td>
                  <td className="px-4 py-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <RoleSelect userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Historique des actions admin */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Historique des actions admin
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Les dernières modifications de rôles et actions administratives enregistrées.
            </p>
          </div>
          <span className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400">
            {adminActions.length} action(s)
          </span>
        </div>

        <div className="space-y-3">
          {adminActions.length > 0 ? (
            adminActions.map((action) => (
              <div
                key={action.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-900/70 bg-slate-950/80 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-sm text-slate-100">{action.action}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Effectuée par {action.admin.name ?? action.admin.email}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                  {new Date(action.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aucune action administrative enregistrée pour le moment.</p>
          )}
        </div>
      </div>

    </main>
  );
}