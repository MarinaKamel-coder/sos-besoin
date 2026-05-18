"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SetupRoleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupRole = async () => {
      try {
        const role = searchParams.get("role") || localStorage.getItem("signup_role") || "CLIENT";

        // Appeler l'API pour mettre à jour le rôle dans Clerk
        const response = await fetch("/api/user/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          throw new Error("Impossible de configurer l'attribution de votre rôle.");
        }

        // Nettoyer le localStorage
        localStorage.removeItem("signup_role");

        // Rediriger vers la home
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue");
        setLoading(false);
      }
    };

    setupRole();
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-32 text-center bg-transparent min-h-[70vh]">
      {loading && (
        <div className="space-y-4 flex flex-col items-center justify-center">
          {/* Spinner Premium Neon */}
          <div className="relative h-12 w-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/5 border-b-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 max-w-xs leading-relaxed animate-pulse">
            Synchronisation et sécurisation de votre profil...
          </p>
        </div>
      )}

      {error && (
        <div className="cyber-card rounded-2xl p-8 max-w-md mx-auto space-y-4 border-rose-500/20 bg-rose-500/[0.02] shadow-[0_0_20px_rgba(244,63,94,0.08)]">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400 text-lg">
            ⚠️
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-widest text-rose-400">Échec d'initialisation</p>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}

export default function SetupRolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-center bg-transparent min-h-[70vh]">
          <div className="relative h-12 w-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/5 border-b-purple-500/50"></div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">
            Chargement...
          </p>
        </div>
      }
    >
      <SetupRoleContent />
    </Suspense>
  );
}