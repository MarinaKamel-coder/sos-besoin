import prisma from "@/src/lib/prisma";
import { RequestStatus, Prisma, BookingStatus } from "@/src/generated/prisma/client";

export const ITEMS_PER_PAGE = 10;

export type ServiceRequestSortField = "createdAt" | "updatedAt" | "neededAt" | "title";
export type SortOrder = "asc" | "desc";

export type GetPaginatedServiceRequestsParams = {
    page?: number;
    q?: string;
    status?: RequestStatus;
    from?: string; // ISO date string (ex: "2024-01-01")
    to?: string;   // ISO date string (ex: "2024-12-31")
    sort?: ServiceRequestSortField;
    order?: SortOrder;
    /** Exclure les demandes dont l'utilisateur est le client (ex. vue prestataire) */
    excludeClientId?: string;
    /** Restreindre aux demandes de ce client (vue « mes demandes ») */
    forClientId?: string;
    /** Filtre d'état spécifique (ex: "my-offers") */
    filter?: string;    
    /** Identifiant ou filtre de catégorie */
    category?: string;    
    /** ID de l'utilisateur en BDD (nécessaire pour filtrer "my-offers" via le providerId) */
    currentDbUserId?: string; 
};

function clampPage(page: number) {
    if (!Number.isFinite(page) || page < 1) return 1;
    return Math.floor(page);
}

function parseDateOrUndefined(value?: string) {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

function normalizeSort(sort?: string): ServiceRequestSortField {
    if (sort === "neededAt" || sort === "createdAt" || sort === "updatedAt" || sort === "title") return sort;
    return "createdAt";
}

function normalizeOrder(order?: string): SortOrder {
    return order === "asc" || order === "desc" ? order : "desc";
}

/**
 * Requete detail avec relations (include)
 */
export async function getServiceRequestById(id: string) {
    if (!id) return null;

    return prisma.serviceRequest.findUnique({
        where: { id }, 
        include: {
            client: true, 
            categories: { include: { category: true }}, 
            offers: {
                include: {
                    provider: true, 
                },
                orderBy: { createdAt: "desc" }, 
            },
            booking: {
                include: {
                    payment: true, 
                },
            },
        },
    });
}

/**
 * Liste paginée + filtres + tri + meta
 */
export async function getPaginatedServiceRequests(params: GetPaginatedServiceRequestsParams) {
    const page = clampPage(params.page ?? 1);
    const q = (params.q ?? "").trim();
    const status = params.status;

    const fromDate = parseDateOrUndefined(params.from);
    const toDate = parseDateOrUndefined(params.to);

    const sortField = normalizeSort(params.sort);
    const sortOrder = normalizeOrder(params.order);

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const take = ITEMS_PER_PAGE;

    // where dynamique (filtres)
    const where: Prisma.ServiceRequestWhereInput = {};
    
    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }

    if (status) {
        where.status = status;
    }

    if (fromDate || toDate) {
        where.neededAt = {};
        if (fromDate) where.neededAt.gte = fromDate;
        if (toDate) where.neededAt.lte = toDate;
    }

    if (params.forClientId) {
        where.clientId = params.forClientId;
    } else if (params.excludeClientId) {
        where.clientId = { not: params.excludeClientId };
    }

    //  1. Filtrage par Catégorie (s'adapte à ta table de liaison `categories`)
    if (params.category) {
        where.categories = {
            some: {
                categoryId: params.category,
            },
        };
    }

    // 2. Filtrage par "Mes propositions" (Le prestataire a soumis une offre)
    if (params.filter === "my-offers" && params.currentDbUserId) {
        where.offers = {
            some: {
                providerId: params.currentDbUserId,
            },
        };
    }

    //orderBy dynamique (tri)
    const orderBy: Prisma.ServiceRequestOrderByWithRelationInput = { [sortField]: sortOrder };

    const [items, totalCount] = await Promise.all([
        prisma.serviceRequest.findMany({
            where, 
            orderBy,
            skip, 
            take, 
            include: {
                client: true, 
                categories: { include: { category: true }}, 
                _count: { select: { offers: true }},
            }, 
        }), 
        prisma.serviceRequest.count({ where }), 
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    return {
        items, 
        meta: {
            totalCount, 
            currentPage: page, 
            totalPages, 
            itemsPerPage: ITEMS_PER_PAGE,
        }, 
    };
}

/**
 * Agregation (ex: nombre de demandes par statut)
 */
export async function getServiceRequestStats() {
    const grouped = await prisma.serviceRequest.groupBy({
        by: ["status"], 
        _count: { _all: true }, 
    });

    const countsByStatus: Record<RequestStatus, number> = {
        OPEN: 0, 
        FILLED: 0, 
        CANCELLED: 0, 
        HIDDEN: 0, 
    };

    for (const row of grouped) {
        countsByStatus[row.status] = row._count._all;
    }

    return {
        countsByStatus, 
        raw: grouped,
    };
}

/**
 * Pagination par CURSEUR (cursor-based pagination)
 */
export type GetCursorPaginatedServiceRequestsParams = {
    cursor?: string;
    take?: number;
    q?: string;
    status?: RequestStatus;
    excludeClientId?: string;
    forClientId?: string;
};

export async function getCursorPaginatedServiceRequests(
    params: GetCursorPaginatedServiceRequestsParams
) {
    const take = params.take && params.take > 0 ? Math.min(params.take, 50) : ITEMS_PER_PAGE;
    const q = (params.q ?? "").trim();

    const where: Prisma.ServiceRequestWhereInput = {};
    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }
    if (params.status) where.status = params.status;
    if (params.forClientId) {
        where.clientId = params.forClientId;
    } else if (params.excludeClientId) {
        where.clientId = { not: params.excludeClientId };
    }

    const items = await prisma.serviceRequest.findMany({
        where,
        take: take + 1,
        ...(params.cursor
            ? {
                  cursor: { id: params.cursor },
                  skip: 1,
              }
            : {}),
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
        include: {
            client: true,
            categories: { include: { category: true } },
            _count: { select: { offers: true } },
        },
    });

    const hasMore = items.length > take;
    const pageItems = hasMore ? items.slice(0, take) : items;

    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

    return {
        items: pageItems,
        meta: {
            take,
            nextCursor,
            hasMore,
            usedCursor: params.cursor ?? null,
        },
    };
}

/**
 * Agregation globale: stats du marketplace
 */
export async function getMarketplaceStats() {
    const [totalRequests, offerStats, bookingSum] = await Promise.all([
        prisma.serviceRequest.count(),

        prisma.offer.aggregate({
            _count: { _all: true },
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true },
        }),

        prisma.booking.aggregate({
            where: { status: BookingStatus.CONFIRMED },
            _sum: { amountTotal: true },
        }),
    ]);

    return {
        totalRequests,
        totalOffers: offerStats._count._all,
        offerPrice: {
            avg: offerStats._avg.price,
            min: offerStats._min.price,
            max: offerStats._max.price,
        },
        confirmedBookingsVolume: bookingSum._sum.amountTotal ?? 0,
    };
}