export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, getCollection } from "@/lib/collections";
import { ProductCard } from "@/components/product/ProductCard";
import { FadeInUp } from "@/components/ui/ScrollAnimations";
import { whatsAppLink } from "@/lib/whatsapp";
import { DELIVERY } from "@/lib/product-rules";

interface Props {
  params: Promise<{ slug: string }>;
}

const PAGE_SIZE = 48;

/**
 * Reparte la selección por equipo (round-robin) para que la colección no
 * abra con 12 camisetas seguidas del mismo club — las importaciones de
 * proveedor llegan agrupadas por equipo. Usa la primera palabra útil del
 * nombre como clave porque `team` todavía no está normalizado.
 */
function interleaveByTeam<T extends { name: string; team: string }>(items: T[]): T[] {
  const key = (p: T) =>
    p.team
      .replace(/\b(19|20)\d{2}\b|\d{2}[/_]\d{2}/g, "")
      .replace(/home|away|third|retro|jersey|kids?|mens|womens/gi, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join(" ")
      .toLowerCase();
  const groups = new Map<string, T[]>();
  for (const p of items) {
    const k = key(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  const queues = [...groups.values()];
  const out: T[] = [];
  for (let round = 0; out.length < items.length; round++) {
    for (const q of queues) if (q[round]) out.push(q[round]);
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Colección no encontrada" };
  return {
    title: `${c.title} — Colección`,
    description: c.story,
    openGraph: {
      title: `${c.title} | La 12 Store`,
      description: c.story,
      images: c.cover ? [{ url: c.cover }] : undefined,
    },
  };
}

/**
 * Landing de colección (redesign-v3) — destino de cada Reel/TikTok.
 * Portada editorial + relato + selección acotada, en vez de mandar a la
 * gente al catálogo completo de 2.588 referencias.
 */
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const [pool, total] = await Promise.all([
    prisma.product.findMany({
      where: { AND: [{ isActive: true }, collection.where] },
      orderBy: collection.orderBy ?? [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 600,
    }),
    prisma.product.count({ where: { AND: [{ isActive: true }, collection.where] } }),
  ]);
  const products = interleaveByTeam(pool).slice(0, PAGE_SIZE);

  const firstImage = products[0]
    ? (JSON.parse(products[0].images || "[]") as string[])[0]
    : undefined;
  const others = COLLECTIONS.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <>
      {/* ── Portada ── */}
      <section className="relative -mt-14 md:-mt-20 bg-[#0B0B0A]">
        <div className="grid md:grid-cols-2 min-h-[78vh]">
          <div className="relative min-h-[52vh] md:min-h-full order-1 md:order-2 bg-[#ECE8E1]">
            {collection.cover ? (
              <Image
                src={collection.cover}
                alt={collection.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : firstImage ? (
              <Image
                src={firstImage}
                alt={collection.title}
                fill
                priority
                className="object-contain p-10 mix-blend-multiply"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : null}
          </div>
          <div className="order-2 md:order-1 flex items-end md:items-center px-5 md:px-14 py-12 md:pt-28">
            <FadeInUp className="max-w-lg">
              <p
                className="text-[#C4A06A] text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Colección · {collection.kicker}
              </p>
              <h1 className="font-display text-white text-4xl md:text-6xl uppercase mb-6">
                {collection.title}
              </h1>
              <p
                className="text-white/75 text-base md:text-lg leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {collection.story}
              </p>
              <p className="text-white/40 text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-inter)" }}>
                {total} camisetas · Dorsal y parches gratis · {DELIVERY.short}
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ── Selección ── */}
      <section className="py-14 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <p className="text-white/60 text-center py-20">
            Esta colección se está armando. Mientras tanto,{" "}
            <Link href="/catalogo" className="text-[#C4A06A] underline">
              explora el catálogo
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

        {total > products.length && (
          <p className="text-center text-white/50 text-sm mt-12" style={{ fontFamily: "var(--font-inter)" }}>
            Mostrando {products.length} de {total}. ¿Buscas una en particular?{" "}
            <a
              href={whatsAppLink(`Hola! Busco una camiseta de la colección "${collection.title}"`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A06A] underline"
            >
              Escríbenos
            </a>{" "}
            o usa el{" "}
            <Link href="/catalogo" className="text-[#C4A06A] underline">
              buscador del catálogo
            </Link>
            .
          </p>
        )}
      </section>

      {/* ── Ayuda humana ── */}
      <section className="bg-[#F1EBDD] py-14 md:py-16 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-[#0B0B0A] text-2xl md:text-4xl uppercase mb-4">
            ¿No sabes cuál escoger?
          </h2>
          <p className="text-[#0B0B0A]/70 mb-7" style={{ fontFamily: "var(--font-inter)" }}>
            Te ayudamos con la talla, la versión y el dorsal. Respondemos nosotros, no un bot.
          </p>
          <a
            href={whatsAppLink(`Hola! Vengo de la colección "${collection.title}" y quiero asesoría`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0B0B0A] text-[#F1EBDD] font-semibold px-7 py-3.5 rounded-md uppercase tracking-widest text-xs hover:bg-[#6B202B] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <MessageCircle size={15} aria-hidden="true" />
            Hablar con La 12
          </a>
        </div>
      </section>

      {/* ── Otras colecciones ── */}
      <section className="py-14 md:py-20 px-3 md:px-6 max-w-7xl mx-auto">
        <h2 className="font-display text-white text-2xl md:text-3xl uppercase mb-8">Sigue explorando</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/coleccion/${c.slug}`}
              className="group border border-white/10 hover:border-[#C4A06A]/60 rounded-lg p-6 transition-colors"
            >
              <p className="text-[#C4A06A] text-[10px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "var(--font-inter)" }}>
                {c.kicker}
              </p>
              <p className="font-display text-white text-xl uppercase group-hover:text-[#C4A06A] transition-colors">
                {c.title} →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
