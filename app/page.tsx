export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Shield, Truck, Globe, MessageCircle } from "lucide-react";

import { HeroSlider } from "@/components/home/HeroSlider";
import { BRAND_URLS } from "@/lib/brand-urls";
import { LifestyleGallery } from "@/components/home/LifestyleGallery";
import { CounterBanner } from "@/components/home/CounterBanner";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { FadeInUp, FadeInLeft, FadeInRight, StaggerContainer, StaggerItem } from "@/components/ui/ScrollAnimations";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { isSuperClasicoActive } from "@/lib/promo-super-clasico";

export const metadata: Metadata = {
  title: "La 12 Store | Camisetas de Fútbol Premium",
  description:
    "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío a todo el país. Selecciones, ligas europeas y sudamericanas. Santa Marta, Colombia.",
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
        where: { isActive: true, name: { contains: t } },
        orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      })
    )
  );
  const unique = results.filter((p) => p !== null);
  if (unique.length >= 4) return unique.slice(0, 8);
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
}

const VB = "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/";

const categories = [
  { name: "La Liga",          subtitle: "España",      slug: "la-liga",               video: `${VB}LigaE.mp4` },
  { name: "Premier League",   subtitle: "Inglaterra",  slug: "premier-league",         video: `${VB}premier%20league%20(1).mp4` },
  { name: "Serie A",          subtitle: "Italia",      slug: "serie-a",                video: `${VB}Serie%20A.mp4` },
  { name: "Bundesliga",       subtitle: "Alemania",    slug: "bundesliga",             video: `${VB}Bundesliga.mp4` },
  { name: "Selecciones",      subtitle: "Nacionales",  slug: "selecciones-nacionales", video: `${VB}Selecciones.mp4` },
  { name: "Liga Argentina",   subtitle: "Argentina",   slug: "liga-argentina",         video: `${VB}WhatsApp%20Video%202026-04-01%20at%2019.43.52.mp4` },
  { name: "Retro",            subtitle: "Clásicas",    slug: "retro",                  video: `${VB}Retro.mp4` },
  { name: "Brasileirao",      subtitle: "Brasil",      slug: "brasileirao",            video: `${VB}Brasileirao.mp4` },
  { name: "Mundial 2026",     subtitle: "Selecciones", slug: "mundial-fifa-2026",      video: `${VB}Mundial%202026.mp4` },
];

const features = [
  { Icon: Shield, title: "Calidad Premium", desc: "Telas técnicas y acabados profesionales en cada prenda." },
  { Icon: Truck, title: "Envío Colombia", desc: "Gratis en Santa Marta. Nacional desde $25.000." },
  { Icon: Globe, title: "Internacional", desc: "Llegamos a cualquier parte del mundo. GRATIS." },
  { Icon: MessageCircle, title: "Asesoría", desc: "Te asesoramos por WhatsApp en todo momento." },
];

export default async function HomePage() {
  const promoActive = isSuperClasicoActive();
  const [trending, productCount] = await Promise.all([
    getTrendingProducts(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  return (
    <>
      {/* ── PROMO BANNER — solo el 19 de abril ── */}
      {promoActive && (
        <Link
          href="/super-clasico"
          className="block w-full text-center py-3 px-4 font-black text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
          style={{
            fontFamily: "var(--font-oswald)",
            background: "linear-gradient(90deg, #D32F2F 0%, #1A1A1A 40%, #1A1A1A 60%, #003087 100%)",
            color: "#FFD700",
          }}
        >
          🔥 PROMO SUPER CLÁSICO — 15% OFF en camisetas de Boca y River · Solo hoy →
        </Link>
      )}

      {/* ── 1. HERO ── */}
      <HeroSlider />

      {/* ── 2. TENDENCIAS — products from DB, right after hero ── */}
      <section className="py-12 md:py-20 lg:py-28 px-3 md:px-4 max-w-7xl mx-auto">
        <FadeInUp className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Lo más pedido
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#FAFAFA]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Tendencias
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden md:inline text-[#D4AF37] hover:text-[#F0D060] text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver todo →
          </Link>
        </FadeInUp>

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
            className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      {/* ── 3. COUNTER BANNER ── */}
      <CounterBanner total={productCount} />

      {/* ── 4. LIFESTYLE GALLERY ── */}
      <LifestyleGallery />

      {/* ── 5. CATEGORÍAS ── */}
      <section className="py-12 md:py-20 lg:py-28 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <FadeInUp className="text-center mb-12">
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Explora
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#FAFAFA]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Por Categoría
            </h2>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {categories.map((cat) => (
              <StaggerItem key={cat.slug}>
                <Link
                  href={`/catalogo?liga=${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl block"
                  style={{ height: "clamp(160px, 40vw, 220px)" }}
                >
                  <LazyVideo
                    src={cat.video}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-300 group-hover:from-black/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3
                      className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-sm text-[#D4AF37]">{cat.subtitle}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 6. POR QUÉ ELEGIRNOS ── */}
      <section className="py-12 md:py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <FadeInUp className="text-center mb-12">
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              La diferencia
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#FAFAFA]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ¿Por qué elegirnos?
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Inner = (
                <div className="bg-[#111111] rounded-xl p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-colors duration-300 group h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <f.Icon size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3
                    className="text-[#FAFAFA] font-semibold uppercase tracking-wide mb-2 text-sm"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                    {f.desc}
                  </p>
                </div>
              );
              return i % 2 === 0 ? (
                <FadeInLeft key={i} delay={i * 0.1}>{Inner}</FadeInLeft>
              ) : (
                <FadeInRight key={i} delay={i * 0.1}>{Inner}</FadeInRight>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIOS ── */}
      <section className="py-16 px-3 md:px-6 bg-[#0A0A0A]">
        <FadeInUp className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#FAFAFA] mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Clientes reales, opiniones reales
          </h2>
          <p className="text-[#9CA3AF] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
            +500 clientes satisfechos en toda Colombia y el mundo
          </p>
        </FadeInUp>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Video reseña real */}
          <FadeInLeft>
            <div className="relative rounded-xl overflow-hidden aspect-video shadow-2xl border border-gray-800">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              >
                <source
                  src="https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/WhatsApp%20Video%202026-04-04%20at%2013.47.08.mp4"
                  type="video/mp4"
                />
              </video>
              <div
                className="absolute top-3 left-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                ⭐ Reseña verificada
              </div>
            </div>
          </FadeInLeft>

          {/* Textos */}
          <FadeInRight delay={0.15}>
            <div className="space-y-6">
              <div className="bg-[#111111] rounded-xl p-5 border border-gray-800">
                <div className="flex mb-2">
                  <span className="text-[#D4AF37] text-base">★★★★★</span>
                </div>
                <p className="text-[#9CA3AF] text-sm italic leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                  &ldquo;Uy amigo super feliz, las camisas son de muy buena calidad, pero las tipo jugador son otra categoría&rdquo;
                </p>
                <p className="text-white font-semibold text-sm mt-3" style={{ fontFamily: "var(--font-oswald)" }}>
                  Cliente verificado
                </p>
                <p className="text-[#D4AF37] text-xs">Compra verificada ✓</p>
              </div>

              <div className="bg-[#111111] rounded-xl p-5 border border-gray-800">
                <div className="flex mb-2">
                  <span className="text-[#D4AF37] text-base">★★★★★</span>
                </div>
                <p className="text-[#9CA3AF] text-sm italic leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                  &ldquo;La calidad es premium, se siente igual que la original. El dorsal quedó perfecto.&rdquo;
                </p>
                <p className="text-white font-semibold text-sm mt-3" style={{ fontFamily: "var(--font-oswald)" }}>
                  500+ clientes
                </p>
                <p className="text-[#D4AF37] text-xs">En toda Colombia y el mundo</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>100%</p>
                  <p className="text-xs text-[#9CA3AF]">Calidad premium</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>500+</p>
                  <p className="text-xs text-[#9CA3AF]">Clientes felices</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>+10</p>
                  <p className="text-xs text-[#9CA3AF]">Países</p>
                </div>
              </div>
            </div>
          </FadeInRight>
        </div>
      </section>

      {/* ── 8. QUIÉNES SOMOS ── */}
      <NosotrosSection />

      {/* ── 8. INSTAGRAM / REDES SOCIALES ── */}
      <section className="py-10 md:py-16 lg:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <FadeInUp className="text-center mb-8">
            <p
              className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Síguenos
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold text-[#FAFAFA]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              @la12s_tore
            </h2>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8">
            {[
              "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/SILVANA%20COLOMBIA.jpeg",
              "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/SILVANA%20REAL%20MADRID.jpeg",
              "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/Silvana%20CAMISA%20BOCA.jpeg",
              "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/ANDRES%20CAMISA%20VENECIA.jpeg",
            ].map((photo, i) => (
              <StaggerItem key={i}>
                <a
                  href="https://instagram.com/la12s_tore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square overflow-hidden rounded-xl block group"
                >
                  <Image
                    src={photo}
                    alt="La 12 Store Instagram"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
                    </svg>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="flex items-center justify-center gap-4">
            <a
              href="https://instagram.com/la12s_tore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#D4AF37]/10 border border-white/10 hover:border-[#D4AF37]/40 text-[#9CA3AF] hover:text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              Instagram
            </a>
            <a
              href="https://tiktok.com/@la12s_tore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#D4AF37]/10 border border-white/10 hover:border-[#D4AF37]/40 text-[#9CA3AF] hover:text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.23 8.23 0 004.83 1.55V7.16a4.85 4.85 0 01-1.06-.47z" />
              </svg>
              TikTok
            </a>
          </div>
        </div>
      </section>

      {/* ── 9. CTA FINAL ── */}
      <section className="py-12 md:py-20 bg-[#0A0A0A] border-t border-white/5">
        <FadeInUp className="max-w-2xl mx-auto text-center px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#FAFAFA] mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Dorsal y parches{" "}
            <span className="text-[#D4AF37] italic">gratis</span>
          </h2>
          <p className="text-[#9CA3AF] mb-8 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
            En cada camiseta incluimos tu dorsal personalizado y parches sin costo adicional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-colors duration-200 text-sm"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Ver Catálogo
            </Link>
            <a
              href="https://wa.me/573008443885?text=Hola!%20Quiero%20una%20camiseta%20con%20dorsal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-colors duration-200 text-sm"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <MessageCircle size={16} />
              Pedir por WhatsApp
            </a>
          </div>
        </FadeInUp>
      </section>
    </>
  );
}
