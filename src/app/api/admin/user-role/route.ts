"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

const ALLOWED_ROLES = ["CLIENT", "PROVIDER", "ADMIN"];

export async function POST(request: NextRequest) {
  const { userId: adminClerkId } = await auth();
  if (!adminClerkId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const adminUser = await prisma.user.findUnique({ where: { clerkId: adminClerkId } });
  if (!adminUser || adminUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
  }

  const body = await request.json();
  const clerkId = typeof body?.clerkId === "string" ? body.clerkId : undefined;
  const role = typeof body?.role === "string" ? body.role.toUpperCase() : undefined;

  if (!clerkId || !role) {
    return NextResponse.json(
      { error: "clerkId et role sont requis." },
      { status: 400 }
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Rôle invalide. Les valeurs autorisées sont CLIENT, PROVIDER, ADMIN." },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    const targetClerkUser = await client.users.getUser(clerkId);

    await client.users.updateUser(clerkId, {
      publicMetadata: {
        ...(targetClerkUser.publicMetadata ?? {}),
        role,
      },
    });

    await prisma.user.updateMany({
      where: { clerkId },
      data: { role },
    });

    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_USER_ROLE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le rôle Clerk de l'utilisateur." },
      { status: 500 }
    );
  }
}
