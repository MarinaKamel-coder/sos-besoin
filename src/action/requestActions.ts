"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { 
    requestCreateSchema, 
    requestUpdateSchema, 
    ActionState, 
    RequestCreateInput, 
    RequestUpdateInput 
} from "../schemas/request";
import { auth } from "@clerk/nextjs/server";


export async function getRequestsAction(filters?: any) {
  return await prisma.serviceRequest.findMany({
    where: filters,
    include: { categories: { include: { category: true } }, _count: { select: { offers: true } } },
    orderBy: { createdAt: "desc" },
  });
}


export async function createRequestAction(
    prevState: any,
    formData: FormData
): Promise<ActionState<RequestCreateInput>> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Non authentifié" };

    const validated = requestCreateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) {
        return { 
            success: false, 
            message: "Erreur validation", 
            errors: validated.error.flatten().fieldErrors 
        };
    }

    // On sépare categoryId pour gérer la relation Prisma
    const { categoryId, ...requestData } = validated.data;

    try {
        await prisma.serviceRequest.create({
            data: {
                ...requestData,
                clientId: userId,
                // On crée l'entrée dans la table de jointure RequestCategory
                categories: {
                    create: [
                        { categoryId: categoryId }
                    ]
                }
            }
        });
        
        revalidatePath("/requests");
        return { success: true, message: "Demande publiée !" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Erreur lors de la création." };
    }
}

export async function updateRequestAction(
    prevState: any,
    formData: FormData
): Promise<ActionState<RequestUpdateInput>> {
    const validated = requestUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) {
        return { 
            success: false, 
            message: "Données invalides", 
            errors: validated.error.flatten().fieldErrors 
        };
    }

    const { id, version, categoryId, ...data } = validated.data;

    try {
        // Utilisation de transaction pour l'updateMany (verrouillage optimiste)
        const result = await prisma.serviceRequest.updateMany({
            where: { 
                id: id, 
                version: version 
            },
            data: { 
                ...data, 
                version: { increment: 1 } 
            }
        });

        if (result.count === 0) {
            return { success: false, message: "Conflit : La demande a été modifiée par ailleurs." };
        }

        // Si la catégorie a changé, on met à jour la table de jointure
        if (categoryId) {
            await prisma.requestCategory.deleteMany({ where: { requestId: id } });
            await prisma.requestCategory.create({
                data: { requestId: id, categoryId: categoryId }
            });
        }
        
        revalidatePath(`/requests/${id}`);
        return { success: true, message: "Mise à jour réussie !" };
    } catch (e) {
        return { success: false, message: "Erreur technique." };
    }
}


export async function deleteRequestAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Non autorisé" };

  try {
    // On vérifie que l'utilisateur est bien le propriétaire
    await prisma.serviceRequest.delete({
      where: { id, clientId: userId },
    });
    revalidatePath("/requests");
    return { success: true, message: "Demande supprimée" };
  } catch (e) {
    return { success: false, message: "Erreur lors de la suppression" };
  }
}