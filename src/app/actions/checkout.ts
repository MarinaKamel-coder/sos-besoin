'use server';

import { redirect } from 'next/navigation';
import stripe from '../../lib/stripe';
import prisma from '../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function createCheckoutSession() {
    const { userId } = await auth();
    if (!userId) throw new Error('Non authentifie');

    // Recuperer l'utilisateur et son panier
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }, 
        include: {
            cart: {
                include: {
                    items: {
                        include: {
                            offer: true, 
                        },       
                    },
                },
            },
        },
    });

    if (!user?.cart || user.cart.items.length === 0) {
        throw new Error('Panier vide');
    }

    // Transformer les items en line_items Stripe
    const lineItems = user.cart.items.map((item) => ({
        price_data: {
            currency: 'cad', 
            product_data: {
                name: `Offre #${item.offer.id}`, 
                description: item.offer.message, 
            },
            unit_amount: item.offer.price, // deja en cents 
        },
        quantity: item.quantity, 
    }));

    // Creer la session Stripe
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], 
        line_items: lineItems, 
        mode: 'payment', 
        success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/cart`,
        metadata: {
            userId: user.id, 
            cartId: user.cart.id,
        }, 
    });

    redirect(session.url!);
}