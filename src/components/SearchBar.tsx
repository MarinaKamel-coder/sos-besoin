"use client";

import { useEffect, useState, useTransition } from "react";
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

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (value.trim()) {
                params.set("q", value.trim());
            } else {
                params.delete("q");
            }

            params.delete("page"); // reset pagination on new search

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay, pathname, router, searchParams]);

    return (
        <div className="relative w-full max-w-md mb-4">
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {isPending && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                ...
            </span>
          )}    
        </div>
    );
}
