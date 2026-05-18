import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getCartCount } from "../action/cart";
import prisma from "@/src/lib/prisma";

async function CartCount() {
  const { userId } = await auth();
  if (!userId) return null;

  let count = 0;
  try {
    count = await getCartCount();
  } catch {
    // Erreur silencieuse si non synchronisé
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-4 w-4 text-slate-400 group-hover:text-cyber-purple transition-colors"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.847-7.156A60.106 60.106 0 0 0 4.5 5.322M7.5 14.25 5.106 5.157M7.5 14.25l-1.75 7m13-7 1.75 7M10.5 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span>Panier</span>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-cyber-magenta text-[9px] font-black text-white ring-2 ring-[#060212] shadow-[0_0_10px_rgba(109,40,217,0.5)] animate-fade-in">
          {count}
        </span>
      )}
    </Link>
  );
}

async function UserRoleBadge() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return null;

  const roleConfig: Record<string, { label: string; color: string }> = {
    CLIENT: { 
      label: "👤 Client", 
      color: "bg-white/5 border-white/10 text-slate-300" 
    },
    PROVIDER: {
      label: "🔧 Pro",
      color: "bg-cyber-purple/10 border-cyber-purple/30 text-purple-300 shadow-[0_0_12px_rgba(109,40,217,0.1)]",
    },
    ADMIN: { 
      label: "🔐 Admin", 
      color: "bg-cyber-magenta/10 border-cyber-magenta/30 text-magenta-300 shadow-[0_0_12px_rgba(217,70,239,0.1)]" 
    },
  };

  const config = roleConfig[user.role] || roleConfig.CLIENT;

  return (
    <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm ${config.color}`}>
      {config.label}
    </span>
  );
}

export default async function Header() {
  const { userId } = await auth();
  
  let userRole: string | null = null;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    userRole = user?.role || "CLIENT";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060212]/60 backdrop-blur-xl shadow-sm transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* Logo avec le dégradé Cyber de l'image */}
        <Link href="/" className="text-xl font-black tracking-tight text-white select-none hover:opacity-90 active:scale-[0.98] transition-all">
          SOS<span className="bg-gradient-to-r from-white via-purple-300 to-cyber-magenta bg-clip-text text-transparent">Besoin</span>
        </Link>

        {/* Liens de Navigation */}
        <nav className="flex items-center gap-1 text-lg font-semibold text-slate-300">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            Accueil
          </Link>

          <Link
            href="/service-requests"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            {userRole === "PROVIDER"
              ? "Demandes"
              : userRole === "CLIENT"
                ? "Mes demandes"
                : "Demandes"}
          </Link>

          {userRole === "CLIENT" && (
            <Link
              href="/offres-recues"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
            >
              Offres reçues
            </Link>
          )}

          {userRole === "PROVIDER" && (
            <Link
              href="/offres-envoyees"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-100 transition-all duration-200"
            >
              Mes offres
            </Link>
          )}

          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-100 transition-all duration-200"
            >
              Admin
            </Link>
          )}

          {userId && <CartCount />}
          
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/test-dev"
              className="rounded-xl px-3 py-2 text-cyber-magenta hover:bg-white/5 transition-all font-mono text-xs"
            >
              [Dev]
            </Link>
          )}
        </nav>

        {/* Section Profil / Connexion */}
        <div className="flex items-center gap-3">
          {!userId ? (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                Connexion
              </Link>

              <Link
                href="/sign-up"
                className="btn-cyber-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98]"
              >
                Inscription
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-1.5 pr-2.5 shadow-inner backdrop-blur-md">
              <UserRoleBadge />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-6 w-6 border border-white/10 shadow-md hover:border-cyber-purple/50 transition-colors"
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}