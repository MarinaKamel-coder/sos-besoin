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
} from "../schemas/request";
import { auth } from "@clerk/nextjs/server";

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

export async function createRequestAction(
  prevState: unknown,
  formData: FormData,
): Promise<ActionState<RequestCreateInput>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié" };

  const validated = requestCreateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success) {
    return {
      success: false,
      message: "Erreur validation",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser)
    return { success: false, message: "Utilisateur introuvable en base." };

  const { categoryId, ...requestData } = validated.data;

  // Délègue à createRequestWithCategory (transactions.ts) au lieu de créer inline.
  // ANCIEN CODE (conservé pour référence) :
  // await prisma.serviceRequest.create({
  //   data: {
  //     ...requestData,
  //     clientId: dbUser.id,
  //     categories: { create: [{ categoryId }] },
  //   },
  // });
  const result = await createRequestWithCategory({
    clientId: dbUser.id,
    categoryId,
    request: requestData,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error ?? "Erreur lors de la création.",
    };
  }

  revalidatePath("/requests");
  return { success: true, message: "Demande publiée !" };
}

export async function updateRequestAction(
  prevState: unknown,
  formData: FormData,
): Promise<ActionState<RequestUpdateInput>> {
  const validated = requestUpdateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validated.success) {
    return {
      success: false,
      message: "Données invalides",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { id, version, categoryId, ...data } = validated.data;

  try {
    // Utilisation de transaction pour l'updateMany (verrouillage optimiste)
    const result = await prisma.serviceRequest.updateMany({
      where: {
        id: id,
        version: version,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Conflit : La demande a été modifiée par ailleurs.",
      };
    }

    // Si la catégorie a changé, on met à jour la table de jointure
    if (categoryId) {
      await prisma.requestCategory.deleteMany({ where: { requestId: id } });
      await prisma.requestCategory.create({
        data: { requestId: id, categoryId: categoryId },
      });
    }

    revalidatePath(`/requests/${id}`);
    return { success: true, message: "Mise à jour réussie !" };
  } catch {
    return { success: false, message: "Erreur technique." };
  }
}

export async function deleteRequestAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Non autorisé" };

  try {
    // Fix: résoudre l'id interne DB à partir du clerkId
    // (userId de Clerk ≠ clientId Prisma)
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { success: false, message: "Utilisateur introuvable." };

    // ANCIEN CODE (bug — clientId: userId utilisait le clerkId directement)
    // await prisma.serviceRequest.delete({
    //   where: { id, clientId: userId },
    // });

    await prisma.serviceRequest.delete({
      where: { id, clientId: dbUser.id },
    });
    revalidatePath("/requests");
    return { success: true, message: "Demande supprimée" };
  } catch {
    return { success: false, message: "Erreur lors de la suppression" };
  }
}
