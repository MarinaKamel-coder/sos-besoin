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
      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-20 px-6 text-center bg-transparent relative overflow-hidden">
        {/* Halo lumineux violet en arrière-plan (Style Vortasky) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-purple/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="space-y-5 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/5 text-purple-300 border border-purple-500/30 backdrop-blur-sm">
            ✨ Services de proximité simplifiés avec IA
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
            Trouvez de l&apos;aide sur <span className="text-cyber-gradient">SOSBesoin</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-400 font-medium leading-relaxed">
            Mettez en relation vos besoins du quotidien avec des prestataires de confiance. Simple, sécurisé et rapide.
          </p>
        </div>

        {/* Cartes de rôles style cyber-card */}
        <div className="w-full max-w-3xl mt-4 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Choisissez votre profil pour commencer
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Carte Client */}
            <Link href="/sign-up?role=client" className="group">
              <div className="cyber-card h-full rounded-2xl p-6 text-left">
                <div className="font-extrabold text-white text-xl flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-lg group-hover:border-cyber-purple/50 transition-colors">👤</span> 
                  <span className="group-hover:text-cyber-magenta transition-colors">Espace Client</span>
                </div>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                  Publiez vos chantiers ou petits besoins, fixez vos contraintes et choisissez le prestataire idéal au meilleur prix.
                </p>
              </div>
            </Link>

            {/* Carte Prestataire */}
            <Link href="/sign-up?role=provider" className="group">
              <div className="cyber-card h-full rounded-2xl p-6 text-left">
                <div className="font-extrabold text-white text-xl flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-lg group-hover:border-cyber-purple/50 transition-colors">🔧</span> 
                  <span className="group-hover:text-cyber-purple transition-colors">Espace Prestataire</span>
                </div>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                  Trouvez des contrats locaux, envoyez vos propositions chiffrées en direct et boostez vos revenus complémentaires.
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Déjà membre ?</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <Link href="/sign-in" className="inline-block w-full mt-6">
            <button className="btn-cyber-secondary w-full rounded-xl px-8 py-4 text-xs font-bold uppercase tracking-wider active:scale-[0.99]">
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32 bg-transparent">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
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
      <div className="flex flex-1 flex-col items-center py-10 px-6 bg-transparent min-h-screen">
        <div className="w-full max-w-2xl space-y-6">
          
          <div className="cyber-card p-6 rounded-2xl">
            <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <span className="text-cyber-purple">🚀</span> Content de vous revoir, Pro !
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Consultez les nouvelles demandes soumises par la communauté ou servez-vous du formulaire ci-dessous si vous cherchez vous-même un service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/service-requests" className="w-full">
              <button
                type="button"
                className="btn-cyber-primary w-full rounded-xl px-4 py-4 text-xs font-bold uppercase tracking-wider active:scale-[0.98]"
              >
                🔎 Trouver des missions disponibles
              </button>
            </Link>

            <Link href="/offres-envoyees" className="w-full">
              <button
                type="button"
                className="btn-cyber-secondary w-full h-full rounded-xl px-4 py-4 text-xs font-bold uppercase tracking-wider active:scale-[0.98]"
              >
                💼 Gérer mes propositions
              </button>
            </Link>
          </div>

          <div className="border-t border-white/5 pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-white tracking-tight">Nouvelle Demande</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Vous avez besoin d&apos;un autre spécialiste ? Créez une demande.</p>
            </div>
            <div className="cyber-card rounded-2xl p-6">
              <RequestForm categories={categories} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TABLEAU DE BORD : CLIENT
  // ==========================================
  return (
    <div className="flex flex-1 flex-col items-center py-10 px-6 bg-transparent min-h-screen">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-cyber-purple">👤</span> Nouvelle Demande 
            </h1>
            
          </div>


        </div>

        <div className="cyber-card rounded-2xl p-6">
          <RequestForm categories={categories} />
        </div>
      </div>
    </div>
  );
}