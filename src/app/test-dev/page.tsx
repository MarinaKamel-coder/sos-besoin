import { redirect } from "next/navigation";
import Link from "next/link";
import { resetMyTestData } from "../test-dev/actions";

// Bloque complètement la page en production
export default function DevPage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-xl p-6 text-slate-100 bg-transparent min-h-screen space-y-6">
      
      {/* Alerte Mode Dev Néon */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
        ⚠️ Page de développement — non accessible en production
      </div>

      {/* Titre et introduction */}
      <div className="space-y-1.5 border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
          Outils de développement
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          Ces actions destructives et d'initialisation ne touchent que{" "}
          <strong className="text-slate-200 font-bold">vos propres données</strong>. 
          Les profils et enregistrements des autres utilisateurs ne sont pas affectés.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Section Action : Réinitialisation */}
        <div className="cyber-card rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Réinitialiser mes données de test
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Supprime l'intégralité de vos demandes, offres et panier actuels dans la base de données, 
              puis recrée automatiquement 2 demandes (déménagement + guitariste) associées à 3 offres 
              <code className="bg-white/5 px-1 py-0.5 rounded text-purple-400 ml-1 font-mono">PENDING</code> prêtes à être testées.
            </p>
          </div>
          
          <form
            action={async () => {
              "use server";
              await resetMyTestData();
              redirect("/list-offers");
            }}
          >
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all active:scale-[0.98]"
            >
              Réinitialiser et aller aux offres →
            </button>
          </form>
        </div>

        {/* Section Liens rapides */}
        <div className="cyber-card rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            Liens rapides du routeur
          </h2>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { href: "/list-offers", label: "/list-offers" },
              { href: "/cart", label: "/cart" },
              { href: "/service-requests", label: "/service-requests" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/5 bg-white/[0.01] px-3 py-2 text-xs font-mono text-slate-400 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}