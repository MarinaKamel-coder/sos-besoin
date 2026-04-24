import { NextResponse } from "next/server";
import { z } from "zod";

import { OfferStatus } from "@/src/generated/prisma/client";
import prisma from "@/src/lib/prisma";

const updateOfferStatusSchema = z.object({
  status: z.enum([OfferStatus.ACCEPTED, OfferStatus.REJECTED, OfferStatus.WITHDRAWN]),
});

const putOfferSchema = z.object({
  price: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
  status: z.enum([
    OfferStatus.PENDING,
    OfferStatus.ACCEPTED,
    OfferStatus.REJECTED,
    OfferStatus.WITHDRAWN,
  ]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        provider: true,
        request: true,
        booking: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }

    return NextResponse.json(offer, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'offre." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.offer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateOfferStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation échouée",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        provider: true,
        request: true,
        booking: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'offre." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.offer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = putOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation échouée",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        price: parsed.data.price,
        message: parsed.data.message,
        status: parsed.data.status,
      },
      include: {
        provider: true,
        request: true,
        booking: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise a jour complete de l'offre." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.offer.findUnique({
      where: { id },
      select: {
        id: true,
        booking: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }

    if (existing.booking) {
      return NextResponse.json(
        { error: "Suppression impossible: cette offre est deja liee a une reservation." },
        { status: 400 },
      );
    }

    await prisma.offer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Offre supprimee." }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression de l'offre." },
      { status: 500 },
    );
  }
}
