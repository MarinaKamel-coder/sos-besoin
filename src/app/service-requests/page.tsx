import Link from "next/link";
import { getPaginatedServiceRequests } from "@/src/lib/requetes/serviceRequests";
import Pagination from "@/src/components/Pagination";
import { RequestStatus } from "@/src/generated/prisma/client";

// cette fonction sert a verifier que la valeur recue est bien en RequestStatus
function parseStatus(value?: string): RequestStatus | undefined {
    if (!value) return undefined;
    const allowed = ["OPEN", "FILLED", "CANCELLED", "HIDDEN"];
    return allowed.includes(value) ? (value as RequestStatus) : undefined;
}

export default async function Page({
    searchParams, 
}: {
    searchParams: Promise<{
        page?: string;
        q?: string;
        status?: string;
    }>;
}) {
    const params = await searchParams;

    const page = Number(params.page ?? 1);
    const q = params.q;
    const status = parseStatus(params.status);

    const { items, meta } = await getPaginatedServiceRequests({
        page, 
        q, 
        status, 
    });

    return (
        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Demandes urgentes</h1>  
       
          <p className="text-sm text-gray-600 mb-4">
            {meta.totalCount} resultat{meta.totalCount > 1 ? "s" : ""} - Page{" "}
            {meta.currentPage} sur {meta.totalPages}
          </p>

            {items.length === 0 ? (
              <div className="border rounded p-8 text center text-gray-500">
                Aucune demande trouvee.
              </div>  
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="border rounded p-4 hover: bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-lg">
                          <Link
                            href={`/service-requests/${item.id}`}
                            className="hover:underline"
                          >
                            {item.title}
                          </Link>
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>Par {item.client.name ?? item.client.email}</span>  
                          <span>•</span>
                          <span>{item._count.offers} offre(s)</span>
                          {item.location && (
                            <>
                            <span>•</span>
                            <span>{item.location}</span>
                            </>
                          )}  
                        </div>
                      </div>  
                      <span className="text-xs border rounded px-2 py-1 bg-gray-100">
                        {item.status}
                      </span>
                    </div>
                  </li>  
                ))}
              </ul>  
            )}

            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              basePath="/service-requests"
              extraParams={{ q, status }}
            />
        </main>
    );    
}