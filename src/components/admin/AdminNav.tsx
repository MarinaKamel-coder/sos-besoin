import Link from "next/link";

type AdminNavProps = {
  active: "dashboard" | "requests" | "offers";
};

const navLinks: Array<{ label: string; href: string; key: AdminNavProps["active"] }> = [
  { label: "Dashboard admin", href: "/admin", key: "dashboard" },
  { label: "Gérer les demandes", href: "/admin/service-requests", key: "requests" },
  { label: "Gérer les offres", href: "/admin/offers", key: "offers" },
];

export default function AdminNav({ active }: AdminNavProps) {
  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-900/50 p-4">
      <div className="flex flex-wrap gap-3">
        {navLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
              active === link.key
                ? "bg-slate-100 text-slate-950 shadow-sm"
                : "border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-900/80 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
