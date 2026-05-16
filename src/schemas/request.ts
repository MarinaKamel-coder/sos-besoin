import { z } from 'zod';


export const requestListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum([
    "neededAt:asc", 
    "neededAt:desc", 
    "createdAt:asc", 
    "createdAt:desc", 
    "title:asc"
  ]).default("createdAt:desc"),
  q: z.string().min(1).max(100).optional(),
});

export type RequestListQuery = z.infer<typeof requestListQuerySchema>;

/**
 * Schéma de création d'une nouvelle demande de service
 */
export const requestCreateSchema = z.object({
  title: z.string()
    .min(5, "Le titre doit avoir au moins 5 caractères")
    .max(100, "Le titre est trop long")
    .regex(/^[a-zA-Z0-9\sÀ-ÿ\-]+$/, "Le titre contient des caractères interdits"), // Validation stricte 
  
  description: z.string()
    .min(5, "La description doit avoir au moins 5 caractères")
    .max(1000, "La description est trop longue")
    .trim(), // Supprime les espaces inutiles en début/fin

  neededAt: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
    z.date({ message: "Veuillez fournir une date valide" })
  ).refine((date) => date > new Date(), {
    message: "La date prévue doit être dans le futur",
  }),

  location: z.string()
    .min(2, "La localisation est obligatoire")
    .max(100, "Nom de lieu trop long")
    .regex(/^[a-zA-Z\s\-]+$/, "Format de localisation invalide") // Regex pour bloquer les scripts 
    .trim(),

  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

export type RequestCreateInput = z.infer<typeof requestCreateSchema>;

/**
 * Schéma pour valider un ID de demande (Format CUID)
 */
export const requestIdSchema = z.string().cuid("Format d'identifiant invalide");

/**
 * Schéma pour la mise à jour (Update) avec Verrouillage Optimiste
 * On réutilise les champs de création en les rendant optionnels (.partial())
 * et on force la présence de l'ID et de la VERSION.
 */
export const requestUpdateSchema = requestCreateSchema.partial().extend({
  id: z.string().min(1, "L'identifiant est requis"),
  version: z.coerce.number().int().nonnegative("La version est requise pour la transaction"),
});

export type RequestUpdateInput = z.infer<typeof requestUpdateSchema>;

/**
 * Type générique pour l'état des Server Actions (utilisé avec useActionState)
 */
export type ActionState<T> = {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  data?: T;
};