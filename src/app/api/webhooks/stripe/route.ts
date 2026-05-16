import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import stripe from "@/src/lib/stripe";
import prisma from "@/src/lib/prisma";

const PLATFORM_FEE_RATE = 0.1;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature manquant" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET non configuré");
    return NextResponse.json(
      { error: "Webhook secret non configuré" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { cartId } = session.metadata ?? {};

    if (!cartId) {
      return NextResponse.json(
        { error: "Metadata cartId manquant" },
        { status: 400 },
      );
    }

    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId },
        include: { offer: true },
      });

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      for (const item of cartItems) {
        const subtotal = item.offer.price * item.quantity;
        const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
        const amountTotal = subtotal + platformFee;

        await prisma.$transaction(async (tx) => {
          // Idempotence : éviter les doublons si Stripe renvoie l'événement
          const existing = await tx.booking.findUnique({
            where: { offerId: item.offerId },
          });
          if (existing) return;

          await tx.booking.create({
            data: {
              requestId: item.offer.requestId,
              offerId: item.offerId,
              status: "CONFIRMED",
              amountSubtotal: subtotal,
              platformFee,
              amountTotal,
              payment: {
                create: {
                  status: "SUCCEEDED",
                  stripePaymentIntentId: paymentIntentId,
                },
              },
            },
          });

          await tx.offer.update({
            where: { id: item.offerId },
            data: { status: "ACCEPTED" },
          });

          await tx.serviceRequest.update({
            where: { id: item.offer.requestId },
            data: { status: "FILLED" },
          });
        });
      }

      // Vider le panier
      await prisma.cartItem.deleteMany({ where: { cartId } });

      revalidatePath("/cart");
      revalidatePath("/service-requests");
    } catch (err) {
      console.error(
        "[WEBHOOK] Erreur traitement checkout.session.completed:",
        err,
      );
      return NextResponse.json(
        { error: "Erreur de traitement" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
