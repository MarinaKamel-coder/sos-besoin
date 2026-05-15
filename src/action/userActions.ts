"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { profileUpdateSchema, ProfileUpdateInput } from "../schemas/user"; 
import { auth } from "@clerk/nextjs/server";
import DOMPurify from "isomorphic-dompurify";

/**
 * Type d'état pour les retours d'action (B.1)
 */
export type ActionState<T> = {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export async function getMyProfileAction() {
  const { userId } = await auth();
  if (!userId) return null;

  return await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });
}

/**
 * Met à jour le profil (Validation & Sanitisation)
 */
export async function updateProfileAction(
  prevState: any, 
  formData: FormData
): Promise<ActionState<ProfileUpdateInput>> {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        return { success: false, message: "Votre session a expiré. Veuillez vous reconnecter." };
    }

    const validated = profileUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    
    // B.1 Validation Zod avec retour d'erreurs précis
    if (!validated.success) {
        return { 
            success: false, 
            message: "Veuillez corriger les erreurs dans le formulaire.",
            errors: validated.error.flatten().fieldErrors 
        };
    }

    // Récupérer l'ID interne de l'utilisateur
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) return { success: false, message: "Utilisateur introuvable." };

    try {
        // B.1 Sanitisation des données (Bio, etc.) pour prévenir XSS
        const sanitizedData = {
            ...validated.data,
            bio: validated.data.bio ? DOMPurify.sanitize(validated.data.bio) : undefined,
        };

        await prisma.profile.upsert({
            where: { userId: dbUser.id },
            update: sanitizedData,
            create: { ...sanitizedData, userId: dbUser.id }
        });
        
        revalidatePath("/profile");
        return { success: true, message: "Profil mis à jour avec succès." };
    } catch (e) {
        console.error("[PROFILE_UPDATE_ERROR]", e);
        // B.1 Message d'erreur générique pour la sécurité
        return { success: false, message: "Une erreur technique est survenue lors de la sauvegarde." };
    }
}

/**
 * Supprime le compte de l'utilisateur (B.2 - Contrôle d'accès)
 */
export async function deleteAccountAction() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non autorisé" };

  try {
    // La suppression en cascade dans Prisma s'occupera du profil associé
    await prisma.user.delete({ 
        where: { clerkId } 
    });
    
    return { success: true, message: "Votre compte et vos données ont été supprimés." };
  } catch (e) {
    console.error("[DELETE_ACCOUNT_ERROR]", e);
    return { success: false, message: "Impossible de supprimer le compte pour le moment." };
  }
}