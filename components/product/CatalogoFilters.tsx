"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  leagues: string[];
  types: string[];
  currentParams: {
    liga?: string;
    tipo?: string;
    q?: string;
  };
}

const leagueToSlug: Record<string, string> = {
  "La Liga": "la-liga",
  "New Season": "new-season",
  Retro: "retro",
  "Premier League": "premier-league",
  "Selecciones": "selecciones",
  "Brasileirao": "brasileirao",
  "Bundesliga": "bundesliga",
  "Serie A": "serie-a",
};

export function CatalogoFilters({ leagues, types, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(currentParams.q ?? "");

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams();
    if (currentParams.liga && key !== "liga") params.set("liga", currentParams.liga);
    if (currentParams.tipo && key !== "tipo") params.set("tipo", currentParams.tipo);
    if (currentParams.q && key !== "q") params.set("q", currentParams.q);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = currentParams.liga || currentParams.tipo || currentParams.q;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label
          className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 block"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Buscar
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilter("q", search || undefined);
          }}
          placeholder="Equipo, selección..."
          className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50"
        />
      </div>

      {/* Liga */}
      <div>
        <p
          className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-3"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Liga / Competición
        </p>
        <div className="space-y-2">
          {leagues.map((league) => {
            const slug = leagueToSlug[league] ?? league.toLowerCase().replace(/\s+/g, "-");
            const active = currentParams.liga === slug;
            return (
              <button
                key={league}
                onClick={() => updateFilter("liga", active ? undefined : slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40"
                    : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                }`}
              >
                {league}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipo */}
      <div>
        <p
          className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-3"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Tipo
        </p>
        <div className="flex flex-wrap gap-2">
          {types.map((tipo) => {
            const active = currentParams.tipo === tipo;
            return (
              <button
                key={tipo}
                onClick={() => updateFilter("tipo", active ? undefined : tipo)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                  active
                    ? "bg-[#D4A017] text-black"
                    : "bg-[#1A1A1A] text-[#A0A0A0] hover:text-white border border-[#B8860B]/20"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {tipo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-[#C70101] text-sm hover:text-red-400 transition-colors"
        >
          <X size={14} />
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 bg-[#141414] border border-[#B8860B]/20 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasFilters && (
            <span className="bg-[#D4A017] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-4 bg-[#141414] border border-[#B8860B]/20 rounded-xl p-5">
            <FilterContent />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 bg-[#141414] border border-[#B8860B]/10 rounded-xl p-5">
          <h3
            className="text-white font-bold uppercase tracking-wider mb-5 text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Filtros
          </h3>
          <FilterContent />
        </div>
      </aside>
    </>
  );
}
