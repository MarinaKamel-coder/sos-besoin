import { z } from 'zod';

/**
 * Schéma pour la mise à jour du profil utilisateur
 */
export const profileUpdateSchema = z.object({
    name: z.string()
        .min(2, "Le nom doit avoir au moins 2 caractères")
        .max(50)
        .regex(/^[a-zA-Z\sÀ-ÿ\-]+$/, "Nom invalide") 
        .optional()
        .or(z.literal("")),
    bio: z.string()
        .max(500, "La bio ne peut pas dépasser 500 caractères")
        .optional()
        .or(z.literal("")),
    city: z.string()
        .min(2, "Nom de ville invalide")
        .max(50)
        .optional()
        .or(z.literal("")),
    phone: z.string()
        .regex(/^[0-9+\s-]{10,15}$/, "Numéro de téléphone invalide")
        .optional()
        .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Schéma pour le changement de rôle (Admin seulement)
 */
export const userRoleSchema = z.object({
    userId: z.string().cuid(),
    role: z.enum(["CLIENT", "PROVIDER", "ADMIN"]),
});