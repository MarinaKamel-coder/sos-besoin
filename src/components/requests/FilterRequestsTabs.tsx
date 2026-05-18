"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentFilter: string;
};

export default function FilterRequestsTabs({ currentFilter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filterType: "all" | "my-offers") => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Réinitialise la pagination à la page 1 lors d'un changement d'onglet
    params.delete("page");

    if (filterType === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filterType);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-1.5 bg-black border border-white/5 p-1 rounded-xl w-full sm:w-auto">
      <button
        type="button"
        onClick={() => handleFilterChange("all")}
        className={`flex-1 sm:flex-initial text-center px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-150 ${
          currentFilter === "all"
            ? "bg-white/5 text-white border border-white/10"
            : "text-slate-400 hover:text-slate-200 border border-transparent"
        }`}
      >
        Toutes les demandes
      </button>

      <button
        type="button"
        onClick={() => handleFilterChange("my-offers")}
        className={`flex-1 sm:flex-initial text-center px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-150 ${
          currentFilter === "my-offers"
            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            : "text-slate-400 hover:text-purple-400 border border-transparent"
        }`}
      >
        Mes propositions
      </button>
    </div>
  );
}