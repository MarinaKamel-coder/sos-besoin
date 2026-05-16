import { NextRequest, NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';
import prisma from '../../../../lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Signature Stripe manquante' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        console.log(`Webhook reçu : ${event.type}`);
    } catch (error) {
        console.error('Erreur vérification webhook :', error);

        return NextResponse.json(
            { error: 'Webhook invalide' },
            { status: 400 }
        );
    }

    // ==========================================
    // CHECKOUT RÉUSSI
    // ==========================================
    if (event.type === 'checkout.session.completed') {
        try {
            const session = event.data.object as Stripe.Checkout.Session;

            const cartId = session.metadata?.cartId;

            if (!cartId) {
                throw new Error('cartId manquant dans metadata');
            }

            console.log(`Paiement réussi pour panier ${cartId}`);

            // Récupérer le panier
            const cart = await prisma.cart.findUnique({
                where: {
                    id: cartId,
                },
                include: {
                    items: {
                        include: {
                            offer: true,
                        },
                    },
                },
            });

            if (!cart) {
                throw new Error('Panier introuvable');
            }

            // Parcourir chaque item
            for (const item of cart.items) {
                // Trouver booking associé à l'offre
                const booking = await prisma.booking.findFirst({
                    where: {
                        offerId: item.offer.id,
                    },
                });

                if (!booking) {
                    console.warn(
                        `Booking introuvable pour offer ${item.offer.id}`
                    );
                    continue;
                }

                // Confirmer booking
                await prisma.booking.update({
                    where: {
                        id: booking.id,
                    },
                    data: {
                        status: 'CONFIRMED',
                    },
                });

                console.log(`Booking confirmé : ${booking.id}`);

                // Créer ou update paiement
                await prisma.payment.upsert({
                    where: {
                        bookingId: booking.id,
                    },
                    update: {
                        status: 'SUCCEEDED',
                        stripePaymentIntentId:
                            typeof session.payment_intent === 'string'
                                ? session.payment_intent
                                : null,
                    },
                    create: {
                        bookingId: booking.id,
                        status: 'SUCCEEDED',
                        stripePaymentIntentId:
                            typeof session.payment_intent === 'string'
                                ? session.payment_intent
                                : null,
                    },
                });

                console.log(`Paiement enregistré : ${booking.id}`);
            }

            // Vider le panier
            await prisma.cartItem.deleteMany({
                where: {
                    cartId,
                },
            });

            console.log('Panier vidé');
        } catch (error) {
            console.error(
                'Erreur traitement checkout.session.completed :',
                error
            );

            return NextResponse.json(
                { error: 'Erreur traitement paiement réussi' },
                { status: 500 }
            );
        }
    }

    // ==========================================
    // PAIEMENT ÉCHOUÉ
    // ==========================================
    if (event.type === 'payment_intent.payment_failed') {
        try {
            const paymentIntent =
                event.data.object as Stripe.PaymentIntent;

            console.log(
                `Paiement échoué : ${paymentIntent.id}`
            );

            // Mettre paiement FAILED
            await prisma.payment.updateMany({
                where: {
                    stripePaymentIntentId: paymentIntent.id,
                },
                data: {
                    status: 'FAILED',
                },
            });

            console.log('Paiement marqué FAILED');
        } catch (error) {
            console.error(
                'Erreur traitement payment_intent.payment_failed :',
                error
            );

            return NextResponse.json(
                { error: 'Erreur traitement paiement échoué' },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ received: true });
}