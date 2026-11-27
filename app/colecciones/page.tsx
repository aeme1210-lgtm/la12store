export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";

export const metadata: Metadata = {
  title: "Colecciones",
  description:
    "Colecciones curadas de camisetas de fútbol: Mundial 2026, retro de los 90, Argentina y Boca, selecciones de leyenda, noches de Champions y la Tricolor.",
};

export default function ColeccionesPage() {
  return (
    <section className="pt-10 md:pt-16 pb-20 px-3 md:px-6 max-w-7xl mx-auto">
      <p
        className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-3"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Curadas por La 12
      </p>
      <h1 className="font-display text-white text-4xl md:text-6xl uppercase mb-4">Colecciones</h1>
      <p className="text-white/60 max-w-xl mb-10 md:mb-14" style={{ fontFamily: "var(--font-inter)" }}>
        No todo el mundo quiere buscar entre miles de camisetas. Aquí las agrupamos por historia,
        época y pasión.
      </p>
      <CollectionsShowcase />
    </section>
  );
}
