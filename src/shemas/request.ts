import { z } from "zod";

/**
 * Schéma de base pour une demande de service (ServiceRequest)
 */
export const serviceRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100, "Le titre est trop long (max 100)"),
  
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(1000, "La description est trop longue"),

  neededAt: z
    .preprocess(
      (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
      z.date({ 
        message: "La date doit être valide"
      })
    )
    .refine((date) => date > new Date(), {
      message: "La date doit être dans le futur",
    }),

  location: z
    .string()
    .trim()
    .min(2, "Le lieu est obligatoire")
    .optional()
    .or(z.literal("")),

  // ID de la catégorie sélectionnée dans le formulaire
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

/**
 * Schéma pour la mise à jour (Update)
 */
export const updateServiceRequestSchema = serviceRequestSchema.partial().extend({
  id: z.string().cuid("ID invalide"),
  version: z.coerce.number({
    message: "La version est requise pour la mise à jour"
  }),
});

// --- Types inférés pour TypeScript ---

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;

/**
 * Type générique pour le retour des Server Actions (ActionState)
 */
export type ActionState<T> = {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  data?: T;
};