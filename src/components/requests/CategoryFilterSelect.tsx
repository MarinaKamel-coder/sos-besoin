"use client";

import { useRouter, useSearchParams } from "next/navigation";

type CategoryItem = {
  id: string;
  name: string;
};

type Props = {
  categories: CategoryItem[];
  currentCategory: string;
};

export default function CategoryFilterSelect({ categories, currentCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (id: string) => {
    // Crée une copie des paramètres URL actuels pour ne pas écraser la recherche (q) ou le filtre d'offres
    const params = new URLSearchParams(searchParams.toString());
    
    // Réinitialise la pagination à la page 1 lors d'un changement de filtre
    params.delete("page");

    if (!id) {
      params.delete("category");
    } else {
      params.set("category", id);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative inline-block w-full sm:w-48">
      <select
        value={currentCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        aria-label="Filtrer par catégorie"
        className="w-full appearance-none bg-black border border-white/5 text-slate-300 rounded-xl pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer [color-scheme:dark]"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id} className="bg-slate-950 text-slate-300">
            {cat.name}
          </option>
        ))}
      </select>

      {/* Flèche subtile du sélecteur */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-slate-500/80">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}