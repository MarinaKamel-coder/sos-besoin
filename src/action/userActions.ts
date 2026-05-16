"use server";

import { revalidatePath } from "next/cache";
import prisma from "../lib/prisma";
import { profileUpdateSchema, ProfileUpdateInput } from "../schemas/user"; 
import { auth, clerkClient } from "@clerk/nextjs/server";
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

/** Rôle brut depuis le JWT de session (souvent sans unsafeMetadata). */
function roleFromSessionClaims(sessionClaims: Record<string, unknown> | null | undefined) {
  const claims = sessionClaims as Record<string, any> | undefined;
  if (!claims) return undefined;

  const metadata = claims.metadata;
  const publicMetadata = claims.publicMetadata;
  const orgMetadata = claims.org_metadata;

  if (metadata?.role != null && metadata.role !== "") return String(metadata.role);
  if (publicMetadata?.role != null && publicMetadata.role !== "")
    return String(publicMetadata.role);
  if (orgMetadata?.role != null && orgMetadata.role !== "") return String(orgMetadata.role);
  if (claims.role != null && claims.role !== "") return String(claims.role);

  return undefined;
}

function normalizeClerkRoleToPrisma(raw: string) {
  const upper = raw.toUpperCase();
  if (upper === "PROVIDER") return "PROVIDER";
  if (upper === "ADMIN") return "ADMIN";
  return "CLIENT";
}

/** Source fiable : l’objet utilisateur Clerk (inclut unsafeMetadata après inscription). */
async function roleFromClerkApi(userId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const pm = clerkUser.publicMetadata as { role?: unknown };
  const um = clerkUser.unsafeMetadata as { role?: unknown };

  if (pm?.role != null && pm.role !== "") return String(pm.role);
  if (um?.role != null && um.role !== "") return String(um.role);

  return undefined;
}

/**
 * Synchronise le rôle depuis les métadonnées Clerk vers la BD
 * Appelée lors de la première connexion ou page load
 */
export async function syncUserRoleFromClerk() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { success: false, message: "Non authentifié" };
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const fromClaims = roleFromSessionClaims(sessionClaims);
    let fromClerk: string | undefined;

    if (!user) {
      fromClerk = fromClaims ?? (await roleFromClerkApi(userId));
      const rawRole = fromClerk ?? "CLIENT";
      const roleToSet = normalizeClerkRoleToPrisma(rawRole);

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: sessionClaims?.email || "unknown@email.com",
          name: sessionClaims?.name || null,
          role: roleToSet,
        },
      });

      return { success: true, message: "Utilisateur créé", role: roleToSet };
    }

    // Utilisateur existant : ne pas forcer CLIENT si le JWT ne contient pas les métadonnées
    fromClerk = fromClaims ?? (await roleFromClerkApi(userId));

    if (fromClerk === undefined) {
      return { success: true, message: "Utilisateur synchronisé", role: user.role };
    }

    const roleToSet = normalizeClerkRoleToPrisma(fromClerk);

    if (user.role === "ADMIN" && roleToSet !== "ADMIN") {
      return { success: true, message: "Rôle admin préservé", role: user.role };
    }

    if (user.role !== roleToSet) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: roleToSet },
      });
      return { success: true, message: "Rôle synchronisé", role: roleToSet };
    }

    return { success: true, message: "Utilisateur synchronisé", role: user.role };
  } catch (error) {
    console.error("[SYNC_ROLE_ERROR]", error);
    return { success: false, message: "Erreur lors de la synchronisation" };
  }
}