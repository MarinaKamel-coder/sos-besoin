"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/src/generated/prisma/client";
import { requestIdSchema } from "../schemas/request";

export async function updateUserRoleAction(targetUserId: string, newRole: Role) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Non authentifié." };

    const currentUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { success: false, message: "Action non autorisée." };
    }

    // Protection : On empêche l'admin de s'auto-rétrograder accidentellement
    if (currentUser.id === targetUserId && newRole !== "ADMIN") {
      return { success: false, message: "Vous ne pouvez pas révoquer votre propre rôle d'administrateur." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    const previousRole = targetUser.role;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(targetUser.clerkId);
      const publicMetadata = { ...(clerkUser.publicMetadata ?? {}), role: newRole };

      await client.users.updateUser(targetUser.clerkId, {
        publicMetadata,
      });
    } catch (clerkError) {
      console.error("Erreur Clerk role sync:", clerkError);
      if (previousRole !== newRole) {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { role: previousRole },
        });
      }
      return { success: false, message: "Impossible de synchroniser le rôle avec Clerk." };
    }

    await prisma.adminAction.create({
      data: {
        adminId: currentUser.id,
        action: `Rôle mis à jour pour ${targetUser.email} → ${newRole}`,
      },
    });

    revalidatePath("/admin");

    return { success: true, message: "Rôle mis à jour avec succès." };
  } catch (error) {
    console.error("Erreur adminActions:", error);
    return { success: false, message: "Une erreur système est survenue." };
  }
}

export async function deleteRequestAsAdminAction(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié." };

  const currentUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Action non autorisée." };
  }

  try {
    requestIdSchema.parse(id);

    await prisma.serviceRequest.delete({ where: { id } });
    await prisma.adminAction.create({
      data: {
        adminId: currentUser.id,
        action: `Demande supprimée (id: ${id})`,
      },
    });

    revalidatePath("/admin/service-requests");
    return { success: true, message: "Demande supprimée avec succès." };
  } catch (error) {
    console.error("[DELETE_REQUEST_ADMIN_ERROR]", error);
    return { success: false, message: "Impossible de supprimer la demande." };
  }
}

export async function deleteOfferAsAdminAction(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Non authentifié." };

  const currentUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { success: false, message: "Action non autorisée." };
  }

  try {
    requestIdSchema.parse(id);

    const result = await prisma.offer.deleteMany({ where: { id } });
    if (result.count === 0) {
      return { success: false, message: "Offre introuvable." };
    }

    await prisma.adminAction.create({
      data: {
        adminId: currentUser.id,
        action: `Offre supprimée (id: ${id})`,
      },
    });

    revalidatePath("/admin/offers");
    return { success: true, message: "Offre supprimée avec succès." };
  } catch (error) {
    console.error("[DELETE_OFFER_ADMIN_ERROR]", error);
    return { success: false, message: "Impossible de supprimer l'offre." };
  }
}