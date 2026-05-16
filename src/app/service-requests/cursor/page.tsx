import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import { getCursorPaginatedServiceRequests } from "@/src/lib/requetes/serviceRequests";
import { RequestStatus } from "@/src/generated/prisma/client";

// Verifie que la valeur recue est bien un RequestStatus
function parseStatus(value?: string): RequestStatus | undefined {
    if (!value) return undefined;
    const allowed = ["OPEN", "FILLED", "CANCELLED", "HIDDEN"];
    return allowed.includes(value) ? (value as RequestStatus) : undefined;
}

/**
 * BONUS - Demo de la pagination par CURSEUR (cursor-based)
 *
 * URL: /service-requests/cursor?cursor=<lastId>&q=...&status=OPEN
 *
 * Difference avec /service-requests :
 *   - /service-requests          --> pagination par OFFSET (page 1, 2, 3...)
 *   - /service-requests/cursor   --> pagination par CURSEUR (Suivant uniquement)
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

    // Construit l'URL pour la page suivante (en preservant les filtres)
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

    return (
        <main className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    {forClientId
                        ? "Mes demandes (pagination curseur)"
                        : "Demandes urgentes (pagination par curseur)"}
                </h1>
                <Link
                    href="/service-requests"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Voir la version par offset →
                </Link>
            </div>

            {forClientId && (
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
                    Liste restreinte à vos propres demandes.
                </p>
            )}

            {excludeClientId && (
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20">
                    Vue prestataire : vos propres demandes ne figurent pas dans cette liste.
                </p>
            )}

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                <strong>Mode CURSEUR.</strong> Cette page utilise{" "}
                <code>cursor: {"{ id }"}</code> au lieu de <code>skip</code>. Pas d'acces
                direct a une page N : uniquement « Suivant ».
            </div>

            <p className="text-sm text-gray-600 mb-4">
                {items.length} resultat{items.length > 1 ? "s" : ""} affiche
                {items.length > 1 ? "s" : ""}
                {meta.usedCursor && (
                    <>
                        {" "}- curseur courant : <code>{meta.usedCursor}</code>
                    </>
                )}
            </p>

            {items.length === 0 ? (
                <div className="border rounded p-8 text-center text-gray-500">
                    Aucune demande trouvee.
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((item) => (
                        <li key={item.id} className="border rounded p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-semibold text-lg">
                                        <Link
                                            href={`/service-requests/${item.id}`}
                                            className="hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {item.description}
                                    </p>
                                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                        <span>Par {item.client.name ?? item.client.email}</span>
                                        <span>•</span>
                                        <span>{item._count.offers} offre(s)</span>
                                        {item.location && (
                                            <>
                                                <span>•</span>
                                                <span>{item.location}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs border rounded px-2 py-1 bg-gray-100">
                                    {item.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Navigation par curseur */}
            <nav
                aria-label="Pagination par curseur"
                className="flex items-center justify-center gap-3 mt-6"
            >
                <Link
                    href={buildResetUrl()}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    ← Retour au debut
                </Link>

                {meta.hasMore && meta.nextCursor ? (
                    <Link
                        href={buildNextUrl(meta.nextCursor)}
                        className="px-3 py-1 border rounded bg-blue-600 text-white hover:bg-blue-500"
                    >
                        Suivant →
                    </Link>
                ) : (
                    <span className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
                        Fin de la liste
                    </span>
                )}
            </nav>
        </main>
    );
}
