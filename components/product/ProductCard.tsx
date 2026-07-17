"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";
import { getStartingPrice } from "@/lib/pricing";

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

function cleanProductName(name: string): string {
  return name
    .replace(/\s*S-4XL/gi, "")
    .replace(/\s*S-3XL/gi, "")
    .replace(/\s*S-XXL/gi, "")
    .replace(/\s*S-\w+/gi, "")
    .replace(/\s*Size[_ ]\d+-\d+/gi, "")
    .replace(/Home\s+Home/gi, "Home")
    .replace(/\s+Home\s+Retro$/gi, " Retro")
    .replace(/\s*Home\s*$/gi, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSmartBadge(name: string): { text: string; bg: string; color: string } | null {
  if (/25\/26|26\/27|2026/i.test(name)) return { text: "🔥 Nueva Temporada", bg: "#DC2626", color: "white" };
  if (/special edition/i.test(name)) return { text: "💎 Edición Limitada", bg: "#7C3AED", color: "white" };
  if (/player version/i.test(name)) return { text: "👑 Versión Jugador", bg: "#1D4ED8", color: "white" };
  if (/retro/i.test(name)) return { text: "⭐ Clásica", bg: "#A47C42", color: "black" };
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const mainImage = images[0] || PLACEHOLDER;
  const secondImage = images[1];
  const [imgSrc, setImgSrc] = useState(mainImage);

  const displayPrice = getStartingPrice(product);

  const smartBadge = getSmartBadge(product.name);

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      <div className="relative bg-[#141414] rounded-xl border border-transparent hover:border-[#A47C42]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#A47C42]/10">
        {/* Image container — aspect 3/4, object-contain so jersey shows full */}
        <div className="relative aspect-[3/4] bg-[#1A1A1A] rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgSrc(PLACEHOLDER)}
            />
            {/* Segunda fotografía al pasar el mouse — solo en dispositivos con
                hover real (desktop), no en touch. */}
            {secondImage && (
              <Image
                src={secondImage}
                alt=""
                aria-hidden="true"
                fill
                className="hidden md:block object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                sizes="(max-width: 1024px) 33vw, 25vw"
              />
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.isTrending && (
              <span
                className="bg-[#A47C42] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Tendencia
              </span>
            )}
            {product.isNew && !product.isTrending && (
              <span
                className="bg-[#22C55E] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Nuevo
              </span>
            )}
            {/* Smart badge based on product name */}
            {smartBadge && !product.isRetro && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded tracking-wide"
                style={{ fontFamily: "var(--font-inter)", background: smartBadge.bg, color: smartBadge.color }}
              >
                {smartBadge.text}
              </span>
            )}
            {product.isRetro && (
              <span
                className="bg-[#1A1A1A]/90 border border-[#A47C42]/60 text-[#A47C42] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Retro
              </span>
            )}
            {product.isLongSleeve && (
              <span
                className="bg-[#1A1A1A]/90 border border-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Manga Larga
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span
              className="bg-[#A47C42] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ver detalles
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p
            className="text-[#666666] text-[10px] uppercase tracking-wider mb-1 truncate"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {product.type}{product.season ? ` · ${product.season}` : ""}
          </p>
          <h3
            className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#A47C42] transition-colors min-h-[2.5rem]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {cleanProductName(product.name)}
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[#A47C42] font-bold text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {formatCOP(displayPrice)}
            </span>
          </div>
          <p className="text-[#22C55E] text-[10px] mt-1">✓ Dorsal y parches gratis</p>
        </div>
      </div>
    </Link>
  );
}
