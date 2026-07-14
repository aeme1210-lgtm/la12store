"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  leagues: string[];
  types: string[];
  colors: string[];
  currentParams: {
    liga?: string;
    tipo?: string;
    color?: string;
    q?: string;
  };
}

const leagueToSlug: Record<string, string> = {
  "La Liga": "la-liga",
  "New Season": "new-season",
  Retro: "retro",
  "Premier League": "premier-league",
  "Serie A": "serie-a",
  Bundesliga: "bundesliga",
  "Selecciones Nacionales": "selecciones-nacionales",
  Brasileirao: "brasileirao",
  "Other Clubs": "other-clubs",
  "Ligue 1": "ligue-1",
  "Mundial FIFA 2026": "mundial-fifa-2026",
  "Liga Argentina": "liga-argentina",
};

export function CatalogoFilters({ leagues, types, colors, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState(currentParams.q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams();
    if (currentParams.liga && key !== "liga") params.set("liga", currentParams.liga);
    if (currentParams.tipo && key !== "tipo") params.set("tipo", currentParams.tipo);
    if (currentParams.color && key !== "color") params.set("color", currentParams.color);
    if (currentParams.q && key !== "q") params.set("q", currentParams.q);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    setSearch("");
    router.push(pathname);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilter("q", val.trim() || undefined);
    }, 500);
  }

  function handleSearchEnter() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateFilter("q", search.trim() || undefined);
  }

  const hasFilters = currentParams.liga || currentParams.tipo || currentParams.color || currentParams.q;
  const filterCount = [currentParams.liga, currentParams.tipo, currentParams.color, currentParams.q].filter(Boolean).length;

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label
          className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-2 block"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Buscar
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearchEnter(); }}
          placeholder="Equipo, selección..."
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        />
      </div>

      {/* Liga */}
      <div>
        <p
          className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-3"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Liga / Competición
        </p>
        <div className="space-y-0.5">
          {leagues.map((league) => {
            const slug = leagueToSlug[league] ?? league.toLowerCase().replace(/\s+/g, "-");
            const active = currentParams.liga === slug;
            return (
              <button
                key={league}
                onClick={() => {
                  updateFilter("liga", active ? undefined : slug);
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] font-semibold"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
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
          className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-3"
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
                onClick={() => {
                  updateFilter("tipo", active ? undefined : tipo);
                  setDrawerOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                  active
                    ? "bg-[#D4AF37] text-black"
                    : "bg-[#1A1A1A] text-[#9CA3AF] hover:text-white border border-white/10"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {tipo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color */}
      {colors.length > 0 && (
        <div>
          <p
            className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = currentParams.color === color;
              return (
                <button
                  key={color}
                  onClick={() => {
                    updateFilter("color", active ? undefined : color);
                    setDrawerOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
                    active
                      ? "bg-[#D4AF37] text-black"
                      : "bg-[#1A1A1A] text-[#9CA3AF] hover:text-white border border-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => { clearAll(); setDrawerOpen(false); }}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <X size={14} />
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── MOBILE: button + bottom drawer ── */}
      <div className="lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-[#141414] border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full justify-between"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Filtros
            {filterCount > 0 && (
              <span className="bg-[#D4AF37] text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {filterCount}
              </span>
            )}
          </span>
          <span className="text-[#9CA3AF] text-xs">▼</span>
        </button>

        {/* Backdrop + bottom sheet */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[9990] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative bg-[#141414] rounded-t-2xl border-t border-[#D4AF37]/20 p-6 pb-10 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-white font-bold uppercase tracking-wider text-sm"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  Filtros
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-[#9CA3AF] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-28 bg-[#111111] border border-white/5 rounded-xl p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <h3
            className="text-white font-bold uppercase tracking-wider mb-5 text-xs"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Filtros
          </h3>
          {filterContent}
        </div>
      </aside>
    </>
  );
}
