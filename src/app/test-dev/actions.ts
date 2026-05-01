"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma";
import { Role } from "../../generated/prisma/client";

// ⚠️ Réservé au développement local uniquement
function assertDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Cette action n'est disponible qu'en développement.");
  }
}

function inDays(d: number) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

/**
 * Réinitialise les données de test pour l'utilisateur connecté :
 * - supprime son panier, ses demandes et les offres liées
 * - recrée 2 demandes + 4 offres de prestataires de déménagement
 */
export async function resetMyTestData(): Promise<{
  success: boolean;
  message: string;
}> {
  assertDev();

  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié." };

  // 1) Trouver ou créer l'utilisateur en BD
  let dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: { clerkId, email: `${clerkId}@dev.local`, role: Role.CLIENT },
    });
  } else if (dbUser.role !== Role.CLIENT && dbUser.role !== Role.ADMIN) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: Role.CLIENT },
    });
  }

  // 2) Nettoyer uniquement les données de cet utilisateur
  const userRequests = await prisma.serviceRequest.findMany({
    where: { clientId: dbUser.id },
    select: { id: true },
  });
  const requestIds = userRequests.map((r) => r.id);

  if (requestIds.length > 0) {
    const offers = await prisma.offer.findMany({
      where: { requestId: { in: requestIds } },
      select: { id: true },
    });
    const offerIds = offers.map((o) => o.id);

    if (offerIds.length > 0) {
      const bookings = await prisma.booking.findMany({
        where: { offerId: { in: offerIds } },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      if (bookingIds.length > 0) {
        await prisma.payment.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });
        await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      await prisma.cartItem.deleteMany({
        where: { offerId: { in: offerIds } },
      });
      await prisma.offer.deleteMany({ where: { id: { in: offerIds } } });
    }

    await prisma.requestCategory.deleteMany({
      where: { requestId: { in: requestIds } },
    });
    await prisma.serviceRequest.deleteMany({
      where: { id: { in: requestIds } },
    });
  }

  // Vider le panier de l'utilisateur
  const cart = await prisma.cart.findUnique({ where: { userId: dbUser.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // 3) S'assurer que les prestataires de test existent (upsert)
  const provider1 = await prisma.user.upsert({
    where: { clerkId: "clerk_provider_003" },
    update: {},
    create: {
      clerkId: "clerk_provider_003",
      email: "pro.demenagement@sos-besoin.test",
      name: "Marco Déménagement",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Spécialiste meubles lourds, camionnette disponible, 8 ans d'expérience.",
          city: "Montréal",
          phone: "514-333-3333",
        },
      },
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { clerkId: "clerk_provider_004" },
    update: {},
    create: {
      clerkId: "clerk_provider_004",
      email: "pro.transport@sos-besoin.test",
      name: "Léa Transport & Déménagement",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Équipe de 2, weekends, démontage/remontage IKEA inclus.",
          city: "Laval",
          phone: "450-444-4444",
        },
      },
    },
  });

  const provider3 = await prisma.user.upsert({
    where: { clerkId: "clerk_provider_001" },
    update: {},
    create: {
      clerkId: "clerk_provider_001",
      email: "pro.guitar@sos-besoin.test",
      name: "Alex Guitariste",
      role: Role.PROVIDER,
      profile: {
        create: {
          bio: "Guitariste remplaçant, rock/jazz.",
          city: "Montréal",
          phone: "514-111-1111",
        },
      },
    },
  });

  // 4) Catégorie maison (upsert)
  const catMaison = await prisma.category.upsert({
    where: { slug: "maison" },
    update: {},
    create: { name: "Maison", slug: "maison" },
  });

  const catMusique = await prisma.category.upsert({
    where: { slug: "musique" },
    update: {},
    create: { name: "Musique", slug: "musique" },
  });

  // 5) Créer les demandes
  const req1 = await prisma.serviceRequest.create({
    data: {
      clientId: dbUser.id,
      title: "SOS: aide déménagement urgent ce weekend",
      description:
        "Besoin d'aide pour déménager quelques meubles lourds. Camion fourni, besoin de 2-3 bras.",
      neededAt: inDays(3),
      location: "Montréal (Villeray)",
      categories: { create: [{ categoryId: catMaison.id }] },
    },
  });

  const req2 = await prisma.serviceRequest.create({
    data: {
      clientId: dbUser.id,
      title: "SOS: guitariste remplaçant pour show",
      description:
        "Notre guitariste est malade. Set de 90 minutes, style rock/pop.",
      neededAt: inDays(2),
      location: "Montréal (Plateau)",
      categories: { create: [{ categoryId: catMusique.id }] },
    },
  });

  // 6) Créer les offres
  await prisma.offer.createMany({
    data: [
      {
        requestId: req1.id,
        providerId: provider1.id,
        price: 9500,
        message: "Disponible samedi dès 8h. Meubles lourds aucun problème.",
      },
      {
        requestId: req1.id,
        providerId: provider2.id,
        price: 11000,
        message: "On peut venir à 2 ce weekend. Démontage/remontage inclus.",
      },
      {
        requestId: req2.id,
        providerId: provider3.id,
        price: 25000,
        message: "Disponible. Je peux arriver 1h avant pour soundcheck.",
      },
    ],
  });

  revalidatePath("/list-offers");
  revalidatePath("/cart");
  revalidatePath("/service-requests");

  return {
    success: true,
    message:
      "✅ Données de test réinitialisées : 2 demandes + 3 offres créées.",
  };
}
