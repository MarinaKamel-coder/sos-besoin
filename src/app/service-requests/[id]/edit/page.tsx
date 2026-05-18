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
      <main className="mx-auto w-full max-w-2xl p-6 text-slate-100 bg-transparent min-h-screen flex items-center justify-center">
        <div className="cyber-card w-full rounded-2xl border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-5 backdrop-blur-md shadow-[0_0_24px_rgba(244,63,94,0.05)]">
          <div className="space-y-2">
            <h1 className="text-xl font-black text-rose-400 tracking-tight flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              <span>🔒</span> Accès restreint
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              Vous ne possédez pas les autorisations requises pour modifier cette demande de service.
            </p>
          </div>
          
          <div className="pt-2">
            <Link
              href={`/service-requests/${id}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              ← Retour au détail
            </Link>
          </div>
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
    <main className="mx-auto w-full max-w-2xl p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      {/* Lien Retour */}
      <Link
        href={`/service-requests/${id}`}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-purple-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Annuler et retourner au détail
      </Link>

      {/* Wrapper du formulaire - Laisse le RequestForm gérer sa cyber-card mais ajoute le pli global */}
      <div className="rounded-2xl p-0.5 bg-transparent">
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