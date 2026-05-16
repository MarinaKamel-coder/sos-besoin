import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/src/lib/prisma";
import AdminNav from "@/src/components/admin/AdminNav";
import DeleteRequestAdminButton from "@/src/components/admin/DeleteRequestAdminButton";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouverte",
  FILLED: "Complétée",
  CANCELLED: "Annulée",
  HIDDEN: "Masquée",
};

export default async function AdminServiceRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    redirect("/");
  }

  const serviceRequests = await prisma.serviceRequest.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      _count: { select: { offers: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-100 bg-slate-950 min-h-screen space-y-6">
      <AdminNav active="requests" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Gestion des demandes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez et supervisez les demandes publiées par les clients.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-900 bg-slate-900/40 p-4">
        {serviceRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-900/60 bg-slate-950/80 p-8 text-center text-slate-500">
            Aucune demande disponible.
          </div>
        ) : (
          <ul className="space-y-4">
            {serviceRequests.map((request) => (
              <li key={request.id} className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2 py-1">{STATUS_LABELS[request.status]}</span>
                      <span>•</span>
                      <span>{request._count.offers} offre(s)</span>
                    </div>
                    <Link href={`/service-requests/${request.id}`} className="text-lg font-bold text-white hover:text-blue-400">
                      {request.title}
                    </Link>
                    <p className="text-sm text-slate-400 line-clamp-2">{request.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3 text-sm text-slate-300">
                    <div className="text-right">
                      <p className="font-semibold text-white">Client</p>
                      <p>{request.client.name ?? request.client.email}</p>
                    </div>
                    <DeleteRequestAdminButton requestId={request.id} />
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
