import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getEstrenos } from "@/lib/estrenos";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * ESTRENOS 26/27 — REDESIGN_V2_BRIEF.md Fase 2 bloque 4 / Fase 4B.
 * Rotación diaria determinista (ver lib/estrenos.ts). Estado elegante si
 * todavía no hay productos de la temporada 26/27 importados (Fase 4A).
 */
export async function EstrenosSection() {
  const products = await getEstrenos();

  return (
    <section className="py-14 md:py-20 px-3 md:px-4 max-w-7xl mx-auto">
      <FadeInUp className="flex items-end justify-between mb-8 md:mb-10">
        <div>
          <p
            className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            El drop de hoy · se renueva cada 24h
          </p>
          <h2 className="font-display text-white text-3xl md:text-5xl uppercase">
            Estrenos 26/27
          </h2>
        </div>
        {products.length > 0 && (
          <Link
            href="/catalogo?liga=temporada-26-27"
            className="hidden md:inline text-[#C4A06A] hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver todo →
          </Link>
        )}
      </FadeInUp>

      {products.length === 0 ? (
        <div className="border border-white/10 rounded-2xl py-16 px-6 text-center">
          <p className="text-white text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-inter)" }}>
            La temporada 26/27 está por llegar
          </p>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Estamos preparando los primeros lanzamientos. Mientras tanto, explora el catálogo
            completo — hay miles de camisetas esperándote.
          </p>
          <Link
            href="/catalogo"
            className="inline-block mt-6 text-[#D95632] hover:text-[#e06a48] font-semibold uppercase tracking-widest text-xs transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver catálogo →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
