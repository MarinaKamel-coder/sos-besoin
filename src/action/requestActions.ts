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

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser)
    return { success: false, message: "Utilisateur introuvable en base." };

  // Gérer la nouvelle catégorie "Autre"
  let categoryId = formData.get("categoryId") as string;
  const newCategoryName = formData.get("newCategoryName") as string;

  if (categoryId === "autre") {
    if (!newCategoryName || newCategoryName.trim() === "") {
      return {
        success: false,
        message: "Veuillez entrer un nom pour la nouvelle catégorie.",
      };
    }
    // Créer le slug à partir du nom
    const slug = newCategoryName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Créer ou récupérer la catégorie
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: newCategoryName.trim(), slug },
    });
    categoryId = category.id;
  }

  // Remplacer categoryId dans formData
  const updatedFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key !== "categoryId" && key !== "newCategoryName") {
      updatedFormData.append(key, value);
    }
  }
  updatedFormData.append("categoryId", categoryId);

  const validated = requestCreateSchema.safeParse(
    Object.fromEntries(updatedFormData.entries()),
  );
  if (!validated.success) {
    return {
      success: false,
      message: "Erreur validation",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { categoryId: validatedCategoryId, ...requestData } = validated.data;

  const result = await createRequestWithCategory({
    clientId: dbUser.id,
    categoryId: validatedCategoryId,
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
  // Gérer la nouvelle catégorie "Autre"
  let categoryId = formData.get("categoryId") as string;
  const newCategoryName = formData.get("newCategoryName") as string;

  if (categoryId === "autre") {
    if (!newCategoryName || newCategoryName.trim() === "") {
      return {
        success: false,
        message: "Veuillez entrer un nom pour la nouvelle catégorie.",
      };
    }
    const slug = newCategoryName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: newCategoryName.trim(), slug },
    });
    categoryId = category.id;
  }

  const updatedFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key !== "categoryId" && key !== "newCategoryName") {
      updatedFormData.append(key, value);
    }
  }
  updatedFormData.append("categoryId", categoryId);

  const validated = requestUpdateSchema.safeParse(
    Object.fromEntries(updatedFormData.entries()),
  );
  if (!validated.success) {
    return {
      success: false,
      message: "Données invalides",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { id, version, categoryId: validatedCategoryId, ...data } = validated.data;

  try {
    const result = await prisma.serviceRequest.updateMany({
      where: { id, version },
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

    if (validatedCategoryId) {
      await prisma.requestCategory.deleteMany({ where: { requestId: id } });
      await prisma.requestCategory.create({
        data: { requestId: id, categoryId: validatedCategoryId },
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
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { success: false, message: "Utilisateur introuvable." };

    await prisma.serviceRequest.delete({
      where: { id, clientId: dbUser.id },
    });
    revalidatePath("/requests");
    return { success: true, message: "Demande supprimée" };
  } catch {
    return { success: false, message: "Erreur lors de la suppression" };
  }
}
