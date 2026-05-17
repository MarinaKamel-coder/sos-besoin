'use server';

import { redirect } from 'next/navigation';
import stripe from '../lib/stripe';
import prisma from '../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function createCheckoutSession() {
    const { userId } = await auth();
    if (!userId) throw new Error('Non authentifié');

    // 1. Récupérer l'utilisateur et son panier complet
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }, 
        include: {
            cart: {
                include: {
                    items: {
                        include: {
                            offer: {
                                include: { request: true }
                            }, 
                        },       
                    },
                },
            },
        },
    });

    if (!user?.cart || user.cart.items.length === 0) {
        throw new Error('Panier vide');
    }

    // 2. Vérifications de sécurité
    const firstItem = user.cart.items[0]; // On prend le premier item du panier pour l'exemple
    if (!firstItem) throw new Error('Aucun article trouvé');

    for (const item of user.cart.items) {
        const offer = item.offer as { request: { clientId: string }; providerId: string };
        if (offer.request.clientId !== user.id) {
            throw new Error('Vous ne pouvez payer que pour vos propres demandes');
        }
        if (offer.providerId === user.id) {
            throw new Error('Vous ne pouvez pas payer votre propre offre');
        }
    }

    // 3. Récupérer l'offre et créer le Booking en statut d'attente dans ta DB
    const offer = firstItem.offer;
    const PLATFORM_FEE_RATE = 0.1;
    const amountSubtotal = offer.price * firstItem.quantity;
    const platformFee = Math.round(amountSubtotal * PLATFORM_FEE_RATE);
    const amountTotal = amountSubtotal + platformFee;

    // On crée ou récupère un booking existant pour cette offre pour éviter les doublons
    let booking = await prisma.booking.findFirst({
        where: { offerId: offer.id, requestId: offer.requestId }
    });

    if (!booking) {
        booking = await prisma.booking.create({
            data: {
                requestId: offer.requestId,
                offerId: offer.id,
                status: 'PENDING_PAYMENT',
                amountSubtotal,
                platformFee,
                amountTotal,
            },
        });
    }

    // 4. Transformer les items pour Stripe
    const lineItems = user.cart.items.map((item) => ({
        price_data: {
            currency: 'cad', 
            product_data: {
                name: `Offre pour : ${item.offer.request.title}`, 
                description: item.offer.message, 
            },
            unit_amount: item.offer.price, 
        },
        quantity: item.quantity, 
    }));

    // 5. Créer la session Stripe avec les BONNES variables dans l'URL de succès 🔥
    const baseUrl = 
        process.env.APP_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], 
        line_items: lineItems, 
        mode: 'payment', 
        // ICI : On ajoute booking_id et offer_id pour que ta SuccessPage puisse bosser !               
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}&offer_id=${offer.id}`,
        cancel_url: `${baseUrl}/cart`,
        metadata: {
            userId: user.id, 
            cartId: user.cart.id,
            bookingId: booking.id,
            offerId: offer.id
        }, 
    });

    redirect(session.url!);
}