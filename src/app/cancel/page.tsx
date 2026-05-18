import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto w-full max-w-xl p-6 text-slate-100 bg-transparent min-h-[75vh] flex items-center justify-center">
      <div className="w-full rounded-2xl border border-white/5 bg-white/[0.01] p-8 text-center space-y-6">
        
        {/* Indicateur visuel stylisé (Alerte / Interruption) */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        {/* Message principal */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Paiement interrompu
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            Le processus de transaction a été annulé à votre demande. Aucune somme n&apos;a été débitée et vos configurations restent en attente.
          </p>
        </div>

        {/* Action de redirection */}
        <div className="pt-2">
          <Link
            href="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Retourner au panier
          </Link>
        </div>

      </div>
    </div>
  );
}