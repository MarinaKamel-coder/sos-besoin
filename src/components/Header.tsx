import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { getCartCount } from "../action/cart";

async function CartCount() {
  const { userId } = await auth();
  if (!userId) return null;

  let count = 0;
  try {
    count = await getCartCount();
  } catch {
    // non authentifié ou erreur silencieuse
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.847-7.156A60.106 60.106 0 0 0 4.5 5.322M7.5 14.25 5.106 5.157M7.5 14.25l-1.75 7m13-7 1.75 7M10.5 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      Panier
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export default async function Header() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo / marque */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          SOS<span className="text-blue-600">Besoin</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Link
            href="/"
            className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Accueil
          </Link>
          <Link
            href="/service-requests"
            className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Demandes
          </Link>
          <Link
            href="/list-offers"
            className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Offres
          </Link>

          <CartCount />

          {process.env.NODE_ENV === "development" && (
            <Link
              href="/test-dev"
              className="rounded-md px-3 py-2 text-yellow-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Test Dev
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {!userId ? (
            <>
              <SignInButton>
                <button className="rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Connexion
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Inscription
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  );
}
