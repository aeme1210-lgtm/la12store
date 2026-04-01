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

export function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const mainImage = images[0] || "/images/placeholder.jpg";

  const displayPrice = product.isRetro
    ? product.priceRetro ?? 170000
    : product.priceFan ?? 150000;

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      <div className="relative bg-[#141414] rounded-xl overflow-hidden border border-transparent hover:border-[#D4A017]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A017]/10">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.isTrending && (
            <span
              className="bg-[#D4A017] text-black text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Tendencia
            </span>
          )}
          {product.isNew && !product.isTrending && (
            <span
              className="bg-[#22C55E] text-black text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Nuevo
            </span>
          )}
          {product.isRetro && (
            <span
              className="bg-[#1A1A1A] border border-[#D4A017]/50 text-[#D4A017] text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Retro
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square bg-[#1A1A1A] overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <span
              className="bg-[#D4A017] text-black text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Ver detalles
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-2 sm:p-3">
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-0.5 truncate" style={{ fontFamily: "var(--font-oswald)" }}>
            {product.type} {product.season && `· ${product.season}`}
          </p>
          <h3
            className="text-white font-semibold text-xs sm:text-sm leading-tight line-clamp-2 mb-2 group-hover:text-[#D4A017] transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1">
            <span
              className="text-[#D4A017] font-bold text-sm sm:text-base"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {formatCOP(displayPrice)}
            </span>
            {!product.isRetro && product.pricePlayer && (
              <span className="text-[#666666] text-xs hidden sm:block">
                Player: {formatCOP(product.pricePlayer)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
