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
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-transparent min-h-screen space-y-8">
      
      {/* En-tête du Dashboard */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" />
          <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight uppercase tracking-wider">
            Administration système
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Supervisez l&apos;activité globale, auditez les logs et ajustez les rôles d&apos;accès de la plateforme.
        </p>
      </div>  

      {/* Grille des KPIs (Indicateurs clés de performance) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="cyber-card rounded-2xl p-5 border-white/5 bg-white/[0.01] shadow-[0_0_20px_rgba(255,255,255,0.01)]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Membres inscrits</p>
          <p className="text-3xl font-black text-white mt-1.5 font-mono">{totalUsers}</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 border-blue-500/10 bg-blue-500/[0.01] shadow-[0_0_20px_rgba(59,130,246,0.03)]">
          <p className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Demandes actives</p>
          <p className="text-3xl font-black text-blue-400 mt-1.5 font-mono">{totalRequests}</p>
        </div>

        <div className="cyber-card rounded-2xl p-5 border-purple-500/10 bg-purple-500/[0.01] shadow-[0_0_20px_rgba(168,85,247,0.03)]">
          <p className="text-[10px] font-black text-purple-400/70 uppercase tracking-widest">Offres soumises</p>
          <p className="text-3xl font-black text-purple-400 mt-1.5 font-mono">{totalOffers}</p>
        </div>

      </div>


      {/* Section Tableau des utilisateurs */}
      <div className="cyber-card rounded-2xl p-6 border-white/5 bg-white/[0.01] space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Tableau général des utilisateurs
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Consultez l’état des comptes, auditez les permissions et appliquez les rôles d’accès directement.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
            Total : {totalUsers}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5 bg-transparent">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Identité / Nom</th>
                <th className="px-5 py-3.5">Courriel</th>
                <th className="px-5 py-3.5">Rôle</th>
                <th className="px-5 py-3.5">Date d'inscription</th>
                <th className="px-5 py-3.5 text-right">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-200">
                      {u.name ?? "Utilisateur Anonyme"}
                    </div>
                    {u.id === user.id && (
                      <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                        Vous
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-medium break-all font-mono text-[11px]">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wider ${
                      u.role === "ADMIN" 
                        ? "text-rose-400" 
                        : u.role === "PROVIDER" 
                        ? "text-purple-400" 
                        : "text-slate-400"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-block text-left">
                      <RoleSelect userId={u.id} currentRole={u.role} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Historique des actions admin */}
      <div className="cyber-card rounded-2xl p-6 border-white/5 bg-white/[0.01] space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Registre d&apos;audit administratif
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Historique immuable des dernières élévations de privilèges et actions de modération.
            </p>
          </div>
          <span className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            {adminActions.length} log(s)
          </span>
        </div>

        <div className="space-y-2.5">
          {adminActions.length > 0 ? (
            adminActions.map((action) => (
              <div
                key={action.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 sm:flex-row sm:items-center sm:justify-between hover:border-white/10 transition-all duration-200"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200 leading-relaxed">{action.action}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Exécuté par : <span className="text-slate-400 font-semibold">{action.admin.name ?? action.admin.email}</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
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
            <p className="text-xs text-slate-500 font-medium py-2">Aucune action administrative enregistrée dans le registre d'audit.</p>
          )}
        </div>
      </div>

    </main>
  );
}