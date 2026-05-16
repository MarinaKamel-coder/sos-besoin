import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/src/lib/prisma";
import RequestForm from "@/src/components/requests/RequestForm";
import { syncUserRoleFromClerk } from "@/src/action/userActions";

export default async function Home() {
  const { userId } = await auth();

  // ==========================================
  // ÉCRAN LANDING (Utilisateur déconnecté)
  // ==========================================
  if (!userId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-20 px-6 text-center bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Subtile lueur en arrière-plan */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="space-y-4 max-w-2xl relative z-10">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
            🚀 Services de proximité simplifiés
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
            Trouvez de l&apos;aide sur <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">SOSBesoin</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-400 leading-relaxed">
            Mettez en relation vos besoins du quotidien avec des prestataires de confiance. Simple, sécurisé et rapide.
          </p>
        </div>

        {/* Cartes de rôles */}
        <div className="w-full max-w-2xl mt-4 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Choisissez votre profil pour commencer
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Carte Client */}
            <Link href="/sign-up?role=client" className="group">
              <div className="h-full rounded-2xl border border-slate-900 bg-slate-900/20 p-6 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-blue-950/20">
                <div className="font-extrabold text-blue-400 text-xl flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/10 text-lg">👤</span> 
                  <span>Espace Client</span>
                </div>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  Publiez vos chantiers ou petits besoins, fixez vos contraintes et choisissez le prestataire idéal au meilleur prix.
                </p>
              </div>
            </Link>

            {/* Carte Prestataire */}
            <Link href="/sign-up?role=provider" className="group">
              <div className="h-full rounded-2xl border border-slate-900 bg-slate-900/20 p-6 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-emerald-950/20">
                <div className="font-extrabold text-emerald-400 text-xl flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-lg">🔧</span> 
                  <span>Espace Prestataire</span>
                </div>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  Trouvez des contrats locaux, envoyez vos propositions chiffrées en direct et boostez vos revenus complémentaires.
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-900" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Déjà membre ?</span>
            <div className="flex-1 h-px bg-slate-900" />
          </div>

          <Link href="/sign-in" className="inline-block w-full mt-6">
            <button className="w-full rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 px-8 py-3.5 text-sm font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 active:scale-[0.99] shadow-sm">
              Accéder à l&apos;interface de connexion
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // ÉCRAN CHARGEMENT CONTEXTE (Sync DB)
  // ==========================================
  await syncUserRoleFromClerk();

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32 bg-slate-950">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">
          Vérification des accès sécurisés...
        </p>
      </div>
    );
  }

  if (currentUser.role === "ADMIN") {
    redirect("/admin");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // ==========================================
  // TABLEAU DE BORD : PRESTATAIRE (PROVIDER)
  // ==========================================
  if (currentUser.role === "PROVIDER") {
    return (
      <div className="flex flex-1 flex-col items-center py-10 px-6 bg-slate-950 text-slate-100 min-h-screen">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8 p-6 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm shadow-sm">
            <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <span>🚀</span> Content de vous revoir, Pro !
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Consultez les nouvelles demandes soumises par la communauté ou servez-vous du formulaire ci-dessous si vous cherchez vous-même un service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            <Link href="/service-requests" className="w-full">
              <button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md active:scale-[0.98]"
              >
                🔎 Trouver des missions disponibles
              </button>
            </Link>

            <Link href="/offres-envoyees" className="w-full">
              <button
                type="button"
                className="w-full h-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all active:scale-[0.98]"
              >
                💼 Gérer mes propositions envoyées
              </button>
            </Link>
          </div>

          <div className="border-t border-slate-900/80 pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Publier une annonce personnelle</h2>
              <p className="text-sm text-slate-500 mt-1">Vous avez besoin d&apos;un autre spécialiste ? Créez une demande.</p>
            </div>
            <RequestForm categories={categories} />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TABLEAU DE BORD : CLIENT OU ADMINISTRATEUR
  // ==========================================
  return (
    <div className="flex flex-1 flex-col items-center py-10 px-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900/80 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              👤 Nouvel Appel d&apos;Offre
            </h1>
            <p className="text-sm text-slate-500 mt-1">Décrivez votre besoin pour obtenir des devis de nos prestataires.</p>
          </div>

          {currentUser.role === "CLIENT" && (
            <div className="flex gap-2 shrink-0">
              <Link
                href="/service-requests"
                className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                📋 Suivi de mes demandes
              </Link>
              <Link
                href="/offres-recues"
                className="rounded-xl bg-blue-600/10 border border-blue-500/20 px-4 py-2.5 text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-all shadow-sm"
              >
                📩 Réponses reçues
              </Link>
            </div>
          )}
        </div>

        <RequestForm categories={categories} />
      </div>
    </div>
  );
}