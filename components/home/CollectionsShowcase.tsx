import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS } from "@/lib/collections";
import { GroupReveal } from "@/components/ui/ScrollAnimations";

/**
 * Colecciones editoriales en portada (redesign-v3). Composición asimétrica:
 * la primera colección con foto propia ocupa doble alto. Las que no tienen
 * foto editorial muestran su primera camiseta sobre fondo marfil.
 */
export async function CollectionsShowcase({ limit }: { limit?: number }) {
  const list = limit ? COLLECTIONS.slice(0, limit) : COLLECTIONS;

  const covers = await Promise.all(
    list.map(async (c) => {
      if (c.cover) return { src: c.cover, editorial: true };
      const first = await prisma.product.findFirst({
        where: { AND: [{ isActive: true }, c.where] },
        orderBy: { createdAt: "desc" },
        select: { images: true },
      });
      const src = first ? (JSON.parse(first.images || "[]") as string[])[0] : undefined;
      return { src, editorial: false };
    })
  );

  return (
    <GroupReveal className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 auto-rows-[220px] md:auto-rows-[300px]">
      {list.map((c, i) => {
        const cover = covers[i];
        const big = i === 1; // "Los 90" — foto editorial vertical, doble alto
        // Con 6 colecciones y una de doble alto quedan 7 celdas: la última
        // ocupa la fila completa como banner para cerrar la grilla sin huecos.
        const banner = list.length === 6 && i === 5;
        return (
          <Link
            key={c.slug}
            href={`/coleccion/${c.slug}`}
            className={`group relative overflow-hidden rounded-lg block ${
              cover.editorial ? "bg-[#181816]" : "bg-[#ECE8E1]"
            } ${big ? "row-span-2" : ""} ${banner ? "col-span-2 md:col-span-3" : ""}`}
          >
            {cover.src && (
              <Image
                src={cover.src}
                alt={c.title}
                fill
                className={`transition-transform duration-700 group-hover:scale-105 ${
                  cover.editorial ? "object-cover" : "object-contain p-8 mix-blend-multiply"
                }`}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <p
                className="text-[#C4A06A] text-[9px] md:text-[10px] tracking-[0.3em] uppercase mb-1.5"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {c.kicker}
              </p>
              <h3 className="font-display text-white text-lg md:text-3xl uppercase leading-none">
                {c.title}
              </h3>
              <span
                className="inline-block mt-3 text-white/70 group-hover:text-white text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Ver colección →
              </span>
            </div>
          </Link>
        );
      })}
    </GroupReveal>
  );
}
