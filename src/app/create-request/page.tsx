import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/src/lib/prisma";
import RequestForm from "@/src/components/requests/RequestForm";
import { syncUserRoleFromClerk } from "@/src/action/userActions";

export default async function CreateRequestPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Synchroniser le rôle
  await syncUserRoleFromClerk();

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) redirect("/sign-in");

  // Seuls les CLIENT peuvent créer une demande
  if (currentUser.role !== "CLIENT") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-1 flex-col items-center py-10 px-6 bg-transparent min-h-screen">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-cyber-purple">📝</span> Créer une Demande
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
              Décrivez votre besoin et recevez des offres de prestataires qualifiés
            </p>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-6">
          <RequestForm categories={categories} />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
