"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/**
 * "Encuentra tu camiseta" — buscador guiado exigido por el brief (§6):
 * selección/club, estilo, versión, presupuesto y talla, 100% local (sin IA
 * externa ni APIs de pago). Construye una URL de /catalogo con los filtros
 * reales que ya soporta la página (ver app/catalogo/page.tsx buildWhere).
 */

const LIGA_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "selecciones-nacionales", label: "Selecciones Nacionales" },
  { value: "la-liga", label: "La Liga" },
  { value: "premier-league", label: "Premier League" },
  { value: "serie-a", label: "Serie A" },
  { value: "bundesliga", label: "Bundesliga" },
  { value: "liga-argentina", label: "Liga Argentina" },
  { value: "brasileirao", label: "Brasileirao" },
  { value: "mundial-fifa-2026", label: "Mundial 2026" },
];

const PRESUPUESTO_OPTIONS = [
  { value: "", label: "Sin límite" },
  { value: "150000", label: "Hasta $150.000" },
  { value: "170000", label: "Hasta $170.000" },
  { value: "180000", label: "Hasta $180.000" },
];

const TALLA_OPTIONS = ["", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

export function ShirtFinder() {
  const router = useRouter();
  const [liga, setLiga] = useState("");
  const [estilo, setEstilo] = useState<"moderno" | "retro">("moderno");
  const [version, setVersion] = useState<"Fan" | "Player">("Fan");
  const [precioMax, setPrecioMax] = useState("");
  const [talla, setTalla] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (estilo === "retro") {
      params.set("liga", "retro");
    } else if (liga) {
      params.set("liga", liga);
    }
    if (version === "Player") params.set("version", "Player");
    if (precioMax) params.set("precioMax", precioMax);
    if (talla) params.set("talla", talla);
    router.push(`/catalogo?${params.toString()}`);
  }

  const selectClass =
    "w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
  const labelClass =
    "text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-1.5 block";

  return (
    <section className="py-12 md:py-20 px-3 md:px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <p
          className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-2"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Guiado, gratis, sin vueltas
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-[#FAFAFA]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Encuentra tu camiseta
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#111111] border border-white/10 rounded-2xl p-5 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div>
          <label htmlFor="finder-estilo" className={labelClass}>
            Estilo
          </label>
          <select
            id="finder-estilo"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value as "moderno" | "retro")}
            className={selectClass}
          >
            <option value="moderno">Moderno</option>
            <option value="retro">Retro</option>
          </select>
        </div>

        <div>
          <label htmlFor="finder-liga" className={labelClass}>
            Selección o club
          </label>
          <select
            id="finder-liga"
            value={liga}
            onChange={(e) => setLiga(e.target.value)}
            disabled={estilo === "retro"}
            className={`${selectClass} ${estilo === "retro" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {LIGA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="finder-version" className={labelClass}>
            Versión
          </label>
          <select
            id="finder-version"
            value={version}
            onChange={(e) => setVersion(e.target.value as "Fan" | "Player")}
            className={selectClass}
          >
            <option value="Fan">Fan</option>
            <option value="Player">Jugador</option>
          </select>
        </div>

        <div>
          <label htmlFor="finder-presupuesto" className={labelClass}>
            Presupuesto
          </label>
          <select
            id="finder-presupuesto"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className={selectClass}
          >
            {PRESUPUESTO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="finder-talla" className={labelClass}>
            Talla
          </label>
          <select
            id="finder-talla"
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            className={selectClass}
          >
            {TALLA_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t || "Cualquiera"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="sm:col-span-2 lg:col-span-5 mt-2 flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold py-3.5 rounded-xl uppercase tracking-widest text-sm transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Search size={16} aria-hidden="true" />
          Buscar mi camiseta
        </button>
      </form>
    </section>
  );
}
