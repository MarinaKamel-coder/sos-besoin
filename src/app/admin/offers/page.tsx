import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import AdminNav from "@/src/components/admin/AdminNav";
import DeleteOfferAdminButton from "@/src/components/admin/DeleteOfferAdminButton";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  WITHDRAWN: "Retirée",
};

export default async function AdminOffersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/");
  }

  const offers = await prisma.offer.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      request: { select: { title: true, status: true } },
      provider: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      <AdminNav active="offers" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Gestion des offres</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez les offres soumises par les prestataires et suivez leur statut.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4">
        {offers.length === 0 ? (
          <div className="rounded-2xl border border-slate-900/60 bg-slate-950/80 p-8 text-center text-slate-500">
            Aucune offre disponible.
          </div>
        ) : (
          <ul className="space-y-4">
            {offers.map((offer) => (
              <li key={offer.id} className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2 py-1">{STATUS_LABELS[offer.status]}</span>
                    </div>
                    <Link href={`/service-requests/${offer.request.id}`} className="text-lg font-bold text-white hover:text-purple-400">
                      {offer.request.title}
                    </Link>
                    <p className="text-sm text-slate-400">{offer.provider.name ?? offer.provider.email}</p>
                    <p className="text-sm text-slate-400">{offer.message}</p>
                  </div>

                  <div className="flex min-w-[150px] flex-col items-end gap-3 text-right">
                    <div>
                      <p className="text-lg font-bold text-white">{(offer.price / 100).toFixed(2)} $</p>
                      <p className="text-xs text-slate-500 mt-2">Statut demande : {offer.request.status}</p>
                    </div>
                    <DeleteOfferAdminButton offerId={offer.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
