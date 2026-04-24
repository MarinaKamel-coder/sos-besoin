import { z } from 'zod';

export const offerCreateSchema = z.object({
    price: z.coerce.number().int().positive("Le prix doit être supérieur à 0"),
    message: z.string().min(10, "Expliquez votre expertise en au moins 10 caractères").max(500),
    requestId: z.string().cuid(),
});

export type OfferCreateInput = z.infer<typeof offerCreateSchema>;

export const offerUpdateSchema = offerCreateSchema.partial().extend({
    id: z.string().min(1),
    version: z.coerce.number().int().nonnegative(),
});

export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;