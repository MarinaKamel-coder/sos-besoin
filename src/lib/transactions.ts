import prisma from "./prisma";

const PLATFORM_FEE_BPS = 1000; // 10%

function calcPlatformFee(subtotal: number) {
  return Math.round((subtotal * PLATFORM_FEE_BPS) / 10000);
}

/**
 * Transaction séquentielle:
 * Crée une demande (request) liée à une catégorie existante dans un seul bloc atomique.
 *
 * Accepte désormais categoryId au lieu de { name, slug }
 * car le formulaire soumet un categoryId (select), pas les métadonnées de la catégorie.
 *
 * ANCIENNE SIGNATURE (conservée pour référence) :
 * category: { name: string; slug: string }
 * → utilisait un upsert pour créer la catégorie si absente
 * → remplacée car les catégories sont pré-existantes en BD (seed)
 */
export async function createRequestWithCategory(params: {
  clientId: string;
  categoryId: string;
  request: {
    title: string;
    description: string;
    neededAt: Date;
    location?: string | null;
  };
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Vérifie que la catégorie existe (lance une erreur si absente → rollback)
      const category = await tx.category.findUniqueOrThrow({
        where: { id: params.categoryId },
      });

      const request = await tx.serviceRequest.create({
        data: {
          clientId: params.clientId,
          title: params.request.title,
          description: params.request.description,
          neededAt: params.request.neededAt,
          location: params.request.location ?? null,
          categories: {
            create: [{ categoryId: category.id }],
          },
        },
      });

      return { category, request };
    });

    return { success: true as const, ...result };
  } catch (error) {
    return { success: false as const, error: (error as Error).message };
  }
}

/**
 * Transaction interactive (ACID):
 * Accepter une offre => créer Booking + mettre à jour statuts.
 * - Empêche double acceptation via Booking.requestId unique.
 * - Rollback automatique si conflit/erreur.
 */
export async function acceptOfferAndCreateBooking(params: {
  requestId: string;
  offerId: string;
}) {
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.findUnique({
        where: { id: params.requestId },
        include: { booking: true },
      });
      if (!request) throw new Error("Demande introuvable.");
      if (request.status !== "OPEN")
        throw new Error(`Demande non ouverte (status=${request.status}).`);
      if (request.booking)
        throw new Error("Une réservation existe déjà pour cette demande.");

      const offer = await tx.offer.findUnique({
        where: { id: params.offerId },
      });
      if (!offer) throw new Error("Offre introuvable.");
      if (offer.requestId !== request.id)
        throw new Error("Cette offre ne correspond pas à la demande.");

      if (offer.status !== "PENDING")
        throw new Error(`Offre non disponible (status=${offer.status}).`);

      const subtotal = offer.price;
      const platformFee = calcPlatformFee(subtotal);
      const total = subtotal + platformFee;

      // Créer booking (si 2 transactions concurrentes -> contrainte unique sur requestId ou offerId fera échouer une des deux)
      const booking = await tx.booking.create({
        data: {
          requestId: request.id,
          offerId: offer.id,
          amountSubtotal: subtotal,
          platformFee,
          amountTotal: total,
          status: "CONFIRMED",
          payment: {
            create: {
              status: "SUCCEEDED",
              stripePaymentIntentId: `pi_test_${Date.now()}`, // démo
            },
          },
        },
      });

      // Update demande + offre acceptée
      await tx.serviceRequest.update({
        where: { id: request.id },
        data: { status: "FILLED" },
      });

      await tx.offer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED" },
      });

      // Rejeter les autres offres (facultatif mais propre)
      await tx.offer.updateMany({
        where: {
          requestId: request.id,
          NOT: { id: offer.id },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      return booking;
    });

    return { success: true as const, booking };
  } catch (error) {
    return { success: false as const, error: (error as Error).message };
  }
}
