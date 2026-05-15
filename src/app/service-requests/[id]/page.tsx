import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceRequestById } from "@/src/lib/requetes/serviceRequests";
import { addToCart } from "@/src/action/cart";
import OfferForm from "@/src/components/offers/OfferForm";
import DeleteRequestButton from "@/src/components/requests/DeleteRequestButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const request = await getServiceRequestById(id);

  if (!request) notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link
        href="/service-requests"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Retour aux demandes
      </Link>

      <header className="mb-6 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{request.title}</h1>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
              {request.status}
            </span>

            {request.status === "OPEN" && (
              <div className="flex gap-2">
                <Link
                  href={`/service-requests/${request.id}/edit`}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  ✏ Modifier
                </Link>
                <DeleteRequestButton requestId={request.id} />
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Publie par {request.client.name ?? request.client.email} &middot;{" "}
          {request.location ?? "Lieu non specifie"} &middot; A faire le{" "}
          {new Date(request.neededAt).toLocaleDateString("fr-CA")}
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
          {request.description}
        </p>
      </section>

      {request.categories.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {request.categories.map((rc) => (
              <span
                key={rc.categoryId}
                className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {rc.category.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">
          Offres recues ({request.offers.length})
        </h2>

        {request.offers.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
            Aucune offre pour le moment.
          </div>
        ) : (
          <ul className="space-y-3">
            {request.offers.map((offer) => (
              <li
                key={offer.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {offer.provider.name ?? offer.provider.email}
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {offer.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {(offer.price / 100).toFixed(2)} $
                    </p>
                    <span className="rounded border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                      {offer.status}
                    </span>

                      {offer.status === "PENDING" && (
                        <form
                          action={async () => {
                            "use server";
                            try {
                              await addToCart(offer.id);
                            } catch {
                              // Erreur silencieuse — l'utilisateur n'est pas autorisé
                            }
                          }}
                          className="mt-2"
                        >
                          <button
                            type="submit"
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Ajouter au panier
                          </button>
                        </form>
                      )}                    
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {request.booking && (
        <section className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <h2 className="mb-2 text-lg font-semibold text-green-700 dark:text-green-400">
            Reservation confirmee
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Statut : <strong>{request.booking.status}</strong> &middot; Total :{" "}
            <strong>
              {(request.booking.amountTotal / 100).toFixed(2)} $
            </strong>
          </p>
        </section>
      )}

      {request.status === "OPEN" && (
        <section className="mt-8">
          <OfferForm requestId={request.id} />
        </section>
      )}
    </main>
  );
}