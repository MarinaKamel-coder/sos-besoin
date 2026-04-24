import { NextResponse } from "next/server";
import { z } from "zod";

import { Prisma, RequestStatus } from "@/src/generated/prisma/client";
import prisma from "@/src/lib/prisma";

const putServiceRequestSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10).max(1000),
  neededAt: z.coerce.date(),
  location: z.string().trim().min(2).optional().or(z.literal("")),
  status: z.enum([
    RequestStatus.OPEN,
    RequestStatus.FILLED,
    RequestStatus.CANCELLED,
    RequestStatus.HIDDEN,
  ]),
  categoryId: z.string().min(1).optional(),
});

const patchServiceRequestSchema = putServiceRequestSchema.partial();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: true,
        categories: { include: { category: true } },
        offers: {
          include: { provider: true },
          orderBy: { createdAt: "desc" },
        },
        booking: { include: { payment: true } },
      },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    return NextResponse.json(serviceRequest, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du détail." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = putServiceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation echouee",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json({ error: "Categorie introuvable." }, { status: 404 });
      }
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        neededAt: parsed.data.neededAt,
        location: parsed.data.location || null,
        status: parsed.data.status,
        ...(parsed.data.categoryId
          ? {
              categories: {
                deleteMany: {},
                create: { categoryId: parsed.data.categoryId },
              },
            }
          : {}),
      },
      include: {
        client: true,
        categories: { include: { category: true } },
        offers: true,
        booking: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise a jour de la demande." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = patchServiceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation echouee",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data: Prisma.ServiceRequestUpdateInput = {};

    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.neededAt !== undefined) data.neededAt = parsed.data.neededAt;
    if (parsed.data.location !== undefined) data.location = parsed.data.location || null;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    if (parsed.data.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json({ error: "Categorie introuvable." }, { status: 404 });
      }

      data.categories = {
        deleteMany: {},
        create: { categoryId: parsed.data.categoryId },
      };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ a mettre a jour." },
        { status: 400 },
      );
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data,
      include: {
        client: true,
        categories: { include: { category: true } },
        offers: true,
        booking: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise a jour partielle de la demande." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      select: {
        id: true,
        booking: { select: { id: true } },
      },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    if (serviceRequest.booking) {
      return NextResponse.json(
        { error: "Suppression impossible: une reservation est liee a cette demande." },
        { status: 400 },
      );
    }

    await prisma.serviceRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Demande supprimee." }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression de la demande." },
      { status: 500 },
    );
  }
}
