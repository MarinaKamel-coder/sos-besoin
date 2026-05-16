"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { requestIdSchema } from "../schemas/request";
import prisma from "../lib/prisma";
import { Prisma, Booking } from "../generated/prisma/client";

const PLATFORM_FEE_RATE = 0.1;

// Définition d'un type strict pour les éléments récupérés du panier avec leurs inclusions
type CartItemWithDetails = Prisma.CartItemGetPayload<{
  include: {
    offer: {
      include: {
        request: true;
        booking: true;
      };
    };
  };
}>;

// --- UTILS ---
async function getCurrentDbUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Non authentifié");

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

// --- ACTIONS DE LECTURE (GETTERS) ---

/**
 * Récupère le nombre total d'articles dans le panier
 */
export async function getCartCount(): Promise<number> {
  try {
    const currentUser = await getCurrentDbUser();

    const cart = await prisma.cart.findUnique({
      where: { userId: currentUser.id },
      include: { items: true },
    });

    if (!cart) return 0;

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("[GET_CART_COUNT_ERROR]", error);
    return 0;
  }
}

// --- ACTIONS DE MUTATION ---

export async function addToCart(offerId: string) {
  try {
    //  Validation stricte
    requestIdSchema.parse(offerId);

    const currentUser = await getCurrentDbUser();
    if (currentUser.role !== "CLIENT" && currentUser.role !== "ADMIN") {
      return { success: false, message: "Action non autorisée." };
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { request: true, booking: true },
    });

    if (!offer || offer.booking || offer.request.clientId !== currentUser.id) {
      return { success: false, message: "Cette offre n'est plus disponible." };
    }

    const cart = await prisma.cart.upsert({
      where: { userId: currentUser.id },
      update: {},
      create: { userId: currentUser.id },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_offerId: { cartId: cart.id, offerId } },
    });

    if (existingItem) {
      return { success: false, message: "L'offre est déjà au panier." };
    }

    await prisma.cartItem.create({
      data: { cartId: cart.id, offerId, quantity: 1 },
    });

    revalidatePath("/cart");
    return { success: true, message: "Offre ajoutée avec succès." };
  } catch (error) {
    console.error("[ADD_TO_CART_ERROR]", error); // Log sécurité
    return { success: false, message: "Une erreur technique est survenue." }; // Message générique
  }
}

export async function removeFromCart(itemId: string) {
  try {
    //  Validation stricte de l'ID
    requestIdSchema.parse(itemId);
    const currentUser = await getCurrentDbUser();

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || (cartItem.cart.userId !== currentUser.id && currentUser.role !== "ADMIN")) {
      return { success: false, message: "Article introuvable." };
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    revalidatePath("/cart");
    return { success: true, message: "Article retiré du panier." };
  } catch (error) {
    return { success: false, message: "Impossible de modifier le panier." };
  }
}

export async function confirmCart(): Promise<{ success: boolean; message: string; bookings?: Booking[] }> {
  try {
    const currentUser = await getCurrentDbUser();
    
    const cart = await prisma.cart.findUnique({
      where: { userId: currentUser.id },
      include: { items: { include: { offer: { include: { request: true, booking: true } } } } },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Le panier est vide." };
    }

    // Typage explicite du paramètre 'item' pour enlever le 'any' implicite
    const validItems = (cart.items as CartItemWithDetails[]).filter(
      (item: CartItemWithDetails) => !item.offer.booking
    );

    //  Transaction pour garantir l'atomicité
    const createdBookings = await prisma.$transaction(async (tx) => {
      const bookings = [];
      for (const item of validItems) {
        const offer = item.offer;
        
        // Double vérification de sécurité (Access Control)
        if (offer.request.clientId !== currentUser.id && currentUser.role !== "ADMIN") {
          throw new Error("Unauthorized");
        }

        await tx.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
        await tx.offer.updateMany({
          where: { requestId: offer.requestId, id: { not: offer.id } },
          data: { status: "REJECTED" },
        });
        await tx.serviceRequest.update({ where: { id: offer.requestId }, data: { status: "FILLED" } });

        const amountSubtotal = offer.price * item.quantity;
        const platformFee = Math.round(amountSubtotal * PLATFORM_FEE_RATE);

        const booking = await tx.booking.create({
          data: {
            requestId: offer.requestId,
            offerId: offer.id,
            status: "PENDING_PAYMENT",
            amountSubtotal,
            platformFee,
            amountTotal: amountSubtotal + platformFee,
          },
        });
        bookings.push(booking);
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return bookings;
    });

    revalidatePath("/cart");
    revalidatePath("/dashboard");
    return { success: true, message: "Panier confirmé.", bookings: createdBookings };
  } catch (error) {
    console.error("[CONFIRM_CART_ERROR]", error);
    return { success: false, message: "Échec de la confirmation du panier." };
  }
}