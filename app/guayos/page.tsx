export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GUAYOS, isGuayosUnlocked } from "@/lib/launches";
import { ProductCard } from "@/components/product/ProductCard";
import { GuayosTile } from "@/components/home/GuayosTile";

export const metadata: Metadata = {
  title: "Guayos — Aniversario",
  description: "Guayos de fútbol en La 12 Store. Colección del aniversario.",
};

/**
 * Catálogo completo de guayos. Antes de la hora de apertura muestra el mismo
 * bloque con candado y cuenta regresiva que la portada (no lista productos).
 */
export default async function GuayosPage() {
  const unlocked = isGuayosUnlocked();
  const products = await prisma.product.findMany({
    where: { isActive: true, league: GUAYOS.league },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  const images = products
    .map((p) => (JSON.parse(p.images || "[]") as string[])[0])
    .filter((src): src is string => !!src)
    .slice(0, 40);

  return (
    <section className="pt-8 md:pt-12 pb-20 px-3 md:px-6 max-w-7xl mx-auto">
      {!unlocked ? (
        <GuayosTile images={images} total={products.length} unlockAt={GUAYOS.unlockAt.toISOString()} initiallyUnlocked={false} />
      ) : (
        <>
          <p
            className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Aniversario La 12 Store
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl uppercase mb-3">Guayos</h1>
          <p className="text-white/60 mb-10" style={{ fontFamily: "var(--font-inter)" }}>
            {products.length > 0 ? `${products.length} modelos disponibles.` : "Estamos cargando los modelos."}
          </p>
          {products.length === 0 ? (
            <p className="text-white/60 py-16 text-center">
              Muy pronto aquí.{" "}
              <Link href="/catalogo" className="text-[#C4A06A] underline">
                Mientras tanto, mira las camisetas
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
