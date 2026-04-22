"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  serviceRequestSchema, 
  ActionState, 
  ServiceRequestInput, 
  updateServiceRequestSchema, 
  UpdateServiceRequestInput 
} from "../shemas/request";
import { createRequestWithCategory } from "../lib/transactions"; 
import prisma from "../lib/prisma";

/**
 * Action pour créer une demande de service
 */
export async function createRequestAction(
  prevState: any,
  formData: FormData
): Promise<ActionState<ServiceRequestInput>> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, message: "Vous devez être connecté pour créer une demande." };
  }

  // 1. Extraction des données
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    neededAt: formData.get("neededAt"),
    location: formData.get("location"),
    categoryId: formData.get("categoryId"),
  };

  // 2. Validation Zod
  const validatedFields = serviceRequestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Veuillez corriger les erreurs dans le formulaire.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 3. Logique métier avec transaction
  try {
    const result = await createRequestWithCategory({
      clientId: userId, 
      category: { 
        name: "Service général", 
        slug: "general" 
      }, 
      request: validatedFields.data,
    });

    if (!result.success) {
      return {
        success: false,
        message: "Erreur lors de la création en base de données.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Une erreur inattendue est survenue.",
    };
  }

  // 4. Finalisation
  revalidatePath("/requests");
  redirect("/requests");
}

/**
 * Action pour mettre à jour une demande avec Verrou Optimiste
 */
export async function updateRequestAction(
  prevState: any,
  formData: FormData
): Promise<ActionState<UpdateServiceRequestInput>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, message: "Authentification requise." };
  }

  // 1. Extraction
  const rawData = {
    id: formData.get("id"),
    version: formData.get("version"),
    title: formData.get("title"),
    description: formData.get("description"),
    neededAt: formData.get("neededAt"),
    location: formData.get("location"),
  };

  // 2. Validation Zod
  const validatedFields = updateServiceRequestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Données invalides.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, version, ...updateData } = validatedFields.data;

  try {
    // 3. Vérification de propriété + Verrou Optimiste
    // On s'assure que le clientId correspond à l'utilisateur connecté
    const updated = await prisma.serviceRequest.updateMany({
      where: {
        id: id,
        clientId: userId, // Sécurité : seul le propriétaire peut modifier
        version: version, // Verrou optimiste
      },
      data: {
        ...updateData,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      return {
        success: false,
        message: "Échec de la mise à jour : soit la demande n'existe pas, soit elle a été modifiée par ailleurs, soit vous n'êtes pas le propriétaire.",
      };
    }

    revalidatePath(`/requests/${id}`);
    return {
      success: true,
      message: "Demande mise à jour avec succès !",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur technique lors de la mise à jour.",
    };
  }
}

/**
 * Action pour supprimer une demande de service
 */
export async function deleteRequestAction(
  id: string
): Promise<ActionState<any>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, message: "Authentification requise." };
  }

  try {
    // 1. Vérification d'existence, de propriété et de dépendances
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { _count: { select: { offers: true } } }
    });

    if (!request) {
      return { success: false, message: "Demande introuvable." };
    }

    if (request.clientId !== userId) {
      return { success: false, message: "Vous n'avez pas l'autorisation de supprimer cette demande." };
    }

    if (request._count.offers > 0) {
      return { success: false, message: "Action impossible : cette demande a déjà des offres actives." };
    }

    // 2. Suppression
    await prisma.serviceRequest.delete({
      where: { id },
    });

    revalidatePath("/requests");
    return { success: true, message: "Supprimé avec succès." };

  } catch (error) {
    return { success: false, message: "Erreur lors de la suppression." };
  }
}