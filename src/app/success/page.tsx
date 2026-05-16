import Link from "next/link";
import { redirect } from "next/navigation";
import PostPaymentTrigger from "@/src/components/cart/PostPaymentTrigger";

type SuccessPageProps = {
  searchParams: Promise<{ booking_id?: string; offer_id?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { booking_id, offer_id } = await searchParams;

  if (!booking_id || !offer_id) {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-[75vh] max-w-xl p-6 flex flex-col items-center justify-center text-center text-slate-100 bg-slate-950">
      <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 p-8 backdrop-blur-md shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-2xl">
          ✓
        </div>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-emerald-400">
          Paiement réussi ! 🎉
        </h1>
        
        <p className="text-sm text-slate-400 mb-4">
          Votre réservation est confirmée.
        </p>
        
        {/* Le traitement asynchrone sécurisé se fait ici, sans bloquer le rendu ! */}
        <PostPaymentTrigger bookingId={booking_id} offerId={offer_id} />

        <div className="mt-6">
          <Link
            href="/service-requests"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md"
          >
            Retour aux demandes
          </Link>
        </div>
      </div>
    </main>
  );
}