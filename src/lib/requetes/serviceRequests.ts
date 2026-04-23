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
            { description: {contains: q, mode: "insensitive" } },
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
                _count: { select: { offers: true }},  // utile pour UI: nb offres
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

    //Exemple de sortie facile a afficher:
    // { OPEN: 12, FILLED: 3, CANCELLED: 1, HIDDEN: 0}
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
     * Agregation globale: stats du marketplace
     * Utilise aggregate() avec _count, _avg, _min, _max et _sum
     */
export async function getMarketplaceStats() {
    // Promise.all pour exécuter les 3 requêtes en parallèle
    const [totalRequests, offerStats, bookingSum] = await Promise.all([
        // 1. Nombre total de demandes, tous statuts confondus
        prisma.serviceRequest.count(),

        // 2. Stats sur les offres: moyenne, min, max du prix + total
        prisma.offer.aggregate({
            _count: { _all: true },
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true },
        }),

        // 3. Volume total (en cents) des bookings CONFIRMED
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