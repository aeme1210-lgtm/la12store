export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { MessageCircle } from "lucide-react";

import { Hero } from "@/components/home/Hero";
import { EstrenosSection } from "@/components/home/EstrenosSection";
import { WorldsGrid, type World } from "@/components/home/WorldsGrid";
import { KIDS_NAME_FRAGMENTS } from "@/lib/product-rules";
import { TrustBar } from "@/components/home/TrustBar";
import { Manifesto } from "@/components/home/Manifesto";
import { Lookbook } from "@/components/home/Lookbook";
import { VersionGuide } from "@/components/home/VersionGuide";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { ShirtFinder } from "@/components/home/ShirtFinder";
import { ComoComprar } from "@/components/home/ComoComprar";
import { FadeInUp } from "@/components/ui/ScrollAnimations";
import { whatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "La 12 Store | Camisetas de Fútbol Premium",
  description:
    "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío gratis a todo el país. Selecciones, ligas europeas y sudamericanas. Santa Marta, Colombia.",
};

async function getTrendingProducts() {
  const terms = [
    "Barcelona", "Real Madrid", "Colombia", "Argentina",
    "Manchester United", "PSG", "Inter Milan", "Boca Juniors",
    "Bayern", "Liverpool",
  ];
  const results = await Promise.all(
    terms.map((t) =>
      prisma.product.findFirst({
        // Sin 26/27 (ya están en Estrenos → evita duplicados en portada) y sin niño/bebé.
        where: {
          isActive: true,
          name: { contains: t },
          league: { not: "Temporada 26/27" },
          AND: KIDS_NAME_FRAGMENTS.map((f) => ({
            NOT: { name: { contains: f, mode: "insensitive" as const } },
          })),
        },
        orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      })
    )
  );
  const unique = results.filter((p: (typeof results)[number]) => p !== null);
  if (unique.length >= 4) return unique.slice(0, 8);
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
}

const VB = "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/";

// Primer elemento = mundo dominante en la composición asimétrica (WorldsGrid).
const WORLDS: World[] = [
  { name: "Selecciones",    subtitle: "Nacionales",  slug: "selecciones-nacionales", video: `${VB}Selecciones.mp4` },
  { name: "La Liga",        subtitle: "España",      slug: "la-liga",                video: `${VB}LigaE.mp4` },
  { name: "Premier League", subtitle: "Inglaterra",  slug: "premier-league",         video: `${VB}premier%20league%20(1).mp4` },
  { name: "Serie A",        subtitle: "Italia",      slug: "serie-a",                video: `${VB}Serie%20A.mp4` },
  { name: "Retro",          subtitle: "Clásicas",    slug: "retro",                  video: `${VB}Retro.mp4` },
  { name: "Bundesliga",     subtitle: "Alemania",    slug: "bundesliga",             video: `${VB}Bundesliga.mp4` },
  { name: "Liga Argentina", subtitle: "Argentina",   slug: "liga-argentina",         video: `${VB}WhatsApp%20Video%202026-04-01%20at%2019.43.52.mp4` },
  { name: "Brasileirao",    subtitle: "Brasil",      slug: "brasileirao",            video: `${VB}Brasileirao.mp4` },
];

export default async function HomePage() {
  const trending = await getTrendingProducts();

  return (
    <>
      {/* ── HERO ── */}
      <Hero />

      {/* ── PROMESAS — redesign-v3 ── */}
      <TrustBar />

      {/* ── COLECCIONES EDITORIALES — redesign-v3: la marca guía, no el listado ── */}
      <section className="py-16 md:py-24 px-3 md:px-6 max-w-7xl mx-auto">
        <FadeInUp className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p
              className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Curadas por La 12
            </p>
            <h2 className="font-display text-white text-3xl md:text-5xl uppercase">Colecciones</h2>
          </div>
          <Link
            href="/colecciones"
            className="text-[#C4A06A] hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver todas →
          </Link>
        </FadeInUp>
        <CollectionsShowcase />
      </section>

      {/* ── MANIFIESTO — marfil ── */}
      <Manifesto />

      {/* ── ESTRENOS 26/27 ── */}
      <EstrenosSection />

      {/* ── LOOKBOOK — fotos reales ── */}
      <Lookbook />

      {/* ── MUNDOS — composición asimétrica ── */}
      <section className="py-14 md:py-20 bg-[#181816]">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <FadeInUp className="text-center mb-10">
            <p
              className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Explora
            </p>
            <h2 className="font-display text-white text-3xl md:text-5xl uppercase">
              Elige tu mundo
            </h2>
          </FadeInUp>

          <WorldsGrid worlds={WORLDS} />
        </div>
      </section>

      {/* ── FAN / JUGADOR / RETRO ── */}
      <VersionGuide />

      {/* ── 7. DESTACADOS — grilla limpia, sin animar cada producto ── */}
      <section className="py-14 md:py-20 px-3 md:px-4 max-w-7xl mx-auto">
        <FadeInUp className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {/* Antes decía "Lo más pedido" sin datos de ventas que lo
                  respalden (la selección es por nombre de club). */}
              Los que nunca pasan de moda
            </p>
            <h2 className="font-display text-white text-3xl md:text-5xl uppercase">
              Clásicos de la casa
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden md:inline text-[#C4A06A] hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver todo →
          </Link>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product: (typeof trending)[number]) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/catalogo"
            className="text-[#C4A06A] font-semibold uppercase tracking-widest text-xs"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      {/* ── 8. ENCUENTRA TU CAMISETA — buscador guiado ── */}
      <ShirtFinder />

      {/* ── 9. NOSOTROS — full-bleed ── */}
      <NosotrosSection />

      {/* ── 10. CÓMO COMPRAR ── */}
      <ComoComprar />

      {/* ── CTA de cierre ── */}
      <section className="py-12 md:py-16 bg-[#181816] border-t border-white/5">
        <FadeInUp className="max-w-xl mx-auto text-center px-4">
          <h2 className="font-display text-white text-2xl md:text-3xl uppercase mb-3">
            Dorsal y parches <span className="text-[#C4A06A]">gratis</span>
          </h2>
          <p className="text-white/60 mb-6 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
            En cada camiseta incluimos tu dorsal personalizado sin costo adicional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-[#D95632] hover:bg-[#c14a29] text-white font-bold px-7 py-3.5 rounded-lg uppercase tracking-widest transition-colors duration-200 text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ver catálogo
            </Link>
            <a
              href={whatsAppLink("Hola! Quiero una camiseta con dorsal")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-7 py-3.5 rounded-lg uppercase tracking-widest transition-colors duration-200 text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <MessageCircle size={16} aria-hidden="true" />
              Pedir por WhatsApp
            </a>
          </div>
        </FadeInUp>
      </section>
    </>
  );
}
