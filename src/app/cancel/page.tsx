import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <h1 className="mb-4 text-3xl font-bold text-red-600">
        Paiement annulé 😕
      </h1>
      <p className="text-gray-600">
        Votre paiement a été annulé. Votre panier est intact.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded bg-black px-6 py-2 text-white"
      >
        Retourner au panier
      </Link>
    </div>
  );
}