"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type SearchBarProps = {
  placeholder?: string;
  delay?: number; // debounce en ms (default: 300ms)
};

export default function SearchBar({
  placeholder = "Rechercher une demande...",
  delay = 300,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      params.delete("page"); // Reset de la pagination sur une nouvelle recherche

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, pathname, router]);

  return (
    <div className="relative w-full group">
      {/* Icône de recherche (Loupe) à gauche */}
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </span>

      {/* Input de recherche textuel */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white/[0.02] text-sm text-slate-100 placeholder-slate-600 rounded-xl border border-white/5 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 font-medium"
      />

      {/* Indicateur d'état (Spinner ou Clear Button) à droite */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4">
        {isPending ? (
          <svg
            className="animate-spin text-purple-400 w-3.5 h-3.5 shadow-[0_0_8px_rgba(168,85,247,0.3)] rounded-full"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-10"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          value && (
            <button
              onClick={() => setValue("")}
              type="button"
              className="text-slate-500 hover:text-slate-300 transition-colors duration-150"
              aria-label="Effacer la recherche"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}