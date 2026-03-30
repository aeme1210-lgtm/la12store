export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Shield, Truck, Globe, MessageCircle } from "lucide-react";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

const categories = [
  { name: "New Season", subtitle: "2025/26", slug: "new-season", emoji: "🌍" },
  { name: "La Liga", subtitle: "España", slug: "la-liga", emoji: "🇪🇸" },
  { name: "Premier League", subtitle: "Inglaterra", slug: "premier-league", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Retro", subtitle: "Clásicas", slug: "retro", emoji: "⭐" },
];

const features = [
  {
    Icon: Shield,
    title: "Calidad Premium",
    desc: "Telas técnicas y acabados profesionales en cada prenda.",
  },
  {
    Icon: Truck,
    title: "Envío a toda Colombia",
    desc: "Domicilio gratis en Santa Marta. Nacional desde $25.000.",
  },
  {
    Icon: Globe,
    title: "Envíos Internacionales",
    desc: "Llegamos a cualquier parte del mundo. GRATIS.",
  },
  {
    Icon: MessageCircle,
    title: "Atención Personalizada",
    desc: "Te asesoramos por WhatsApp en todo momento.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#141414] to-[#0A0A0A]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-1/3 h-px bg-gradient-to-r from-transparent to-[#D4A017]/30" />
          <div className="absolute bottom-1/3 right-0 w-1/4 h-px bg-gradient-to-l from-transparent to-[#D4A017]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D4A017]/5 blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p
            className="text-[#D4A017] text-sm md:text-base tracking-[0.4em] uppercase mb-4"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Santa Marta, Colombia
          </p>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider leading-none mb-4"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <span className="text-[#D4A017]">LA 12</span>
            <br />
            <span className="text-white">STORE</span>
          </h1>
          <p
            className="text-[#A0A0A0] text-base md:text-xl max-w-xl mx-auto mb-10"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Lo mejor en camisetas de fútbol en Colombia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 gold-glow text-sm md:text-base"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Ver Catálogo
            </Link>
            <a
              href="https://wa.me/573008443885?text=Hola%20La%2012%20Store%2C%20quiero%20información%20sobre%20sus%20camisetas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm md:text-base"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#D4A017]/60" />
        </div>
      </section>

      {/* TENDENCIAS */}
      <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p
              className="text-[#D4A017] text-xs tracking-widest uppercase mb-1"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Lo más pedido
            </p>
            <h2
              className="text-3xl md:text-4xl font-black text-white uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Tendencias
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-[#D4A017] hover:text-[#F0D060] text-sm font-semibold uppercase tracking-wider transition-colors hidden md:block"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver todo →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[#D4A017] font-semibold uppercase tracking-wider text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="py-16 md:py-24 bg-[#141414] border-y border-[#B8860B]/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p
              className="text-[#D4A017] text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              La diferencia
            </p>
            <h2
              className="text-3xl md:text-4xl font-black text-white uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              ¿Por qué elegirnos?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] rounded-xl p-6 border border-[#B8860B]/10 hover:border-[#D4A017]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#D4A017]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4A017]/20 transition-colors">
                  <f.Icon size={22} className="text-[#D4A017]" />
                </div>
                <h3
                  className="text-white font-bold uppercase tracking-wide mb-2 text-sm"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {f.title}
                </h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p
            className="text-[#D4A017] text-xs tracking-widest uppercase mb-2"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Explora
          </p>
          <h2
            className="text-3xl md:text-4xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Por Categoría
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?liga=${cat.slug}`}
              className="group relative bg-[#141414] rounded-xl overflow-hidden border border-[#B8860B]/10 hover:border-[#D4A017]/40 transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center p-4 hover:bg-[#1A1A1A]"
            >
              <span className="text-4xl mb-3">{cat.emoji}</span>
              <h3
                className="text-white font-bold uppercase text-sm text-center group-hover:text-[#D4A017] transition-colors"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {cat.name}
              </h3>
              <p className="text-[#666666] text-xs text-center mt-0.5">{cat.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border-y border-[#B8860B]/10">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2
            className="text-3xl md:text-4xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Dorsal y parches{" "}
            <span className="text-[#D4A017]">GRATIS</span>
          </h2>
          <p className="text-[#A0A0A0] mb-8">
            En cada camiseta incluimos tu dorsal personalizado y parches sin costo adicional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 gold-glow text-sm"
              style={{ fontFamily: "var(--font-oswald)" }}
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
        </div>
      </section>
    </>
  );
}
