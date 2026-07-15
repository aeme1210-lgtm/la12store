export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBarcaPromoStatus } from "@/lib/promo-barca";
import { BarcaCountdown } from "@/components/promo/BarcaCountdown";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "🏆 Barça Campeón de Liga — 20% OFF Camisetas Barcelona | La 12 Store",
  description:
    "Celebremos el título del Barça con 20% de descuento en todas las camisetas del Barcelona. Solo por 24 horas.",
};

export default async function CampeonesBarcaPage() {
  const promo = await getBarcaPromoStatus();

  // ── Sin promo activa: redirigir ───────────────────────────────────────────
  if (!promo.active || !promo.endAt) {
    redirect("/catalogo");
  }

  // ── Consultar productos del Barça ─────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: "Barcelona", mode: "insensitive" } },
        { name: { contains: "Barca",     mode: "insensitive" } },
        { name: { contains: "Barça",     mode: "insensitive" } },
      ],
    },
    orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const endAtISO = promo.endAt.toISOString();

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-20 pb-16">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative px-4 py-10 text-center overflow-hidden">
        {/* Gradiente de fondo */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, #A50044 0%, #A50044 45%, #004D98 55%, #004D98 100%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Escudo badge */}
          <div className="flex items-center gap-3">
            <span
              className="bg-[#A50044] text-white font-black px-4 py-1.5 rounded-lg text-base sm:text-xl uppercase tracking-widest"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              FCB
            </span>
            <span
              className="text-[#FFD700] text-2xl sm:text-4xl font-black"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              🏆
            </span>
            <span
              className="bg-[#004D98] text-[#FFD700] font-black px-4 py-1.5 rounded-lg text-base sm:text-xl uppercase tracking-widest"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              LIGA
            </span>
          </div>

          <div>
            <p
              className="text-[#FFD700] text-[10px] sm:text-xs tracking-[0.5em] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Celebración especial · Solo 24 horas
            </p>
            <h1
              className="text-3xl sm:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              BARÇA CAMPEÓN
              <br />
              <span
                className="font-black uppercase"
                style={{
                  fontFamily: "var(--font-inter)",
                  background: "linear-gradient(90deg, #A50044, #FFD700, #004D98)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "clamp(2.5rem, 8vw, 5rem)",
                }}
              >
                20% OFF
              </span>
            </h1>
          </div>

          <p className="text-[#9CA3AF] text-sm sm:text-base max-w-md">
            Celebremos el título de LaLiga con 20% de descuento en todas las
            camisetas del FC Barcelona. Solo mientras dure el cronómetro.
          </p>
        </div>
      </section>

      {/* ── CRONÓMETRO ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-10 max-w-2xl mx-auto">
        <BarcaCountdown endAt={endAtISO} />
      </section>

      {/* ── GRID DE PRODUCTOS ─────────────────────────────────────────────── */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-white font-black text-xl sm:text-2xl uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Camisetas del Barça
            <span className="ml-2 text-[#FFD700]">({products.length})</span>
          </h2>
          <Link
            href="/catalogo?liga=la-liga"
            className="text-[#9CA3AF] hover:text-white text-xs transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver todo La Liga →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">No encontramos camisetas del Barça en este momento.</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block bg-[#A47C42] hover:bg-[#C4A06A] text-black font-bold px-8 py-3 rounded-lg uppercase tracking-widest text-sm transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ver catálogo completo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product: (typeof products)[number]) => (
              <ProductCard
                key={product.id}
                product={product}
                showBarcaBadge
                discountPercent={20}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <div className="text-center mt-12 px-4">
        <Link
          href="/catalogo"
          className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          ← Volver al catálogo completo
        </Link>
      </div>
    </main>
  );
}
