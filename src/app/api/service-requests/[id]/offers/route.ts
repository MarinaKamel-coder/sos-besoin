import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/src/lib/prisma";

const createOfferSchema = z.object({
  providerId: z.string().min(1),
  price: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const requestExists = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!requestExists) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    const offers = await prisma.offer.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "desc" },
      include: {
        provider: true,
      },
    });

    return NextResponse.json(offers, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des offres." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const requestExists = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!requestExists) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation échouée",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const created = await prisma.offer.create({
      data: {
        requestId: id,
        providerId: parsed.data.providerId,
        price: parsed.data.price,
        message: parsed.data.message,
      },
      include: {
        provider: true,
        request: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de l'offre." },
      { status: 500 },
    );
  }
}
