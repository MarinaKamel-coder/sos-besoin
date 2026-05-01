import prisma from "../../lib/prisma";
import { addToCart } from "../../action/cart";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TestOffersPage() {
  const { userId: clerkUserId } = await auth();

  // Trouver l'utilisateur en BD à partir du clerkId
  const dbUser = clerkUserId
    ? await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
    : null;

  // N'afficher que les offres PENDING sur les demandes du client connecté
  const offers = await prisma.offer.findMany({
    where: {
      status: "PENDING",
      ...(dbUser ? { request: { clientId: dbUser.id } } : { id: "none" }),
    },
    include: {
      request: true,
      provider: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Offres disponibles</h1>
      <Link href="/cart" className="mb-4 inline-block rounded border px-4 py-2">
        Voir le panier
      </Link>

      {offers.length === 0 ? (
        <p>Aucune offre disponible pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border p-4">
              <h2 className="text-lg font-semibold">{offer.request.title}</h2>

              <p className="text-sm text-gray-500">
                Prestataire : {offer.provider.name ?? offer.provider.email}
              </p>

              <p className="mt-2">{offer.message}</p>

              <p className="mt-2 font-semibold">
                Prix : {(offer.price / 100).toFixed(2)} $
              </p>

              <form
                action={async () => {
                  "use server";
                  await addToCart(offer.id);
                  redirect("/cart");
                }}
                className="mt-4"
              >
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Ajouter au panier
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
