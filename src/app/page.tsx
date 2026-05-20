import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/src/lib/prisma";
import { syncUserRoleFromClerk } from "@/src/action/userActions";

export default async function Home() {
  const { userId } = await auth();

  // =========================================================================
  // 1. ÉCRAN LANDING (Utilisateur non connecté - Public)
  // =========================================================================
  if (!userId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-24 px-6 text-center bg-transparent relative overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Halos lumineux dynamiques en arrière-plan */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyber-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyber-magenta/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="space-y-6 max-w-3xl relative z-10 animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest bg-white/[0.03] text-purple-300 border border-purple-500/30 backdrop-blur-md shadow-inner">
            ✨ Connecting Talents & Needs through Secure Code
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
            Le réflexe d&apos;entraide sur <span className="text-cyber-gradient animate-pulse">SOSBesoin</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400 font-medium leading-relaxed">
            Mettez en relation vos exigences quotidiennes avec des prestataires qualifiés. Une infrastructure sécurisée, transparente et locale.
          </p>
        </div>

        {/* Sélection du profil de départ */}
        <div className="w-full max-w-4xl mt-4 relative z-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-800" /> Initialisez votre session <span className="h-px w-8 bg-slate-800" />
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Carte Client */}
            <Link href="/sign-up?role=client" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-magenta to-transparent rounded-2xl blur opacity-10 group-hover:opacity-40 transition duration-500" />
              <div className="relative cyber-card h-full rounded-2xl p-8 text-left border border-white/10 bg-black/40 backdrop-blur-xl group-hover:border-cyber-magenta/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-xl bg-white/5 border border-white/10 text-xl group-hover:bg-cyber-magenta/10 group-hover:text-cyber-magenta transition-colors">👤</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-cyber-magenta bg-cyber-magenta/10 px-2 py-0.5 rounded">Besoin d&apos;aide</span>
                  </div>
                  <h3 className="font-black text-white text-xl mt-6 group-hover:text-cyber-magenta transition-colors">Espace Client</h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
                    Publiez vos chantiers ou petits besoins, spécifiez vos contraintes budgétaires et sélectionnez le profil idéal basé sur les avis de la communauté.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-slate-500 flex items-center gap-1 group-hover:text-white transition-colors">
                  Créer un compte Client <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Carte Prestataire */}
            <Link href="/sign-up?role=provider" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-purple to-transparent rounded-2xl blur opacity-10 group-hover:opacity-40 transition duration-500" />
              <div className="relative cyber-card h-full rounded-2xl p-8 text-left border border-white/10 bg-black/40 backdrop-blur-xl group-hover:border-cyber-purple/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-xl bg-white/5 border border-white/10 text-xl group-hover:bg-cyber-purple/10 group-hover:text-cyber-purple transition-colors">🔧</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-cyber-purple bg-cyber-purple/10 px-2 py-0.5 rounded">Offre de service</span>
                  </div>
                  <h3 className="font-black text-white text-xl mt-6 group-hover:text-cyber-purple transition-colors">Espace Prestataire</h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
                    Trouvez des contrats de proximité, soumettez des devis compétitifs en direct, suivez vos gains et développez votre réputation professionnelle.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-slate-500 flex items-center gap-1 group-hover:text-white transition-colors">
                  Devenir Prestataire Partenaire <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-4 justify-center">
            <div className="w-16 h-px bg-white/5" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Déjà inscrit ?</span>
            <div className="w-16 h-px bg-white/5" />
          </div>

          <Link href="/sign-in" className="inline-block w-full max-w-sm mt-6">
            <button className="btn-cyber-secondary w-full rounded-xl px-8 py-4 text-xs font-bold uppercase tracking-widest border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white transition-all duration-200 active:scale-[0.99]">
              Connexion à l&apos;infrastructure
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SYNCHRONISATION ET VÉRIFICATION DU RÔLE
  // =========================================================================
  await syncUserRoleFromClerk();

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32 bg-transparent">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
        <p className="text-xs font-black tracking-widest text-slate-500 uppercase animate-pulse">
          Établissement de la connexion sécurisée...
        </p>
      </div>
    );
  }

  if (currentUser.role === "ADMIN") {
    redirect("/admin");
  }

  // =========================================================================
  // 3. PAGE D'ACCUEIL CONNECTÉE HAUT DE GAMME (ADAPTATIVE)
  // =========================================================================
  const isClient = currentUser.role === "CLIENT";

  return (
    <div className="flex flex-1 flex-col items-center py-16 px-6 bg-transparent min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Halo immersif arrière plan */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] ${isClient ? 'bg-cyber-magenta/5' : 'bg-cyber-purple/5'} rounded-full blur-[160px] pointer-events-none z-0`} />

      <div className="w-full max-w-5xl space-y-12 relative z-10">
        
        {/* En-tête de bienvenue sophistiqué */}
        <div className="text-center space-y-4 border-b border-white/5 pb-10">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md border ${isClient ? 'text-cyber-magenta border-cyber-magenta/20 shadow-[0_0_15px_rgba(255,0,127,0.1)]' : 'text-cyber-purple border-cyber-purple/20 shadow-[0_0_15px_rgba(157,0,255,0.1)]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-ping ${isClient ? 'bg-cyber-magenta' : 'bg-cyber-purple'}`} />
            {isClient ? "Terminal Client Actif" : "Secteur Prestataire Certifié"}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
            Système d&apos;entraide <span className="text-cyber-gradient">SOSBesoin</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-slate-400 font-medium leading-relaxed">
            {isClient 
              ? "Exprimez vos besoins, analysez les simulations de devis et orchestrez vos interventions en toute sécurité."
              : "Consultez le tableau des requêtes, proposez vos grilles tarifaires et optimisez votre calendrier de contrats."
            }
          </p>
        </div>

        {/* Section de présentation : Cartes de Processus Glassmorphism */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <span>🎛️</span> Protocole opérationnel de la plateforme
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Stripe Verified
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Étape 1 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className={`text-2xl font-black ${isClient ? 'text-cyber-magenta' : 'text-cyber-purple'}`}>01</div>
                <h3 className="font-black text-white text-base">
                  {isClient ? "Décrivez votre besoin" : "Explorez les offres"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {isClient 
                    ? "Formulez votre demande via notre interface dédiée. Spécifiez la nature du service, le lieu et votre estimation budgétaire."
                    : "Accédez au flux en temps réel des demandes des clients. Filtrez par secteur géographique et compétences."
                  }
                </p>
              </div>
              <div className="mt-4 text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors font-semibold">Phase initiale</div>
            </div>

            {/* Étape 2 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className={`text-2xl font-black ${isClient ? 'text-cyber-magenta' : 'text-cyber-purple'}`}>02</div>
                <h3 className="font-black text-white text-base">
                  {isClient ? "Comparez les offres" : "Proposez votre tarif"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {isClient 
                    ? "Analysez les propositions chiffrées envoyées en direct par nos prestataires et choisissez l'offre idéale."
                    : "Proposez une estimation tarifaire claire et vos disponibilités directement depuis l'interface de la mission."
                  }
                </p>
              </div>
              <div className="mt-4 text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors font-semibold">Négociation directe</div>
            </div>

            {/* Étape 3 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-2xl font-black text-slate-500">03</div>
                <h3 className="font-black text-white text-base">Protection Stripe</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Les fonds sont conservés par notre partenaire bancaire **Stripe**. Le capital n&apos;est libéré qu&apos;après exécution et validation finale du service.
                </p>
              </div>
              <div className="mt-4 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Protection 100%
              </div>
            </div>
          </div>
        </div>

        {/* Section d'appels à l'action / Boutons d'accès direct */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
          {isClient ? (
            <>
              {/* Boutons Client */}
              <Link href="/create-request" className="block group relative">
                <div className="absolute -inset-0.5 bg-cyber-purple rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                <button className="relative w-full rounded-xl bg-gradient-to-r from-cyber-purple to-purple-800 text-white font-bold text-xs uppercase tracking-widest py-4.5 px-6 shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2">
                  ✏️ Créer une demande de service
                </button>
              </Link>
              <Link href="/service-requests" className="block">
                <button className="w-full rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold text-xs uppercase tracking-widest py-4.5 px-6 transition-all duration-200 active:scale-[0.99]">
                  📋 Consulter l&apos;état de mes demandes
                </button>
              </Link>
            </>
          ) : (
            <>
              {/* Boutons Prestataire */}
              <Link href="/service-requests" className="block group relative">
                <div className="absolute -inset-0.5 bg-cyber-purple rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                <button className="relative w-full rounded-xl bg-gradient-to-r from-cyber-purple to-purple-800 text-white font-bold text-xs uppercase tracking-widest py-4.5 px-6 shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2">
                  🔎 Rechercher des missions disponibles
                </button>
              </Link>
              <Link href="/offres-envoyees" className="block">
                <button className="w-full rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold text-xs uppercase tracking-widest py-4.5 px-6 transition-all duration-200 active:scale-[0.99]">
                  💼 Historique mes propositions envoyés
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}