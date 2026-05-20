import Link from "next/link";

type AdminNavProps = {
  active: "dashboard" | "requests" | "offers" | "transactions";
};

const navLinks: Array<{ label: string; href: string; key: AdminNavProps["active"] }> = [
  { label: "Dashboard admin", href: "/admin", key: "dashboard" },
  { label: "Gérer les demandes", href: "/admin/service-requests", key: "requests" },
  { label: "Gérer les offres", href: "/admin/offers", key: "offers" },
  { label: "Transactions", href: "/api/dashboard/payments", key: "transactions" },
];

export default function AdminNav({ active }: AdminNavProps) {
  return (
    <div className="cyber-card rounded-2xl p-3 border-white/5 bg-white/[0.01]">
      <div className="flex flex-wrap gap-2">
        {navLinks.map((link) => {
          const isActive = active === link.key;
          return (
            <Link
              key={link.key}
              href={link.href}
              className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.12)]"
                  : "border border-white/5 bg-transparent text-slate-400 hover:border-white/10 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}