import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import { PDFDocument, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Non autorisé", { status: 401 });

    const { paymentId } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (!dbUser) return new NextResponse("Utilisateur introuvable", { status: 404 });

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            request: {
              include: { client: true },
            },
            offer: {
              include: { provider: true },
            },
          },
        },
      },
    });

    if (!payment) return new NextResponse("Paiement introuvable", { status: 404 });

    const { booking } = payment;
    if (!booking) return new NextResponse("Réservation non trouvée", { status: 404 });

    const client = booking.request.client;
    const provider = booking.offer.provider;

    if (
      dbUser.role !== "ADMIN" &&
      dbUser.id !== client.id &&
      dbUser.id !== provider.id
    ) {
      return new NextResponse("Accès interdit à cette facture", { status: 403 });
    }

    // Création du document PDF avec pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Taille A4

    let yPos = 750;
    const margin = 40;
    const pageWidth = 612 - 2 * margin;

    // Couleurs cyberpunk
    const darkPurple = rgb(0.12, 0.1, 0.29); // #1e1b4b
    const neonPurple = rgb(0.44, 0, 1); // #7000ff
    const darkBlue = rgb(0.06, 0.09, 0.17); // #0f172a
    const slate = rgb(0.2, 0.26, 0.35); // #334155
    const lightGray = rgb(0.4, 0.46, 0.56); // #64748b

    // Titre
    page.drawText("FACTURE", {
      x: margin,
      y: yPos,
      size: 24,
      color: darkPurple,
    });
    yPos -= 40;

    // Nom plateforme
    page.drawText("Plateforme SOS Besoin", {
      x: margin,
      y: yPos,
      size: 14,
      color: neonPurple,
    });
    yPos -= 30;

    // Métadonnées
    page.drawText(
      `Date : ${new Date(payment.createdAt).toLocaleDateString("fr-FR")}`,
      {
        x: margin,
        y: yPos,
        size: 9,
        color: lightGray,
      }
    );
    yPos -= 15;
    page.drawText(`Réf Facture : ${payment.id.substring(0, 12).toUpperCase()}`, {
      x: margin,
      y: yPos,
      size: 9,
      color: lightGray,
    });

    if (payment.stripePaymentIntentId) {
      yPos -= 15;
      page.drawText("Paiement Stripe", {
        x: margin,
        y: yPos,
        size: 9,
        color: lightGray,
      });
    }
    yPos -= 30;

    // Parties prenantes
    page.drawText("PRESTATAIRE", {
      x: margin,
      y: yPos,
      size: 10,
      color: darkBlue,
    });
    page.drawText(provider.name || "Prestataire Indépendant", {
      x: margin + 10,
      y: yPos - 15,
      size: 9,
      color: slate,
    });
    page.drawText(provider.email, {
      x: margin + 10,
      y: yPos - 30,
      size: 9,
      color: slate,
    });

    page.drawText("CLIENT", {
      x: margin + 320,
      y: yPos,
      size: 10,
      color: darkBlue,
    });
    page.drawText(client.name || "Client", {
      x: margin + 330,
      y: yPos - 15,
      size: 9,
      color: slate,
    });
    page.drawText(client.email, {
      x: margin + 330,
      y: yPos - 30,
      size: 9,
      color: slate,
    });

    yPos -= 70;

    // Service
    page.drawText("SERVICE", {
      x: margin,
      y: yPos,
      size: 11,
      color: neonPurple,
    });
    yPos -= 20;

    page.drawText(`Demande : ${booking.request.title}`, {
      x: margin,
      y: yPos,
      size: 9,
      color: darkBlue,
    });
    yPos -= 15;
    page.drawText(`Statut : ${booking.status}`, {
      x: margin,
      y: yPos,
      size: 9,
      color: darkBlue,
    });

    yPos -= 30;

    // Montants
    const rightCol = margin + pageWidth - 80;

    page.drawText("Sous-total", {
      x: rightCol - 60,
      y: yPos,
      size: 9,
      color: lightGray,
    });
    page.drawText(`${(booking.amountSubtotal / 100).toFixed(2)} $`, {
      x: rightCol + 40,
      y: yPos,
      size: 9,
      color: darkBlue,
    });

    yPos -= 15;
    page.drawText("Frais plateforme (10%)", {
      x: rightCol - 80,
      y: yPos,
      size: 9,
      color: lightGray,
    });
    page.drawText(`${(booking.platformFee / 100).toFixed(2)} $`, {
      x: rightCol + 40,
      y: yPos,
      size: 9,
      color: darkBlue,
    });

    yPos -= 20;
    // Ligne séparatrice
    page.drawLine({
      start: { x: rightCol - 80, y: yPos },
      end: { x: rightCol + 40, y: yPos },
      color: rgb(0.88, 0.90, 0.94),
    });

    yPos -= 15;
    // Total
    page.drawText("TOTAL", {
      x: rightCol - 40,
      y: yPos,
      size: 12,
      color: rgb(1, 0, 0.9), // #ff00e5
    });
    page.drawText(`${(booking.amountTotal / 100).toFixed(2)} $`, {
      x: rightCol + 40,
      y: yPos,
      size: 12,
      color: rgb(1, 0, 0.9),
    });

    // Footer
    page.drawText("Facture générée automatiquement par SOS Besoin.", {
      x: margin,
      y: 40,
      size: 7,
      color: rgb(0.58, 0.64, 0.71), // #94a3b8
    });

    // Générer le PDF en bytes
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=facture-${paymentId.substring(0, 8)}.pdf`,
      },
    });
  } catch (error) {
    console.error("Erreur génération facture:", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}