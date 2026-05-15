"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "../lib/prisma";

const PLATFORM_FEE_RATE = 0.1;

async function getCurrentDbUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Utilisateur non authentifié.");
  }

  let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

  if (!user) {
    const clerkUser = await currentUser();
      user = await prisma.user.upsert({
        where: { email: clerkUser?.emailAddresses[0]?.emailAddress ?? "" },
        update: { clerkId: clerkUserId },
        create: {
          clerkId: clerkUserId,
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
          name: clerkUser?.fullName ?? clerkUser?.firstName ?? null,
        },
      });

  }

  return user;
}

async function getOrCreateCart(userId: string) {
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: { userId },
  });
}

function calculateTotals(
  items: Array<{ quantity: number; offer: { price: number } }>,
) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.offer.price * item.quantity;
  }, 0);

  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + platformFee;

  return { subtotal, platformFee, total };
}

export async function getCart() {
  const currentUser = await getCurrentDbUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: currentUser.id },
    include: {
      items: {
        include: {
          offer: {
            include: {
              request: true,
              provider: true,
              booking: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      platformFee: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const validItems = cart.items.filter((item) => !item.offer.booking);
  const { subtotal, platformFee, total } = calculateTotals(validItems);
  const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: validItems,
    subtotal,
    platformFee,
    total,
    itemCount,
  };
}

export async function getCartCount() {
  const currentUser = await getCurrentDbUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: currentUser.id },
    include: {
      items: true,
    },
  });

  if (!cart) return 0;

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function addToCart(offerId: string) {
  const currentUser = await getCurrentDbUser();

  if (currentUser.role !== "CLIENT" && currentUser.role !== "ADMIN") {
    throw new Error("Seul un client peut ajouter une offre au panier.");
  }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      request: true,
      booking: true,
    },
  });

  if (!offer) {
    throw new Error("Offre introuvable.");
  }

  if (
    offer.request.clientId !== currentUser.id &&
    currentUser.role !== "ADMIN"
  ) {
    throw new Error(
      "Vous ne pouvez pas ajouter au panier une offre qui ne vous appartient pas.",
    );
  }

  if (offer.request.status !== "OPEN" && offer.request.status !== "FILLED") {
    throw new Error("La demande liée à cette offre n'est plus disponible.");
  }

  if (offer.status === "REJECTED" || offer.status === "WITHDRAWN") {
    throw new Error("Cette offre n'est plus disponible.");
  }

  if (offer.booking) {
    throw new Error("Cette offre a déjà été transformée en réservation.");
  }

  const cart = await getOrCreateCart(currentUser.id);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_offerId: {
        cartId: cart.id,
        offerId,
      },
    },
  });

  // NOTE: incrémentation de quantité désactivée — une offre de service ne peut
  // pas être commandée en plusieurs exemplaires (logique métier 1 offre = 1 réservation).
  // if (existingItem) {
  //   const updatedItem = await prisma.cartItem.update({
  //     where: { id: existingItem.id },
  //     data: {
  //       quantity: existingItem.quantity + 1,
  //     },
  //   });
  //   revalidatePath("/cart");
  //   revalidatePath("/service-requests");
  //   revalidatePath("/my-requests");
  //   return {
  //     success: true,
  //     message: "Quantité du panier mise à jour.",
  //     item: updatedItem,
  //   };
  // }
  if (existingItem) {
    return {
      success: false,
      message: "Cette offre est déjà dans votre panier.",
      item: existingItem,
    };
  }

  const newItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      offerId,
      quantity: 1,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/service-requests");
  revalidatePath("/my-requests");

  return {
    success: true,
    message: "Offre ajoutée au panier.",
    item: newItem,
  };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const currentUser = await getCurrentDbUser();

  if (quantity < 1) {
    throw new Error("La quantité doit être au moins 1.");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      offer: {
        include: {
          booking: true,
        },
      },
    },
  });

  if (!cartItem) {
    throw new Error("Article du panier introuvable.");
  }

  if (cartItem.cart.userId !== currentUser.id && currentUser.role !== "ADMIN") {
    throw new Error("Action non autorisée.");
  }

  if (cartItem.offer.booking) {
    throw new Error("Impossible de modifier un item déjà réservé.");
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  revalidatePath("/cart");
  revalidatePath("/my-requests");

  return {
    success: true,
    message: "Quantité mise à jour.",
    item: updatedItem,
  };
}

export async function removeFromCart(itemId: string) {
  const currentUser = await getCurrentDbUser();

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      offer: {
        include: {
          booking: true,
        },
      },
    },
  });

  if (!cartItem) {
    throw new Error("Article du panier introuvable.");
  }

  if (cartItem.cart.userId !== currentUser.id && currentUser.role !== "ADMIN") {
    throw new Error("Action non autorisée.");
  }

  if (cartItem.offer.booking) {
    throw new Error("Impossible de supprimer un item déjà réservé.");
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/cart");
  revalidatePath("/my-requests");

  return {
    success: true,
    message: "Article supprimé du panier.",
  };
}

export async function clearCart() {
  const currentUser = await getCurrentDbUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: currentUser.id },
    include: {
      items: {
        include: {
          offer: {
            include: {
              booking: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      success: true,
      message: "Panier déjà vide.",
    };
  }

  const deletableItemIds = cart.items
    .filter((item) => !item.offer.booking)
    .map((item) => item.id);

  if (deletableItemIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        id: { in: deletableItemIds },
      },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/my-requests");

  return {
    success: true,
    message: "Panier vidé.",
  };
}

export async function confirmCart() {
  const currentUser = await getCurrentDbUser();

  if (currentUser.role !== "CLIENT" && currentUser.role !== "ADMIN") {
    throw new Error("Seul un client peut confirmer le panier.");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: currentUser.id },
    include: {
      items: {
        include: {
          offer: {
            include: {
              request: true,
              booking: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Panier vide.");
  }

  const validItems = cart.items.filter((item) => !item.offer.booking);

  if (validItems.length === 0) {
    throw new Error("Aucun article valide à confirmer.");
  }

  const createdBookings = await prisma.$transaction(async (tx) => {
    const bookings = [];

    for (const item of validItems) {
      const offer = item.offer;

      if (
        offer.request.clientId !== currentUser.id &&
        currentUser.role !== "ADMIN"
      ) {
        throw new Error("Action non autorisée sur une offre du panier.");
      }

      await tx.offer.update({
        where: { id: offer.id },
        data: { status: "ACCEPTED" },
      });

      await tx.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offer.id },
          status: { in: ["PENDING", "ACCEPTED"] },
        },
        data: { status: "REJECTED" },
      });

      await tx.serviceRequest.update({
        where: { id: offer.requestId },
        data: { status: "FILLED" },
      });

      const amountSubtotal = offer.price * item.quantity;
      const platformFee = Math.round(amountSubtotal * PLATFORM_FEE_RATE);
      const amountTotal = amountSubtotal + platformFee;

      const booking = await tx.booking.create({
        data: {
          requestId: offer.requestId,
          offerId: offer.id,
          status: "PENDING_PAYMENT",
          amountSubtotal,
          platformFee,
          amountTotal,
        },
      });

      bookings.push(booking);
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return bookings;
  });

  revalidatePath("/cart");
  revalidatePath("/my-requests");
  revalidatePath("/dashboard");
  revalidatePath("/service-requests");

  return {
    success: true,
    message: "Panier confirmé avec succès.",
    bookings: createdBookings,
  };
}
