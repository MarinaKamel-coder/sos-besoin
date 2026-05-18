import prisma from "@/src/lib/prisma";
import { OfferStatus, Prisma } from "@/src/generated/prisma/client";

export const OFFERS_PER_PAGE = 10;

function clampPage(page: number) {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export type PaginatedMeta = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
};

/**
 * Offres reçues par un client (sur ses propres demandes), paginées.
 */
export async function getPaginatedReceivedOffers(params: {
  clientUserId: string;
  page?: number;
  offerStatus?: OfferStatus;
}) {
  const page = clampPage(params.page ?? 1);
  const skip = (page - 1) * OFFERS_PER_PAGE;
  const take = OFFERS_PER_PAGE;

  const where: Prisma.OfferWhereInput = {
    request: { clientId: params.clientUserId },
    ...(params.offerStatus ? { status: params.offerStatus } : {}),
  };

  const [items, totalCount] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        request: { select: { id: true, title: true, status: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / OFFERS_PER_PAGE));

  return {
    items,
    meta: {
      totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: OFFERS_PER_PAGE,
    } satisfies PaginatedMeta,
  };
}

/**
 * Offres envoyées par un prestataire, paginées.
 */
export type ProviderOfferView = "sent" | "received" | "all";

export async function getPaginatedSentOffers(params: {
  providerUserId: string;
  page?: number;
  offerStatus?: OfferStatus;
}) {
  const page = clampPage(params.page ?? 1);
  const skip = (page - 1) * OFFERS_PER_PAGE;
  const take = OFFERS_PER_PAGE;

  const where: Prisma.OfferWhereInput = {
    providerId: params.providerUserId,
    ...(params.offerStatus ? { status: params.offerStatus } : {}),
  };

  const [items, totalCount] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        request: { select: { id: true, title: true, status: true, clientId: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / OFFERS_PER_PAGE));

  return {
    items,
    meta: {
      totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: OFFERS_PER_PAGE,
    } satisfies PaginatedMeta,
  };
}

export async function getPaginatedProviderOffers(params: {
  providerUserId: string;
  page?: number;
  offerStatus?: OfferStatus;
  view?: ProviderOfferView;
}) {
  const page = clampPage(params.page ?? 1);
  const skip = (page - 1) * OFFERS_PER_PAGE;
  const take = OFFERS_PER_PAGE;

  const view = params.view ?? "sent";
  const statusFilter = params.offerStatus ? { status: params.offerStatus } : {};

  let where: Prisma.OfferWhereInput;

  if (view === "received") {
    where = {
      request: { clientId: params.providerUserId },
      ...statusFilter,
    };
  } else if (view === "all") {
    where = {
      OR: [
        { providerId: params.providerUserId },
        { request: { clientId: params.providerUserId } },
      ],
      ...statusFilter,
    };
  } else {
    where = {
      providerId: params.providerUserId,
      ...statusFilter,
    };
  }

  const [items, totalCount] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        request: { select: { id: true, title: true, status: true, clientId: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / OFFERS_PER_PAGE));

  return {
    items,
    meta: {
      totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: OFFERS_PER_PAGE,
    } satisfies PaginatedMeta,
  };
}
