"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { offerCreateSchema, offerUpdateSchema } from "../schemas/offer";
import { requestIdSchema } from "../schemas/request";
import { auth } from "@clerk/nextjs/server";
import DOMPurify from "isomorphic-dompurify";

/**
 * Récupère les offres pour une demande spécifique
 * Validation de l'ID en entrée
 */
export async function getOffersByRequestAction(requestId: string) {
  try {
    requestIdSchema.parse(requestId);
    return await prisma.offer.findMany({
      where: { requestId },
      include: { provider: { include: { profile: true } } },
      orderBy: { price: "asc" },
    });
  } catch {
    return [];
  }
}

/**
 * Crée une nouvelle offre
 * Validation Zod + Sanitisation XSS
 */
export async function createOfferAction(
  prevState: unknown,
  formData: FormData,
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié" };

  const rawData = Object.fromEntries(formData.entries());
  const validated = offerCreateSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  // B.1 Sanitisation du message contre les injections XSS
  const sanitizedMessage = DOMPurify.sanitize(validated.data.message);

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return { success: false, message: "Profil utilisateur introuvable" };

  try {
    await prisma.offer.create({
      data: {
        ...validated.data,
        message: sanitizedMessage,
        providerId: user.id,
      },
    });

    revalidatePath(`/service-requests/${validated.data.requestId}`);
    return { success: true, message: "Offre envoyée avec succès !" };
  } catch (e) {
    console.error("[CREATE_OFFER_ERROR]", e);
    // Erreur de contrainte unique (P2002 : l'utilisateur a déjà fait une offre)
    if (e instanceof Error && (e as { code?: string }).code === "P2002") {
      return {
        success: false,
        message: "Vous avez déjà soumis une offre pour cette demande.",
      };
    }
    return { success: false, message: "Une erreur technique est survenue." };
  }
}

/**
 * Modifie une offre existante
 * Verrouillage optimiste + Validation
 */
export async function updateOfferAction(
  prevState: unknown,
  formData: FormData,
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié" };

  const validated = offerUpdateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const { id, version, message, ...data } = validated.data;

  // Sanitisation si le message est présent
  const sanitizedMessage = message ? DOMPurify.sanitize(message) : undefined;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return { success: false, message: "Action non autorisée" };

  try {
    const result = await prisma.offer.updateMany({
      where: {
        id,
        version,
        providerId: user.id, // Vérification de propriété
      },
      data: {
        ...data,
        ...(sanitizedMessage && { message: sanitizedMessage }),
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        message:
          "L'offre a été modifiée ou acceptée par le client entre-temps.",
      };
    }

    revalidatePath("/dashboard/offers");
    return { success: true, message: "Offre mise à jour." };
  } catch {
    return { success: false, message: "Impossible de modifier l'offre." };
  }
}

/**
 * Supprime une offre
 * Contrôle d'accès strict
 */
export async function deleteOfferAction(id: string, version: number) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non autorisé" };

  try {
    // Validation des types
    requestIdSchema.parse(id);

    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) throw new Error("User not found");

    const result = await prisma.offer.deleteMany({
      where: {
        id,
        providerId: dbUser.id, // S'assurer que c'est bien l'auteur qui supprime
        version,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Conflit de version ou action non autorisée.",
      };
    }

    revalidatePath("/dashboard/offers");
    return { success: true, message: "Offre retirée avec succès." };
  } catch (e) {
    console.error("[DELETE_OFFER_ERROR]", e);
    return { success: false, message: "Erreur lors du retrait de l'offre." };
  }
}
