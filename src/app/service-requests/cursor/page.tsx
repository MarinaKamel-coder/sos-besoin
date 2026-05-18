import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import { getCursorPaginatedServiceRequests } from "@/src/lib/requetes/serviceRequests";
import { RequestStatus } from "@/src/generated/prisma/client";

function parseStatus(value?: string): RequestStatus | undefined {
    if (!value) return undefined;
    const allowed = ["OPEN", "FILLED", "CANCELLED", "HIDDEN"];
    return allowed.includes(value) ? (value as RequestStatus) : undefined;
}

const STATUS_LABELS: Record<RequestStatus, string> = {
    OPEN: "Ouverte",
    FILLED: "Pourvue",
    CANCELLED: "Annulée",
    HIDDEN: "Masquée",
};

/**
 * BONUS - Démo de la pagination par CURSEUR (cursor-based)
 */
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        cursor?: string;
        q?: string;
        status?: string;
    }>;
}) {
    const params = await searchParams;

    const { userId } = await auth();
    let excludeClientId: string | undefined;
    let forClientId: string | undefined;
    if (userId) {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true },
        });
        if (dbUser?.role === "PROVIDER") {
            excludeClientId = dbUser.id;
        }
        if (dbUser?.role === "CLIENT") {
            forClientId = dbUser.id;
        }
    }

    const { items, meta } = await getCursorPaginatedServiceRequests({
        cursor: params.cursor,
        q: params.q,
        status: parseStatus(params.status),
        excludeClientId,
        forClientId,
    });

    const buildNextUrl = (cursorId: string) => {
        const sp = new URLSearchParams();
        if (params.q) sp.set("q", params.q);
        if (params.status) sp.set("status", params.status);
        sp.set("cursor", cursorId);
        return `/service-requests/cursor?${sp.toString()}`;
    };

    const buildResetUrl = () => {
        const sp = new URLSearchParams();
        if (params.q) sp.set("q", params.q);
        if (params.status) sp.set("status", params.status);
        return sp.toString() ? `/service-requests/cursor?${sp.toString()}` : `/service-requests/cursor`;
    };

    const statusBadgeConfig: Record<RequestStatus, string> = {
        OPEN: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
        FILLED: "border-purple-500/20 bg-purple-500/5 text-purple-400",
        CANCELLED: "border-rose-500/20 bg-rose-500/5 text-rose-400",
        HIDDEN: "border-white/5 bg-white/[0.02] text-slate-400",
    };

    return (
        <main className="mx-auto w-full max-w-5xl p-6 text-slate-100 bg-transparent space-y-6">
            
            {/* En-tête de la page */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                    {forClientId
                        ? "Mes demandes (Curseur)"
                        : "Demandes urgentes (Curseur)"}
                </h1>
                <Link
                    href="/service-requests"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors gap-1 shrink-0"
                >
                    Version offset →
                </Link>
            </div>

            {/* Bannières de rôle contextuelles */}
            {forClientId && (
                <div className="text-xs font-bold uppercase tracking-wider rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.05)]">
                    📌 Liste restreinte à vos propres demandes créées.
                </div>
            )}

            {excludeClientId && (
                <div className="text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                    💼 Vue prestataire : vos propres demandes de service ne figurent pas ici.
                </div>
            )}

            {/* Note d'explication technique du mode Curseur */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-400">
                <span className="font-black uppercase tracking-wider text-purple-400 mr-2">Mode CURSEUR.</span> 
                Cette page utilise l'identifiant unique <code>cursor: {"{ id }"}</code> au lieu du saut d'index (<code>skip</code>). Idéal pour les flux de données infinis ou à haute fréquence. Pas d'accès direct à une page arbitraire : navigation séquentielle unique.
            </div>

            {/* Compteur et Métadonnées */}
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{items.length} résultat{items.length > 1 ? "s" : ""} affiché{items.length > 1 ? "s" : ""}</span>
                {meta.usedCursor && (
                    <>
                        <span className="text-slate-700">•</span>
                        <span className="normal-case font-medium text-slate-400">
                            Curseur actuel : <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-300 ml-1 font-mono">{meta.usedCursor}</code>
                        </span>
                    </>
                )}
            </div>

            {/* Liste des demandes */}
            {items.length === 0 ? (
                <div className="cyber-card rounded-2xl p-12 text-center text-sm text-slate-500 font-medium">
                    Aucune demande trouvée.
                </div>
            ) : (
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li 
                            key={item.id} 
                            className="cyber-card rounded-2xl p-5 flex flex-col gap-4 group transition-all hover:border-white/10"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1.5 flex-1">
                                    <h2 className="text-lg font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
                                        <Link href={`/service-requests/${item.id}`}>
                                            {item.title}
                                        </Link>
                                    </h2>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed line-clamp-2">
                                        {item.description}
                                    </p>
                                    
                                    {/* Métadonnées de la ligne */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span className="text-slate-400 normal-case font-medium">
                                            Par {item.client.name ?? item.client.email}
                                        </span>
                                        <span className="text-slate-700">•</span>
                                        <span className="text-purple-400/80">
                                            {item._count.offers} offre{item._count.offers > 1 ? "s" : ""}
                                        </span>
                                        {item.location && (
                                            <>
                                                <span className="text-slate-700">•</span>
                                                <span className="text-slate-400 normal-case font-medium">
                                                    📍 {item.location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Badge d'état de la demande */}
                                <span className={`self-start rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shrink-0 ${statusBadgeConfig[item.status]}`}>
                                    {STATUS_LABELS[item.status] ?? item.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Navigation par curseur directionnel */}
            <nav
                aria-label="Pagination par curseur"
                className="flex items-center justify-center gap-3 pt-4"
            >
                <Link
                    href={buildResetUrl()}
                    className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/10 transition-all duration-200 active:scale-95"
                >
                    ← Début
                </Link>

                {meta.hasMore && meta.nextCursor ? (
                    <Link
                        href={buildNextUrl(meta.nextCursor)}
                        className="btn-cyber-primary px-5 py-2 text-xs font-bold uppercase tracking-widest"
                    >
                        Suivant →
                    </Link>
                ) : (
                    <span className="rounded-xl border border-white/5 bg-white/[0.01] px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 cursor-not-allowed select-none">
                        Fin de liste
                    </span>
                )}
            </nav>
        </main>
    );
}