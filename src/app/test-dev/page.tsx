import { redirect } from "next/navigation";
import Link from "next/link";
import { resetMyTestData } from "../test-dev/actions";

// Bloque complètement la page en production
export default function DevPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <div className="mb-6 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300">
        ⚠️ Page de développement — non accessible en production
      </div>

      <h1 className="mb-2 text-2xl font-bold">Outils de dev</h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Ces actions ne touchent que <strong>vos propres données</strong>. Les
        autres utilisateurs ne sont pas affectés.
      </p>

      <div className="space-y-4">
        {/* Réinitialiser les données de test */}
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Réinitialiser mes données de test</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Supprime vos demandes, offres et panier actuels, puis recrée 2
            demandes (déménagement + guitariste) avec 3 offres PENDING prêtes à
            tester.
          </p>
          <form
            action={async () => {
              "use server";
              await resetMyTestData();
              redirect("/list-offers");
            }}
            className="mt-4"
          >
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Réinitialiser et aller aux offres →
            </button>
          </form>
        </div>

        {/* Liens rapides */}
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Liens rapides</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link
              href="/list-offers"
              className="rounded border px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              /list-offers
            </Link>
            <Link
              href="/cart"
              className="rounded border px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              /cart
            </Link>
            <Link
              href="/service-requests"
              className="rounded border px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              /service-requests
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
