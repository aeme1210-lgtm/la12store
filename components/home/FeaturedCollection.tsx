import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * Colección destacada — REDESIGN_V2_BRIEF.md Fase 2 bloque 6: fondo marfil
 * (rompe el negro permanente, tal como pide la paleta v2), productos reales
 * marcados isFeatured (sin "más vendido"/"últimas unidades" inventado).
 */
export async function FeaturedCollection() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-[#F1EBDD]">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <FadeInUp className="text-center mb-10">
          <p
            className="text-[#6B202B] text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Selección editorial
          </p>
          <h2 className="font-display text-[#0B0B0A] text-3xl md:text-5xl uppercase">
            Colección destacada
          </h2>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/catalogo"
            className="inline-block border border-[#6B202B] text-[#6B202B] hover:bg-[#6B202B] hover:text-[#F1EBDD] font-bold px-8 py-3 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
