"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SetupRolePage() {
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
          throw new Error("Impossible de mettre à jour le rôle");
        }

        // Nettoyer le localStorage
        localStorage.removeItem("signup_role");

        // Rediriger vers la home
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
        setLoading(false);
      }
    };

    setupRole();
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-center">
      {loading && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Configuration de votre profil...
          </p>
        </>
      )}
      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}
