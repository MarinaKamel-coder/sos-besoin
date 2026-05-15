import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <h1 className="mb-4 text-3xl font-bold text-green-600">
        Paiement réussi ! 🎉
      </h1>
      <p className="text-gray-600">
        Votre réservation est confirmée. Merci pour votre confiance !
      </p>
      <Link
        href="/service-requests"
        className="mt-6 inline-block rounded bg-black px-6 py-2 text-white"
      >
        Retour aux demandes
      </Link>
    </div>
  );
}