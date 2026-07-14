export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSuperClasicoStartTime, getSuperClasicoEndTime } from "@/lib/promo-super-clasico";
import { SuperClasicoCountdown } from "@/components/promo/SuperClasicoCountdown";
import { SuperClasicoCard } from "@/components/promo/SuperClasicoCard";

export const metadata: Metadata = {
  title: "🔥 PROMO SUPER CLÁSICO - 15% OFF Boca y River | La 12 Store",
  description:
    "Solo hoy 19 de abril. Todas las camisetas de Boca Juniors y River Plate con 15% de descuento.",
};

// ── Shared header badge ──────────────────────────────────────────────────────
function RiverVsBoca() {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-5">
      <span
        className="bg-[#D32F2F] text-white font-black px-3 md:px-5 py-2 rounded-lg text-base md:text-xl"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        RIVER
      </span>
      <span
        className="text-[#D4AF37] text-xl md:text-3xl font-black"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        VS
      </span>
      <span
        className="bg-[#003087] text-[#FFD700] font-black px-3 md:px-5 py-2 rounded-lg text-base md:text-xl"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        BOCA
      </span>
    </div>
  );
}

export default async function SuperClasicoPage() {
  const now = new Date();
  const start = getSuperClasicoStartTime();
  const end = getSuperClasicoEndTime();

  // ── DESPUÉS de la promo ───────────────────────────────────────────────────
  if (now > end) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
        <RiverVsBoca />
        <div>
          <h1
            className="text-3xl md:text-4xl font-black text-white mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            La promo terminó
          </h1>
          <p className="text-[#9CA3AF] text-sm">
            El Super Clásico ya pasó, pero nuestras camisetas siguen disponibles.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="bg-[#D4AF37] hover:bg-[#F0D060] text-black font-bold px-8 py-3 rounded-lg uppercase tracking-widest text-sm transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Ver catálogo completo
        </Link>
      </div>
    );
  }

  // ── ANTES de la promo ─────────────────────────────────────────────────────
  if (now < start) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-5">
          <RiverVsBoca />

          <div>
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Próximamente
            </p>
            <h1
              className="text-3xl md:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              PROMO SUPER CLÁSICO
            </h1>
          </div>

          <p
            className="text-[#D32F2F] text-lg md:text-xl font-black"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            🔥 15% OFF en todas las camisetas de Boca y River
          </p>

          <p className="text-[#9CA3AF] text-sm">
            Solo el 19 de abril 2026 · 00:00 a 23:59 (hora Colombia)
          </p>

          <div>
            <p
              className="text-white text-[10px] uppercase tracking-widest font-semibold mb-3"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              La promo comienza en:
            </p>
            <SuperClasicoCountdown targetTime={start.toISOString()} mode="start" />
          </div>

          <Link
            href="/catalogo"
            className="inline-block text-[#D4AF37] hover:text-[#F0D060] text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Explorar catálogo →
          </Link>
        </div>
      </div>
    );
  }

  // ── DURANTE la promo — cargar productos ───────────────────────────────────
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: "Boca", mode: "insensitive" } },
        { name: { contains: "River", mode: "insensitive" } },
      ],
    },
    orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      team: true,
      images: true,
      sizes: true,
      priceFan: true,
      pricePlayer: true,
      priceRetro: true,
      isRetro: true,
    },
  });

  return (
    <div className="min-h-screen">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F]/15 via-transparent to-[#003087]/15 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-16 text-center space-y-4">
          <RiverVsBoca />

          <div>
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Oferta exclusiva · Solo hoy
            </p>
            <h1
              className="text-3xl md:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              PROMO SUPER CLÁSICO
            </h1>
          </div>

          <p
            className="text-[#D32F2F] text-lg md:text-2xl font-black"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            🔥 15% OFF — 19 de abril · Hora Colombia
          </p>
          <p className="text-[#9CA3AF] text-sm">
            Todas las camisetas de Boca Juniors y River Plate con descuento
          </p>

          {/* Cronómetro */}
          <div className="pt-2">
            <p
              className="text-white text-[10px] uppercase tracking-widest font-semibold mb-3"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Termina en:
            </p>
            <SuperClasicoCountdown targetTime={end.toISOString()} mode="end" />
          </div>
        </div>
      </div>

      {/* ── Producto grid ── */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-10">
        <p
          className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-6 text-center"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {products.length} camisetas con 15% de descuento
        </p>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#666] text-lg">No se encontraron productos disponibles.</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block text-[#D4AF37] text-sm font-semibold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ver catálogo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((p: (typeof products)[number]) => (
              <SuperClasicoCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
