import { z } from "zod";

/**
 * Schéma de création d'une offre
 */
export const offerCreateSchema = z.object({
  price: z.coerce
    .number()
    .positive("Le prix doit être supérieur à 0")
    .max(10000, "Le prix est trop élevé"),
  
  message: z.string()
    .min(10, "Le message doit avoir au moins 10 caractères")
    .max(500, "Le message est trop long")
    .trim(),
    
  requestId: z.string().min(1, "L'identifiant de la demande est requis"),
});

export type OfferCreateInput = z.infer<typeof offerCreateSchema>;

/**
 * Schéma pour la mise à jour d'une offre (Verrouillage optimiste)
 */
export const offerUpdateSchema = offerCreateSchema.partial().extend({
  id: z.string().min(1, "L'identifiant de l'offre est requis"),
  version: z.coerce
    .number()
    .int()
    .nonnegative("La version est requise pour la transaction"),
});

export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;