import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import RequestForm from "@/src/components/requests/RequestForm";
import { getServiceRequestById } from "@/src/lib/requetes/serviceRequests";
import prisma from "@/src/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;

  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const request = await getServiceRequestById(id);
  if (!request) notFound();

  if (request.clientId !== user.id && user.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
          <h1 className="mb-2 text-xl font-semibold text-red-700 dark:text-red-400">
            Acces refuse
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Vous ne pouvez modifier que vos propres demandes.
          </p>
          <Link
            href={`/service-requests/${id}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Retour au detail
          </Link>
        </div>
      </main>
    );
  }

  // Recuperer les categories disponibles pour le select
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const categoryId = request.categories[0]?.categoryId;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href={`/service-requests/${id}`}
        className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Retour au detail
      </Link>

      <RequestForm
        categories={categories}
        initialData={{
          id: request.id,
          version: request.version,
          title: request.title,
          description: request.description,
          neededAt: request.neededAt,
          location: request.location ?? undefined,
          categoryId,
        }}
      />
    </main>
  );
}