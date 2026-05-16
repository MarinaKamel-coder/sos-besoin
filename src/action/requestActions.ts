"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { createRequestWithCategory } from "../lib/transactions";
import {
  requestCreateSchema,
  requestUpdateSchema,
  ActionState,
  RequestCreateInput,
  RequestUpdateInput,
  requestIdSchema,
} from "../schemas/request";
import { auth } from "@clerk/nextjs/server";
import DOMPurify from "isomorphic-dompurify";

/**
 * Récupère les demandes avec filtres
 */
export async function getRequestsAction(
  filters?: Prisma.ServiceRequestWhereInput,
) {
  return await prisma.serviceRequest.findMany({
    where: filters,
    include: {
      categories: { include: { category: true } },
      _count: { select: { offers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Crée une demande (Validation, Sanitisation, Injection SQL)
 */
export async function createRequestAction(
  prevState: unknown,
  formData: FormData,
): Promise<ActionState<RequestCreateInput>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { success: false, message: "Utilisateur introuvable." };

  // CLIENT, PRESTATAIRE (peut aussi publier une demande) ou ADMIN
  if (
    dbUser.role !== "CLIENT" &&
    dbUser.role !== "PROVIDER" &&
    dbUser.role !== "ADMIN"
  ) {
    return {
      success: false,
      message: "Vous ne pouvez pas créer de demande avec ce profil.",
    };
  }

  let categoryId = formData.get("categoryId") as string;
  const newCategoryName = formData.get("newCategoryName") as string;

  // Gestion sécurisée de la catégorie "Autre"
  if (categoryId === "autre") {
    if (!newCategoryName || newCategoryName.trim() === "") {
      return {
        success: false,
        message: "Veuillez entrer un nom pour la catégorie.",
      };
    }

    // B.1 Nettoyage du nom de catégorie (Anti-Injection/XSS)
    const cleanCategoryName = DOMPurify.sanitize(newCategoryName.trim());
    const slug = cleanCategoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cleanCategoryName, slug },
    });
    categoryId = category.id;
  }

  // Reconstruction du FormData pour validation Zod
  const rawEntries = Object.fromEntries(formData.entries());
  const validated = requestCreateSchema.safeParse({
    ...rawEntries,
    categoryId,
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Erreur de validation",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Sanitisation des champs textes riches
  const sanitizedData = {
    ...validated.data,
    title: DOMPurify.sanitize(validated.data.title),
    description: DOMPurify.sanitize(validated.data.description),
  };

  const { categoryId: validatedCategoryId, ...requestData } = sanitizedData;

  //Utilisation d'une transaction pour l'intégrité
  const result = await createRequestWithCategory({
    clientId: dbUser.id,
    categoryId: validatedCategoryId,
    request: requestData,
  });

  if (!result.success) {
    return { success: false, message: "Échec de la publication." };
  }

  revalidatePath("/requests");
  return { success: true, message: "Demande publiée !" };
}

/**
 * Met à jour une demande (Verrouillage optimiste)
 */
export async function updateRequestAction(
  prevState: unknown,
  formData: FormData,
): Promise<ActionState<RequestUpdateInput>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { success: false, message: "Action non autorisée." };

  const validated = requestUpdateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success) {
    return {
      success: false,
      message: "Données invalides", // Ajoute cette ligne
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { id, version, categoryId, ...data } = validated.data;

  try {
    // Vérification que l'utilisateur est bien le propriétaire (clientId: dbUser.id)
    // Verrouillage optimiste via 'version'
    const result = await prisma.serviceRequest.updateMany({
      where: {
        id,
        version,
        clientId: dbUser.id,
      },
      data: {
        ...data,
        title: data.title ? DOMPurify.sanitize(data.title) : undefined,
        description: data.description
          ? DOMPurify.sanitize(data.description)
          : undefined,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Conflit de modification ou accès refusé.",
      };
    }

    // Mettre à jour la catégorie si elle a changé
    if (categoryId) {
      await prisma.requestCategory.deleteMany({ where: { requestId: id } });
      await prisma.requestCategory.create({
        data: { requestId: id, categoryId },
      });
    }

    revalidatePath(`/service-requests/${id}`);
    return { success: true, message: "Mise à jour réussie !" };
  } catch (e) {
    console.error("[UPDATE_REQUEST_ERROR]", e);
    return { success: false, message: "Une erreur technique est survenue." };
  }
}

/**
 * Supprime une demande (Contrôle d'accès strict)
 */
export async function deleteRequestAction(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non autorisé" };

  try {
    // Validation du format de l'ID
    requestIdSchema.parse(id);

    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) return { success: false, message: "Utilisateur introuvable." };

    // Suppression sécurisée : l'ID de l'utilisateur doit correspondre au clientId
    await prisma.serviceRequest.delete({
      where: {
        id,
        clientId: dbUser.id,
      },
    });

    revalidatePath("/requests");
    return { success: true, message: "Demande supprimée avec succès." };
  } catch (e) {
    console.error("[DELETE_REQUEST_ERROR]", e);
    return { success: false, message: "Impossible de supprimer la demande." };
  }
}
