import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/src/lib/prisma";

const createServiceRequestSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10).max(1000),
  neededAt: z.coerce.date(),
  location: z.string().trim().min(2).optional().or(z.literal("")),
  clientId: z.string().min(1),
  categoryId: z.string().min(1),
});

export async function GET() {
  try {
    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        categories: {
          include: { category: true },
        },
        _count: {
          select: { offers: true },
        },
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des demandes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createServiceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation échouée",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable." },
        { status: 404 },
      );
    }

    const created = await prisma.serviceRequest.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        neededAt: parsed.data.neededAt,
        location: parsed.data.location || null,
        clientId: parsed.data.clientId,
        categories: {
          create: {
            categoryId: parsed.data.categoryId,
          },
        },
      },
      include: {
        client: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la demande." },
      { status: 500 },
    );
  }
}
