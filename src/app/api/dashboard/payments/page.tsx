import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import Link from "next/link";

export default async function PaymentsHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!dbUser) redirect("/sign-in");

  let payments = [];

  // Récupération des données selon les relations strictes de ton schéma Prisma
  if (dbUser.role === "ADMIN") {
    payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            request: { include: { client: { select: { name: true, email: true } } } },
            offer: { include: { provider: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (dbUser.role === "PROVIDER") {
    payments = await prisma.payment.findMany({
      where: {
        booking: {
          offer: { providerId: dbUser.id },
        },
      },
      include: {
        booking: {
          include: {
            request: { include: { client: { select: { name: true, email: true } } } },
            offer: { include: { provider: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Mode CLIENT
    payments = await prisma.payment.findMany({
      where: {
        booking: {
          request: { clientId: dbUser.id },
        },
      },
      include: {
        booking: {
          include: {
            request: { select: { title: true, client: { select: { name: true, email: true } } } },
            offer: { include: { provider: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /* Configuration stylisée des badges correspondants à ton enum PaymentStatus */
  const paymentBadgeConfig: Record<string, string> = {
    SUCCEEDED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    REQUIRES_ACTION: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    FAILED: "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    REFUNDED: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  };

  const statusLabels: Record<string, string> = {
    SUCCEEDED: "Réussi",
    REQUIRES_ACTION: "Action requise",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
  };

  return (
    <main className="w-full max-w-5xl mx-auto p-6 text-slate-200 bg-transparent min-h-screen space-y-6 relative">
      
      {/* Halo de lumière d'ambiance néon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#7000ff]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* En-tête de la page */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            {dbUser.role === "ADMIN" && "🛡️ Panel Fiscal : Transactions Réseau"}
            {dbUser.role === "PROVIDER" && "💰 Mes revenus encaissés"}
            {dbUser.role === "CLIENT" && "💳 Mes paiements & Factures"}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {dbUser.role === "ADMIN" && "Supervision et audit global de tous les flux monétaires de l'application."}
            {dbUser.role === "PROVIDER" && "Consultez l'historique de vos prestations vendues et gérez vos justificatifs."}
            {dbUser.role === "CLIENT" && "Historique de vos règlements sécurisés. Téléchargez vos factures au format PDF."}
          </p>
        </div>

        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] backdrop-blur-md px-3 py-1.5 rounded-xl shadow-inner self-start sm:self-auto">
          🔒 Total : {payments.length} opération{payments.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Liste / Tableau principal */}
      <div className="relative z-10">
        {payments.length === 0 ? (
          <div className="bg-[#0c0a15]/30 border border-white/[0.04] rounded-3xl p-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-xl">
            Aucun flux de trésorerie enregistré sur ce compte.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.04] bg-[#0c0a15]/20 backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-4">Date / Réf</th>
                  <th className="p-4">Titre du besoin</th>
                  {dbUser.role === "ADMIN" && <th className="p-4">Parties Prenantes</th>}
                  {dbUser.role === "CLIENT" && <th className="p-4">Prestataire</th>}
                  {dbUser.role === "PROVIDER" && <th className="p-4">Auteur Client</th>}
                  <th className="p-4">État</th>
                  <th className="p-4">Montant Payé</th>
                  <th className="p-4 text-center">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs font-medium">
                {payments.map((p) => {
                  const reqTitle = p.booking?.request?.title ?? "Commande de service";
                  const clientInfo = p.booking?.request?.client;
                  const providerInfo = p.booking?.offer?.provider;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      {/* Date et Id */}
                      <td className="p-4 space-y-1">
                        <div className="text-white font-bold font-mono">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono tracking-tight uppercase">
                          Ref: {p.id.substring(0, 10)}...
                        </div>
                      </td>

                      {/* Titre de la demande parente */}
                      <td className="p-4 font-semibold text-slate-200 group-hover:text-[#ff00e5] transition-colors max-w-xs truncate">
                        {reqTitle}
                      </td>

                      {/* Gestion multi-rôles des colonnes intermédiaires */}
                      {dbUser.role === "ADMIN" && (
                        <td className="p-4 space-y-0.5 text-[11px]">
                          <div className="text-purple-400">Client: {clientInfo?.name || clientInfo?.email}</div>
                          <div className="text-pink-400">Pro: {providerInfo?.name || providerInfo?.email}</div>
                        </td>
                      )}
                      {dbUser.role === "CLIENT" && (
                        <td className="p-4 text-slate-300 font-medium">
                          👤 {providerInfo?.name || providerInfo?.email}
                        </td>
                      )}
                      {dbUser.role === "PROVIDER" && (
                        <td className="p-4 text-slate-300 font-medium">
                          👤 {clientInfo?.name || clientInfo?.email}
                        </td>
                      )}

                      {/* Statut du paiement */}
                      <td className="p-4">
                        <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${paymentBadgeConfig[p.status] || paymentBadgeConfig.REQUIRES_ACTION}`}>
                          {statusLabels[p.status] || p.status}
                        </span>
                      </td>

                      {/* Montant total calculé */}
                      <td className="p-4 font-black text-white font-mono text-sm">
                        {((p.booking?.amountTotal ?? 0) / 100).toFixed(2)} $
                      </td>

                      {/* Action PDF */}
                      <td className="p-4 text-center">
                        {p.status === "SUCCEEDED" ? (
                          <Link
                            href={`/api/invoice/${p.id}`}
                            target="_blank"
                            className="inline-flex items-center justify-center px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/30 hover:text-white transition-all shadow-[0_0_12px_rgba(112,0,255,0.1)] active:scale-95"
                          >
                            📄 Ouvrir
                          </Link>
                        ) : (
                          <span className="text-[10px] text-slate-600 uppercase font-mono">Indisponible</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}