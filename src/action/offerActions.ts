"use server";

import { revalidatePath } from "next/cache";
import prisma  from "../lib/prisma";
import { offerCreateSchema, offerUpdateSchema} from "../schemas/offer";
import { auth } from "@clerk/nextjs/server";


export async function getOffersByRequestAction(requestId: string) {
  return await prisma.offer.findMany({
    where: { requestId },
    include: { provider: { include: { profile: true } } },
    orderBy: { price: "asc" },
  });
}

export async function createOfferAction(prevState: any, formData: FormData) {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Non authentifie" };

    const validated = offerCreateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors };

    // Recuperer l'utilisateur interne depuis le clerkId
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return { success: false, message: "Utilisateur introuvable" };

    try {
        await prisma.offer.create({
            data: { ...validated.data, providerId: user.id }
        });
        revalidatePath(`/service-requests/${validated.data.requestId}`);
        return { success: true, message: "Offre envoyee !" };
    } catch (e: any) {
        // Erreur de contrainte unique (deja fait une offre)
        if (e?.code === "P2002") {
            return { success: false, message: "Vous avez deja fait une offre pour cette demande." };
        }
        return { success: false, message: "Erreur lors de la creation de l'offre." };
    }
}

export async function updateOfferAction(prevState: any, formData: FormData) {
    const validated = offerUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors };

    const { id, version, ...data } = validated.data;

    try {
        const result = await prisma.offer.updateMany({
            where: { id, version },
            data: { ...data, version: { increment: 1 } }
        });

        if (result.count === 0) return { success: false, message: "L'offre a été modifiée ou acceptée entre-temps." };
        
        return { success: true, message: "Offre modifiée." };
    } catch (e) {
        return { success: false, message: "Erreur lors de la modification." };
    }
}



export async function deleteOfferAction(id: string, version: number) {
  const { userId } = await auth();
  try {
    const result = await prisma.offer.deleteMany({
      where: { id, providerId: userId!, version }, // Verrouillage optimiste même à la suppression
    });
    if (result.count === 0) throw new Error("Conflit ou non autorisé");
    
    revalidatePath("/dashboard/offers");
    return { success: true, message: "Offre retirée" };
  } catch (e) {
    return { success: false, message: "Impossible de supprimer l'offre" };
  }
}