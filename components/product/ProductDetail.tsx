"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP, buildWhatsAppMessage } from "@/lib/utils";
import Link from "next/link";
import { FadeInLeft, FadeInRight } from "@/components/ui/ScrollAnimations";

interface Product {
  id: string;
  name: string;
  slug: string;
  team: string;
  league: string;
  season?: string | null;
  type: string;
  description?: string | null;
  priceFan?: number | null;
  pricePlayer?: number | null;
  priceRetro?: number | null;
  images: string;
  sizes: string;
  isRetro: boolean;
  hasPlayer: boolean;
}

export function ProductDetail({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]") as string[];
  const sizes = JSON.parse(product.sizes || "[]") as string[];
  const allImages = images.length > 0 ? images : ["/images/placeholder.jpg"];

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [version, setVersion] = useState<"Fan" | "Player">("Fan");
  const [dorsalName, setDorsalName] = useState("");
  const [dorsalNumber, setDorsalNumber] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCart((s) => s.addItem);

  const getPrice = () => {
    if (product.isRetro) return product.priceRetro ?? 170000;
    if (version === "Player") return product.pricePlayer ?? 180000;
    return product.priceFan ?? 150000;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    const uniqueId = `${product.id}-${selectedSize}-${version}-${dorsalName}-${dorsalNumber}`;
    addItem({
      id: uniqueId,
      productId: product.id,
      name: product.name,
      image: allImages[0],
      size: selectedSize,
      version: product.isRetro ? "Retro" : version,
      dorsalName: dorsalName || undefined,
      dorsalNumber: dorsalNumber || undefined,
      price: getPrice(),
      quantity: 1,
      slug: product.slug,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = `Hola La 12 Store! Me interesa esta camiseta:

*${product.name}*
Talla: ${selectedSize || "(por definir)"}
Versión: ${product.isRetro ? "Retro" : version}
${dorsalName ? `Dorsal: ${dorsalName} #${dorsalNumber}` : "Sin dorsal"}

¿Está disponible? 👀`;
    window.open(buildWhatsAppMessage(msg), "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Gallery */}
      <FadeInLeft className="space-y-3">
        <div className="relative aspect-square bg-[#141414] rounded-2xl overflow-hidden">
          <Image
            src={allImages[imgIdx]}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === imgIdx ? "border-[#D4A017]" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </FadeInLeft>

      {/* Info */}
      <FadeInRight delay={0.2} className="space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#666666]">
          <Link href="/catalogo" className="hover:text-[#D4A017] transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-[#A0A0A0]">{product.league}</span>
          <span>/</span>
          <span className="text-white">{product.team}</span>
        </nav>

        <div>
          <p
            className="text-[#D4A017] text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.type} {product.season && `· ${product.season}`}
          </p>
          <h1
            className="text-3xl md:text-4xl font-black text-white uppercase leading-tight"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.name}
          </h1>
        </div>

        {/* Price */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#B8860B]/20">
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">Precio</p>
          <p
            className="text-[#D4A017] text-4xl font-bold"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {formatCOP(getPrice())}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="text-[#22C55E] text-xs font-semibold">✓ En stock</span>
            <span className="text-[#22C55E] text-xs font-semibold">✓ Dorsal gratis</span>
            <span className="text-[#22C55E] text-xs font-semibold">✓ Parches incluidos</span>
          </div>
        </div>

        {/* Version selector */}
        {!product.isRetro && product.hasPlayer && (
          <div>
            <p
              className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Versión
            </p>
            <div className="flex gap-3">
              {(["Fan", "Player"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`flex-1 py-2.5 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-200 ${
                    version === v
                      ? "bg-[#D4A017] text-black"
                      : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#B8860B]/20 hover:border-[#D4A017]/40 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {v}
                  {v === "Fan" && product.priceFan && (
                    <span className="block text-xs font-normal opacity-70">{formatCOP(product.priceFan)}</span>
                  )}
                  {v === "Player" && product.pricePlayer && (
                    <span className="block text-xs font-normal opacity-70">{formatCOP(product.pricePlayer)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Talla */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[#A0A0A0] text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Talla
            </p>
            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="flex items-center gap-1 text-[#D4A017] text-xs hover:text-[#F0D060] transition-colors"
            >
              <Info size={12} />
              Guía de tallas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-14 py-2 rounded-lg font-bold uppercase text-sm transition-all duration-200 ${
                  selectedSize === size
                    ? "bg-[#D4A017] text-black"
                    : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#B8860B]/20 hover:border-[#D4A017]/40 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {size}
              </button>
            ))}
          </div>

          {showSizeGuide && (
            <div className="mt-3 bg-[#141414] rounded-xl p-4 border border-[#B8860B]/20 text-sm">
              <p className="text-[#D4A017] font-bold uppercase mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
                Guía de Tallas
              </p>
              <table className="w-full text-xs text-[#A0A0A0]">
                <thead>
                  <tr className="text-[#666666]">
                    <th className="text-left py-1">Talla</th>
                    <th className="text-left py-1">Pecho (cm)</th>
                    <th className="text-left py-1">Largo (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[["S", "86-92", "68"], ["M", "92-98", "70"], ["L", "98-104", "72"], ["XL", "104-110", "74"], ["2XL", "110-116", "76"], ["3XL", "116-122", "78"], ["4XL", "122-128", "80"]].map(([t, p, l]) => (
                    <tr key={t} className="border-t border-[#B8860B]/10">
                      <td className="py-1 font-bold text-white">{t}</td>
                      <td className="py-1">{p}</td>
                      <td className="py-1">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dorsal */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#B8860B]/10">
          <p
            className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Dorsal personalizado{" "}
            <span className="text-[#22C55E] ml-1">GRATIS</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={dorsalName}
              onChange={(e) => setDorsalName(e.target.value)}
              maxLength={20}
              className="bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50"
            />
            <input
              type="text"
              placeholder="Número"
              value={dorsalNumber}
              onChange={(e) => setDorsalNumber(e.target.value)}
              maxLength={3}
              className="bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 ${
              addedToCart
                ? "bg-[#22C55E] text-white"
                : "bg-[#D4A017] hover:bg-[#F0D060] text-black gold-glow"
            }`}
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <ShoppingCart size={18} />
            {addedToCart ? "¡Agregado!" : "Agregar al Carrito"}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-sm bg-[#25D366] hover:bg-[#20ba5a] text-white transition-all duration-300"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <MessageCircle size={18} />
            Comprar por WhatsApp
          </button>
        </div>

        {/* Shipping & payment info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <span>🚚</span>
            <span>Envío gratis en Santa Marta · Nacional desde $25.000</span>
          </div>
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <span>🌍</span>
            <span>Envío internacional GRATIS</span>
          </div>
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <span>💳</span>
            <span>Nequi · Daviplata · Bancolombia · Nubank</span>
          </div>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-3 gap-4 text-center border-t border-[#B8860B]/10 pt-6">
          <div>
            <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>500+</p>
            <p className="text-xs text-[#9CA3AF]">Clientes felices</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>100%</p>
            <p className="text-xs text-[#9CA3AF]">Calidad premium</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#D4AF37]" style={{ fontFamily: "var(--font-oswald)" }}>+10</p>
            <p className="text-xs text-[#9CA3AF]">Países</p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-[#B8860B]/10">
            <h3
              className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Descripción
            </h3>
            <p className="text-[#A0A0A0] text-sm leading-relaxed">{product.description}</p>
          </div>
        )}
      </FadeInRight>
    </div>
  );
}
