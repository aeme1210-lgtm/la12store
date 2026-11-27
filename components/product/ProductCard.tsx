"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import { getStartingPrice, isPlayerOnlyProduct } from "@/lib/pricing";
import { displayName } from "@/lib/product-rules";
import { normalizeType } from "@/lib/taxonomy";

const PLACEHOLDER = "/images/placeholder.jpg";

interface Product {
  id: string;
  name: string;
  slug: string;
  team: string;
  league: string;
  season?: string | null;
  type: string;
  priceFan?: number | null;
  pricePlayer?: number | null;
  priceRetro?: number | null;
  priceLongSleeve?: number | null;
  isLongSleeve?: boolean;
  images: string;
  isRetro: boolean;
  isTrending: boolean;
  isNew: boolean;
}

/**
 * Una sola etiqueta por tarjeta (redesign-v3): antes se apilaban hasta 4
 * ("NUEVO" + "🔥 Nueva Temporada" + "RETRO" + "MANGA LARGA") y el catálogo se
 * veía como listado de proveedor. Prioridad: lo que cambia el precio o la
 * decisión de compra.
 */
function primaryBadge(product: Product): string | null {
  if (product.isLongSleeve || /manga larga|long sleeve|\bLS\b/i.test(product.name)) return "Manga larga";
  if (product.isRetro) return "Retro";
  if (isPlayerOnlyProduct(product)) return "Jugador";
  if (/26\/27|2026\/27/.test(`${product.season ?? ""} ${product.name}`)) return "26/27";
  if (/2026/.test(product.season ?? "") || /mundial/i.test(product.league)) return "Mundial 2026";
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const mainImage = images[0] || PLACEHOLDER;
  const secondImage = images[1];
  const [imgSrc, setImgSrc] = useState(mainImage);

  const displayPrice = getStartingPrice(product);
  const badge = primaryBadge(product);
  const tipo = normalizeType(product.type).tipoCamiseta;
  const meta = [tipo, product.season].filter(Boolean).join(" · ");

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      {/* Foto a sangre en formato 4:5 uniforme: sin marcos ni bordes, cada
          tarjeta se lee como una foto, no como una ficha de proveedor. */}
      <div className="relative aspect-[4/5] bg-[#1A1918] rounded-lg overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
          <Image
            src={imgSrc}
            alt={displayName(product.name)}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgSrc(PLACEHOLDER)}
          />
          {secondImage && (
            <Image
              src={secondImage}
              alt=""
              aria-hidden="true"
              fill
              className="hidden md:block object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              sizes="(max-width: 1024px) 33vw, 25vw"
            />
          )}
        </div>

        {badge && (
          <span
            className="absolute top-2.5 left-2.5 z-10 bg-[#0B0B0A] text-[#F1EBDD] text-[10px] font-semibold px-2 py-1 rounded-sm uppercase tracking-[0.12em]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="pt-3 pb-1">
        {meta && (
          <p
            className="text-white/40 text-[10px] uppercase tracking-[0.15em] mb-1 truncate"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {meta}
          </p>
        )}
        <h3
          className="text-white text-[13px] sm:text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[#C4A06A] transition-colors min-h-[2.5rem]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {displayName(product.name)}
        </h3>
        <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-inter)" }}>
          {formatCOP(displayPrice)}
        </p>
      </div>
    </Link>
  );
}
