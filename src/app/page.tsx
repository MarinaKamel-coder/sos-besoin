import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/prisma";
import RequestForm from "@/src/components/requests/RequestForm";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-32 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Bienvenue sur <span className="text-blue-500">SOSBesoin</span>
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Publiez vos demandes de service et recevez des offres de prestataires
          qualifiés.
        </p>
        <Link
          href="/sign-in"
          className="rounded-xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-500 transition-colors"
        >
          Se connecter pour commencer
        </Link>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-1 flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Publier une nouvelle demande
        </h1>
        <RequestForm categories={categories} />
      </div>
    </div>
  );
}
