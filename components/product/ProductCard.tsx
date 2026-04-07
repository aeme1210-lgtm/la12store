"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCOP } from "@/lib/utils";

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
  if (/retro/i.test(name)) return { text: "⭐ Clásica", bg: "#D4A017", color: "black" };
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const mainImage = images[0] || "/images/placeholder.jpg";

  const displayPrice = product.isRetro
    ? product.priceRetro ?? 170000
    : product.priceFan ?? 150000;

  const smartBadge = getSmartBadge(product.name);

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      <div className="relative bg-[#141414] rounded-xl border border-transparent hover:border-[#D4A017]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A017]/10">
        {/* Image container — aspect 3/4, object-contain so jersey shows full */}
        <div className="relative aspect-[3/4] bg-[#1A1A1A] rounded-t-xl overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.isTrending && (
              <span
                className="bg-[#D4A017] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Tendencia
              </span>
            )}
            {product.isNew && !product.isTrending && (
              <span
                className="bg-[#22C55E] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Nuevo
              </span>
            )}
            {/* Smart badge based on product name */}
            {smartBadge && !product.isRetro && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded tracking-wide"
                style={{ fontFamily: "var(--font-oswald)", background: smartBadge.bg, color: smartBadge.color }}
              >
                {smartBadge.text}
              </span>
            )}
            {product.isRetro && (
              <span
                className="bg-[#1A1A1A]/90 border border-[#D4A017]/60 text-[#D4A017] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Retro
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span
              className="bg-[#D4A017] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Ver detalles
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p
            className="text-[#666666] text-[10px] uppercase tracking-wider mb-1 truncate"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.type}{product.season ? ` · ${product.season}` : ""}
          </p>
          <h3
            className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#D4A017] transition-colors min-h-[2.5rem]"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {cleanProductName(product.name)}
          </h3>
          <span
            className="text-[#D4A017] font-bold text-sm"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {formatCOP(displayPrice)}
          </span>
          <p className="text-[#22C55E] text-[10px] mt-1">✓ Dorsal y parches gratis</p>
        </div>
      </div>
    </Link>
  );
}
