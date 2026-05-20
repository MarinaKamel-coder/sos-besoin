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
    const metadata = session.metadata as Record<string, string> | undefined;
    const bookingId = metadata?.bookingId;
    const cartId = metadata?.cartId;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    try {
      await prisma.$transaction(async (tx) => {
        if (bookingId) {
          const booking = await tx.booking.findUnique({
            where: { id: bookingId },
          });

          if (booking) {
            await tx.payment.upsert({
              where: { bookingId },
              create: {
                booking: { connect: { id: bookingId } },
                status: "SUCCEEDED",
                stripePaymentIntentId: paymentIntentId,
              },
              update: {
                status: "SUCCEEDED",
                stripePaymentIntentId: paymentIntentId,
              },
            });

            await tx.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            });

            await tx.offer.update({
              where: { id: booking.offerId },
              data: { status: "ACCEPTED" },
            });

            await tx.offer.updateMany({
              where: { requestId: booking.requestId, id: { not: booking.offerId } },
              data: { status: "REJECTED" },
            });

            await tx.serviceRequest.update({
              where: { id: booking.requestId },
              data: { status: "FILLED" },
            });
          }
        } else if (cartId) {
          const cartItems = await tx.cartItem.findMany({
            where: { cartId },
            include: { offer: true },
          });

          for (const item of cartItems) {
            const subtotal = item.offer.price * item.quantity;
            const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);

            const booking = await tx.booking.upsert({
              where: { offerId: item.offerId },
              create: {
                requestId: item.offer.requestId,
                offerId: item.offerId,
                status: "CONFIRMED",
                amountSubtotal: subtotal,
                platformFee,
                amountTotal: subtotal + platformFee,
              },
              update: {
                status: "CONFIRMED",
              },
            });

            await tx.payment.upsert({
              where: { bookingId: booking.id },
              create: {
                booking: { connect: { id: booking.id } },
                status: "SUCCEEDED",
                stripePaymentIntentId: paymentIntentId,
              },
              update: {
                status: "SUCCEEDED",
                stripePaymentIntentId: paymentIntentId,
              },
            });

            await tx.offer.update({
              where: { id: item.offerId },
              data: { status: "ACCEPTED" },
            });

            await tx.offer.updateMany({
              where: { requestId: item.offer.requestId, id: { not: item.offerId } },
              data: { status: "REJECTED" },
            });

            await tx.serviceRequest.update({
              where: { id: item.offer.requestId },
              data: { status: "FILLED" },
            });
          }
        }

        if (cartId) {
          await tx.cartItem.deleteMany({ where: { cartId } });
        }
      });

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
