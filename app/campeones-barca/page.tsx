export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBarcaPromoStatus, isBarcaProduct, applyBarcaDiscount } from "@/lib/promo-barca";
import { BarcaCountdown } from "@/components/promo/BarcaCountdown";
import { formatCOP } from "@/lib/utils";

export const metadata: Metadata = {
  title: "🏆 Barça Campeón de Liga — 20% OFF Camisetas Barcelona | La 12 Store",
  description:
    "Celebremos el título del Barça con 20% de descuento en todas las camisetas del Barcelona. Solo por 24 horas. Envío gratis a toda Colombia.",
};

const WA_NUMBER = "573008443885";
const PLACEHOLDER = "/images/placeholder.jpg";

function buildWaMessage(name: string, discountedPrice: number): string {
  return encodeURIComponent(
    `¡Hola! 🏆 Vi la camiseta del Barça "${name}" en la promo CAMPEONES DE LIGA y quiero aprovechar el 20% de descuento. Precio con descuento: ${formatCOP(discountedPrice)}. ¿Está disponible?`
  );
}

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
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              FCB
            </span>
            <span
              className="text-[#FFD700] text-2xl sm:text-4xl font-black"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              🏆
            </span>
            <span
              className="bg-[#004D98] text-[#FFD700] font-black px-4 py-1.5 rounded-lg text-base sm:text-xl uppercase tracking-widest"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              LIGA
            </span>
          </div>

          <div>
            <p
              className="text-[#FFD700] text-[10px] sm:text-xs tracking-[0.5em] uppercase mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Celebración especial · Solo 24 horas
            </p>
            <h1
              className="text-3xl sm:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              BARÇA CAMPEÓN
              <br />
              <span
                className="font-black uppercase"
                style={{
                  fontFamily: "var(--font-oswald)",
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
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Camisetas del Barça
            <span className="ml-2 text-[#FFD700]">({products.length})</span>
          </h2>
          <Link
            href="/catalogo?liga=la-liga"
            className="text-[#9CA3AF] hover:text-white text-xs transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver todo La Liga →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">No encontramos camisetas del Barça en este momento.</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block bg-[#D4AF37] hover:bg-[#F0D060] text-black font-bold px-8 py-3 rounded-lg uppercase tracking-widest text-sm transition-colors"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Ver catálogo completo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product: (typeof products)[number]) => {
              const imgs = JSON.parse(product.images || "[]") as string[];
              const imgSrc = imgs[0] || PLACEHOLDER;

              // Precio base según tipo
              const basePrice = product.isRetro
                ? (product.priceRetro ?? 170_000)
                : (product.priceFan ?? 150_000);
              const discountedPrice = applyBarcaDiscount(basePrice);

              const waMsg = buildWaMessage(product.name, discountedPrice);
              const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

              return (
                <article
                  key={product.id}
                  className="relative bg-[#141414] rounded-xl border border-transparent hover:border-[#A50044]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#A50044]/10 group flex flex-col"
                >
                  {/* Badge -20% */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className="font-black text-[11px] px-2 py-0.5 rounded uppercase tracking-wide shadow-lg"
                      style={{
                        fontFamily: "var(--font-oswald)",
                        background: "linear-gradient(135deg, #A50044, #004D98)",
                        color: "#FFD700",
                      }}
                    >
                      -20%
                    </span>
                  </div>

                  {/* Imagen */}
                  <Link href={`/catalogo/${product.slug}`} className="block">
                    <div className="relative aspect-[3/4] bg-[#1A1A1A] rounded-t-xl overflow-hidden">
                      <Image
                        src={imgSrc}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        onError={() => {}}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1 gap-1.5">
                    <Link href={`/catalogo/${product.slug}`}>
                      <h3
                        className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#FFD700] transition-colors min-h-[2.5rem]"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {/* Precios */}
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[#FFD700] font-bold text-sm"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {formatCOP(discountedPrice)}
                      </span>
                      <span
                        className="text-[#666] text-xs line-through"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {formatCOP(basePrice)}
                      </span>
                    </div>

                    <p className="text-[#22C55E] text-[10px]">✓ Dorsal y parches gratis</p>

                    {/* CTA WhatsApp */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2 rounded-lg uppercase tracking-wide transition-colors"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
                      🛒 Comprar por WhatsApp
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <div className="text-center mt-12 px-4">
        <Link
          href="/catalogo"
          className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          ← Volver al catálogo completo
        </Link>
      </div>
    </main>
  );
}
