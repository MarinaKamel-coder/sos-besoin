"use server";

import { revalidatePath } from "next/cache";
import prisma  from "../lib/prisma";
import { profileUpdateSchema } from "../schemas/user";
import { auth } from "@clerk/nextjs/server";


export async function getMyProfileAction() {
  const { userId } = await auth();
  if (!userId) return null;

  return await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });
}

export async function updateProfileAction(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Session expirée" };

    const validated = profileUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors };

    try {
        await prisma.profile.upsert({
            where: { userId },
            update: validated.data,
            create: { ...validated.data, userId }
        });
        
        revalidatePath("/profile");
        return { success: true, message: "Profil mis à jour avec succès." };
    } catch (e) {
        return { success: false, message: "Erreur lors de la sauvegarde du profil." };
    }
}


export async function deleteAccountAction() {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    await prisma.user.delete({ where: { clerkId: userId } });
    return { success: true, message: "Compte supprimé" };
  } catch (e) {
    return { success: false, message: "Erreur lors de la suppression du compte" };
  }
}