import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto w-full max-w-xl p-6 text-slate-100 bg-slate-950 min-h-[75vh] flex items-center justify-center">
      <div className="w-full rounded-2xl border border-slate-900 bg-slate-900/20 p-8 text-center backdrop-blur-sm shadow-md space-y-6">
        
        {/* Indicateur visuel discret */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-xl">
          ⚠️
        </div>

        {/* Message principal */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Transaction interrompue
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Le processus de paiement a été annulé à votre demande. Pas d&apos;inquiétude, les éléments de votre panier sont restés totalement intacts.
          </p>
        </div>

        {/* Action de rebond */}
        <div className="pt-2">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white hover:border-slate-700 transition-all active:scale-[0.98]"
          >
            🛒 Retourner à mon panier
          </Link>
        </div>

      </div>
    </div>
  );
}