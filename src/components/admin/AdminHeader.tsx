import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import prisma from "@/src/lib/prisma";

export default async function AdminHeader() {
  const { userId } = await auth();
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId } })
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060212]/60 backdrop-blur-xl shadow-sm transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-black tracking-tight text-white select-none hover:opacity-90 active:scale-[0.98] transition-all">
          SOS<span className="bg-gradient-to-r from-white via-purple-300 to-cyber-magenta bg-clip-text text-transparent">Besoin</span>
        </Link>

        <nav className="flex items-center gap-1 text-lg font-semibold text-slate-300">
          <Link
            href="/admin"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            Dashboard admin
          </Link>

          <Link
            href="/admin/service-requests"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            Gérer les demandes
          </Link>

          <Link
            href="/admin/offers"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            Gérer les offres
          </Link>

          <Link
            href="/api/dashboard/payments"
            className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-slate-50 transition-all duration-200"
          >
            Transactions
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-1.5 pr-2.5 shadow-inner backdrop-blur-md">
          <span className="rounded-lg border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm bg-cyber-magenta/10 border-cyber-magenta/30 text-magenta-300 shadow-[0_0_12px_rgba(217,70,239,0.1)]">
            🔐 Admin
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-6 w-6 border border-white/10 shadow-md hover:border-cyber-purple/50 transition-colors",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
