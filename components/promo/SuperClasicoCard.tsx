"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import { getStartingPrice } from "@/lib/pricing";
import { whatsAppLink } from "@/lib/whatsapp";

interface PromoProduct {
  id: string;
  name: string;
  slug: string;
  team: string;
  images: string;
  sizes: string;
  priceFan: number | null;
  pricePlayer: number | null;
  priceRetro: number | null;
  isRetro: boolean;
}

const DISCOUNT = 0.85; // 15% off

function getOriginalPrice(product: PromoProduct): number {
  return getStartingPrice(product);
}

function cleanName(name: string): string {
  return name
    .replace(/\s*S-4XL/gi, "")
    .replace(/\s*S-3XL/gi, "")
    .replace(/\s*S-XXL/gi, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function SuperClasicoCard({ product }: { product: PromoProduct }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const mainImage = images[0] || "/images/placeholder.jpg";

  const availableSizes = JSON.parse(product.sizes || '["S","M","L","XL","2XL","3XL"]') as string[];
  const [selectedSize, setSelectedSize] = useState(
    availableSizes.includes("M") ? "M" : availableSizes[0] ?? "M"
  );
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const originalPrice = getOriginalPrice(product);
  const discountedPrice = Math.round(originalPrice * DISCOUNT);

  const isRiver = /river/i.test(product.name);

  const waMessage = `¡Hola! Vi la camiseta de ${cleanName(product.name)} en la PROMO SUPER CLÁSICO y quiero aprovechar el 15% de descuento. Precio con descuento: ${formatCOP(discountedPrice)}. ¿Está disponible?`;

  function handleAddToCart() {
    addItem({
      id: `${product.id}-promo-${selectedSize}`,
      productId: product.id,
      name: `${cleanName(product.name)} — Promo -15%`,
      image: mainImage,
      size: selectedSize,
      version: product.isRetro ? "Retro" : "Fan",
      price: discountedPrice,
      quantity: 1,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="bg-[#141414] rounded-xl overflow-hidden border border-white/5 hover:border-[#D32F2F]/30 transition-all duration-300 group relative flex flex-col">
      {/* -15% badge */}
      <div
        className="absolute top-2 right-2 z-20 bg-[#D32F2F] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        -15%
      </div>

      {/* Team badge */}
      <div
        className={`absolute top-2 left-2 z-20 text-[10px] font-black px-2 py-1 rounded ${
          isRiver
            ? "bg-white text-[#D32F2F] border border-[#D32F2F]/40"
            : "bg-[#003087] text-[#FFD700]"
        }`}
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {isRiver ? "RIVER" : "BOCA"}
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] bg-[#1A1A1A] overflow-hidden flex-shrink-0">
        <Image
          src={mainImage}
          alt={cleanName(product.name)}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Info */}
      <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
        <h3
          className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.5rem]"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          {cleanName(product.name)}
        </h3>

        {/* Prices */}
        <div className="flex items-baseline gap-2">
          <span className="text-[#666] text-xs line-through" style={{ fontFamily: "var(--font-jetbrains)" }}>
            {formatCOP(originalPrice)}
          </span>
          <span
            className="text-white font-black text-base md:text-lg"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {formatCOP(discountedPrice)}
          </span>
        </div>

        {/* Size selector */}
        <div className="flex gap-1 flex-wrap">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-[10px] px-2 py-0.5 rounded border font-bold transition-colors ${
                selectedSize === size
                  ? isRiver
                    ? "bg-[#D32F2F] border-[#D32F2F] text-white"
                    : "bg-[#003087] border-[#003087] text-[#FFD700]"
                  : "bg-transparent border-white/20 text-white/50 hover:border-white/40 hover:text-white/70"
              }`}
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {size}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-1.5 mt-auto">
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wide py-2 rounded-lg transition-all ${
              added
                ? "bg-[#22C55E] text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <ShoppingCart size={13} />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </button>
          <a
            href={whatsAppLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] font-black uppercase tracking-wide py-2 rounded-lg transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <MessageCircle size={13} />
            Comprar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
