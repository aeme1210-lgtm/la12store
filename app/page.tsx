export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Shield, Truck, Globe, MessageCircle } from "lucide-react";

import { HeroSlider } from "@/components/home/HeroSlider";
import { LifestyleGallery } from "@/components/home/LifestyleGallery";
import { CounterBanner } from "@/components/home/CounterBanner";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { AnimateOnView, StaggerContainer, StaggerItem } from "@/components/home/AnimateOnView";

export const metadata: Metadata = {
  title: "La 12 Store | Camisetas de Fútbol Premium",
  description:
    "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío a todo el país. Selecciones, ligas europeas y sudamericanas. Santa Marta, Colombia.",
};

async function getTrendingProducts() {
  // Try to find specific popular products first
  const popular = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: "Barcelona 25" } },
        { name: { contains: "Colombia" } },
        { name: { contains: "Real Madrid 25" } },
        { name: { contains: "Argentina 2026" } },
        { name: { contains: "Colombia 2026" } },
        { name: { contains: "Manchester United" } },
        { isFeatured: true },
        { isTrending: true },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  if (popular.length >= 4) return popular.slice(0, 8);

  // Fallback: latest products
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

const categories = [
  { name: "New Season", subtitle: "2025/26", slug: "new-season" },
  { name: "La Liga", subtitle: "España", slug: "la-liga" },
  { name: "Premier League", subtitle: "Inglaterra", slug: "premier-league" },
  { name: "Selecciones", subtitle: "Nacionales", slug: "selecciones-nacionales" },
  { name: "Retro", subtitle: "Clásicas", slug: "retro" },
  { name: "Liga Argentina", subtitle: "Argentina", slug: "liga-argentina" },
];

const features = [
  { Icon: Shield, title: "Calidad Premium", desc: "Telas técnicas y acabados profesionales en cada prenda." },
  { Icon: Truck, title: "Envío a toda Colombia", desc: "Domicilio gratis en Santa Marta. Nacional desde $25.000." },
  { Icon: Globe, title: "Envíos Internacionales", desc: "Llegamos a cualquier parte del mundo. GRATIS." },
  { Icon: MessageCircle, title: "Atención Personalizada", desc: "Te asesoramos por WhatsApp en todo momento." },
];

export default async function HomePage() {
  const trending = await getTrendingProducts();

  return (
    <>
      {/* ── HERO ── */}
      <HeroSlider />

      {/* ── LIFESTYLE GALLERY ── */}
      <LifestyleGallery />

      {/* ── TENDENCIAS ── */}
      <section className="py-20 md:py-28 px-4 max-w-7xl mx-auto">
        <AnimateOnView className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Lo más pedido
            </p>
            <h2
              className="text-3xl md:text-5xl font-black text-white uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Tendencias
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden md:inline text-[#D4AF37] hover:text-[#F0D060] text-sm font-semibold uppercase tracking-wider transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver todo →
          </Link>
        </AnimateOnView>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="py-20 md:py-28 bg-[#0D0D0D] border-y border-[#B8860B]/10">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnView className="text-center mb-12">
            <p
              className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Explora
            </p>
            <h2
              className="text-3xl md:text-5xl font-black text-white uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Por Categoría
            </h2>
          </AnimateOnView>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat) => (
              <StaggerItem key={cat.slug}>
                <Link
                  href={`/catalogo?liga=${cat.slug}`}
                  className="group block relative bg-[#141414] rounded-xl overflow-hidden border border-[#B8860B]/10 hover:border-[#D4AF37]/50 transition-all duration-300 aspect-[3/4] flex flex-col items-center justify-center p-4 hover:bg-[#1A1A1A]"
                  style={{
                    boxShadow: "inset 0 0 0 0 rgba(212,175,55,0)",
                    transition: "all 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {/* Gold glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/5 group-hover:to-[#D4AF37]/10 transition-all duration-300 rounded-xl" />
                  <div className="relative z-10 text-center">
                    <h3
                      className="text-white font-bold uppercase text-sm leading-tight group-hover:text-[#D4AF37] transition-colors"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-[#666666] text-xs mt-1 group-hover:text-[#A0A0A0] transition-colors">
                      {cat.subtitle}
                    </p>
                  </div>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-hover:via-[#D4AF37]/60 transition-all duration-300" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── COUNTER BANNER ── */}
      <CounterBanner />

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnView className="text-center mb-12">
            <p
              className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              La diferencia
            </p>
            <h2
              className="text-3xl md:text-5xl font-black text-white uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              ¿Por qué elegirnos?
            </h2>
          </AnimateOnView>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <div className="bg-[#141414] rounded-xl p-6 border border-[#B8860B]/10 hover:border-[#D4AF37]/30 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <f.Icon size={22} className="text-[#D4AF37]" />
                  </div>
                  <h3
                    className="text-white font-bold uppercase tracking-wide mb-2 text-sm"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[#A0A0A0] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <NosotrosSection />

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-[#0A0A0A] border-t border-[#B8860B]/10">
        <AnimateOnView className="max-w-2xl mx-auto text-center px-4">
          <h2
            className="text-3xl md:text-4xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Dorsal y parches{" "}
            <span className="text-[#D4AF37]">GRATIS</span>
          </h2>
          <p className="text-[#A0A0A0] mb-8">
            En cada camiseta incluimos tu dorsal personalizado y parches sin costo adicional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
              style={{
                fontFamily: "var(--font-oswald)",
                boxShadow: "0 0 20px rgba(212,175,55,0.3)",
              }}
            >
              Ver Catálogo
            </Link>
            <a
              href="https://wa.me/573008443885?text=Hola!%20Quiero%20pedir%20una%20camiseta%20con%20dorsal%20personalizado"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <MessageCircle size={16} />
              Pedir por WhatsApp
            </a>
          </div>
        </AnimateOnView>
      </section>
    </>
  );
}
