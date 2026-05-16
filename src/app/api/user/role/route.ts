import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { role } = await request.json();
    
    if (!role || (role.toUpperCase() !== "PROVIDER" && role.toUpperCase() !== "CLIENT")) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour les métadonnées publiques de l'utilisateur Clerk
    const client = await clerkClient();
    
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: role.toUpperCase(),
      },
    });

    return NextResponse.json(
      { success: true, role: role.toUpperCase() },
      { status: 200 }
    );
  } catch (error) {
    console.error("[UPDATE_ROLE_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    );
  }
}
