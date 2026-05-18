"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentFilter: string;
};

export default function FilterRequestsTabs({ currentFilter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modification du type pour refléter "Mes demandes" au lieu de "Mes propositions"
  const handleFilterChange = (filterType: "all" | "my-requests") => {
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
    <div className="flex gap-1.5 bg-[#0c0a15] border border-white/[0.06] p-1.5 rounded-xl w-full sm:w-auto shadow-2xl backdrop-blur-xl">
      
      {/* Onglet : Toutes les demandes */}
      <button
        type="button"
        onClick={() => handleFilterChange("all")}
        className={`flex-1 sm:flex-initial text-center px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
          currentFilter === "all" || !currentFilter
            ? "bg-white/[0.08] text-white border border-white/[0.15] shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            : "text-slate-400 hover:text-white border border-transparent"
        }`}
      >
        Toutes les demandes
      </button>

      {/* Onglet : Mes demandes personnelles (Ajusté pour le rôle Provider) */}
      <button
        type="button"
        onClick={() => handleFilterChange("my-requests")}
        className={`flex-1 sm:flex-initial text-center px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
          currentFilter === "my-requests"
            ? "bg-gradient-to-r from-[#7000ff] to-[#ff00e5] text-white font-black shadow-[0_0_20px_rgba(112,0,255,0.4)] border border-white/10"
            : "text-slate-400 hover:text-[#ff00e5] border border-transparent"
        }`}
      >
        Mes demandes créées
      </button>
      
    </div>
  );
}