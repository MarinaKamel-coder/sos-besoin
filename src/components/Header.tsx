import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-4 w-4 text-slate-400 group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.847-7.156A60.106 60.106 0 0 0 4.5 5.322M7.5 14.25 5.106 5.157M7.5 14.25l-1.75 7m13-7 1.75 7M10.5 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span>Panier</span>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-[9px] font-black text-white ring-2 ring-slate-950 animate-fade-in">
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
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400" 
    },
    PROVIDER: {
      label: "🔧 Provider",
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    ADMIN: { 
      label: "🔐 Admin", 
      color: "bg-rose-500/10 border-rose-500/20 text-rose-400" 
    },
  };

  const config = roleConfig[user.role] || roleConfig.CLIENT;

  return (
    <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${config.color}`}>
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
    <header className="sticky top-0 z-50 border-b border-slate-900/60 bg-slate-950/75 backdrop-blur-xl shadow-sm shadow-slate-950/20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-tight text-white select-none hover:opacity-90 active:scale-[0.98] transition-all">
          SOS<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Besoin</span>
        </Link>

        {/* Liens de Navigation */}
        <nav className="flex items-center gap-1 text-m font-bold text-slate-400">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
          >
            Accueil
          </Link>

          <Link
            href="/service-requests"
            className="rounded-xl px-3 py-2 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
          >
            {userRole === "PROVIDER"
              ? "Demandes du marché"
              : userRole === "CLIENT"
                ? "Mes demandes"
                : "Demandes"}
          </Link>

          {userRole === "CLIENT" && (
            <Link
              href="/offres-recues"
              className="rounded-xl px-3 py-2 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
            >
              Offres reçues
            </Link>
          )}

          {userRole === "PROVIDER" && (
            <Link
              href="/offres-envoyees"
              className="rounded-xl px-3 py-2 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
            >
              Mes offres
            </Link>
          )}

          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
            >
              Admin
            </Link>
          )}

          {userId && <CartCount />}
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/test-dev"
              className="rounded-xl px-3 py-2 text-amber-500 hover:bg-slate-900 transition-all font-mono"
            >
              [Dev]
            </Link>
          )}
        </nav>

        {/* Section Profil / Connexion */}
        <div className="flex items-center gap-3">
          {!userId ? (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="rounded-xl px-4 py-2 text-s font-bold text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all duration-200">
                  Connexion
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-s font-bold text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 transition-all duration-200 active:scale-[0.98]">
                  Inscription
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-slate-900/30 border border-slate-900/80 rounded-xl p-1.5 pr-2.5 shadow-inner">
              <UserRoleBadge />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-6 w-6 border border-slate-800 shadow-md"
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