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
    <main className="mx-auto min-h-[80vh] max-w-xl p-6 flex flex-col items-center justify-center text-center text-slate-100 bg-transparent">
      
      {/* Conteneur Succès Cyber-Premium */}
      <div className="cyber-card rounded-2xl p-8 backdrop-blur-md border-emerald-500/20 bg-emerald-500/[0.01] shadow-[0_0_40px_rgba(16,185,129,0.12)] w-full space-y-6">
        
        {/* Badge d'icône Néon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
          ✓
        </div>

        {/* Textes de confirmation */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text sm:text-3xl">
            Paiement réussi !
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Votre réservation de service est confirmée
          </p>
        </div>

        <div className="border-t border-white/5 pt-4">
          {/* Traitement asynchrone sécurisé en arrière-plan */}
          <PostPaymentTrigger bookingId={booking_id} offerId={offer_id} />
        </div>

        {/* Action de redirection */}
        <div className="pt-2">
          <Link
            href="/service-requests"
            className="w-full inline-block py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            Retour aux demandes
          </Link>
        </div>
        
      </div>
    </main>
  );
}