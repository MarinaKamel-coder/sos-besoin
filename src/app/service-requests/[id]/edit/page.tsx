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

  // Guard de sécurité : Seul l'auteur ou un ADMIN peut modifier
  if (request.clientId !== user.id && user.role !== "ADMIN") {
    return (
      <main className="mx-auto w-full max-w-2xl p-6 text-slate-100 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="w-full rounded-2xl border border-rose-500/10 bg-rose-500/5 p-6 text-center shadow-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-black text-rose-400 tracking-tight flex items-center justify-center gap-2">
              <span>🔒</span> Accès restreint
            </h1>
            <p className="text-sm text-slate-400">
              Vous ne possédez pas les autorisations requises pour modifier cette demande de service.
            </p>
          </div>
          
          <Link
            href={`/service-requests/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            ← Retour au détail
          </Link>
        </div>
      </main>
    );
  }

  // Récupérer les catégories disponibles pour le sélecteur
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const categoryId = request.categories[0]?.categoryId;

  return (
    <main className="mx-auto w-full max-w-2xl p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      {/* Lien Retour */}
      <Link
        href={`/service-requests/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Annuler et retourner au détail
      </Link>

      {/* Formulaire injecté */}
      <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-sm">
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
      </div>
    </main>
  );
}