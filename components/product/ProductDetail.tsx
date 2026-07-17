"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Info, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import { getProductPrice } from "@/lib/pricing";
import { buildOrderMessage, whatsAppLink } from "@/lib/whatsapp";
import { SHIPPING } from "@/lib/shipping";
import { paymentMethodNames } from "@/lib/payment-methods";
import { recordView } from "@/lib/recently-viewed";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
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
  priceLongSleeve?: number | null;
  isLongSleeve?: boolean;
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
  const [patches, setPatches] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCart((s) => s.addItem);

  const getPrice = () => getProductPrice(product, version);

  // "Vistos recientemente" — se registra al abrir la ficha, 100% local.
  useEffect(() => {
    recordView({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: allImages[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const [sizeError, setSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const uniqueId = `${product.id}-${selectedSize}-${version}-${dorsalName}-${dorsalNumber}-${patches}`;
    addItem({
      id: uniqueId,
      productId: product.id,
      name: product.name,
      image: allImages[0],
      size: selectedSize,
      version: product.isRetro ? "Retro" : version,
      dorsalName: dorsalName || undefined,
      dorsalNumber: dorsalNumber || undefined,
      patches: patches || undefined,
      price: getPrice(),
      quantity,
      slug: product.slug,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const msg = buildOrderMessage({
      items: [
        {
          name: product.name,
          url: `${origin}/catalogo/${product.slug}`,
          size: selectedSize || "(por definir)",
          version: product.isRetro ? "Retro" : version,
          dorsalName: dorsalName || undefined,
          dorsalNumber: dorsalNumber || undefined,
          patches: patches || undefined,
          quantity,
          unitPrice: getPrice(),
        },
      ],
      subtotal: getPrice() * quantity,
    });
    window.open(whatsAppLink(msg), "_blank");
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
                  i === imgIdx ? "border-[#A47C42]" : "border-transparent opacity-60 hover:opacity-100"
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
          <Link href="/catalogo" className="hover:text-[#A47C42] transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-[#A0A0A0]">{product.league}</span>
          <span>/</span>
          <span className="text-white">{product.team}</span>
        </nav>

        <div>
          <p
            className="text-[#A47C42] text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {product.type} {product.season && `· ${product.season}`}
          </p>
          <h1
            className="text-3xl md:text-4xl font-black text-white uppercase leading-tight"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            {product.name}
          </h1>
        </div>

        {/* Price */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#8A6435]/20">
          <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-1">
            Precio{product.isLongSleeve && " · Manga Larga"}
          </p>
          <p
            className="text-[#A47C42] text-4xl font-bold"
            style={{ fontFamily: "var(--font-inter)" }}
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
              style={{ fontFamily: "var(--font-inter)" }}
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
                      ? "bg-[#A47C42] text-black"
                      : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#8A6435]/20 hover:border-[#A47C42]/40 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
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
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Talla
            </p>
            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="flex items-center gap-1 text-[#A47C42] text-xs hover:text-[#C4A06A] transition-colors"
            >
              <Info size={12} />
              Guía de tallas
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Talla" aria-required="true">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setSizeError(false); }}
                role="radio"
                aria-checked={selectedSize === size}
                className={`w-14 py-2 rounded-lg font-bold uppercase text-sm transition-all duration-200 ${
                  selectedSize === size
                    ? "bg-[#A47C42] text-black"
                    : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#8A6435]/20 hover:border-[#A47C42]/40 hover:text-white"
                } ${sizeError ? "ring-2 ring-[#C70101]" : ""}`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p role="alert" className="text-[#C70101] text-xs mt-2">
              Por favor selecciona una talla antes de continuar.
            </p>
          )}

          {showSizeGuide && (
            <div className="mt-3 bg-[#141414] rounded-xl p-4 border border-[#8A6435]/20 text-sm">
              <p className="text-[#A47C42] font-bold uppercase mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                Guía de Tallas
              </p>
              <div className="relative w-full rounded-lg overflow-hidden bg-white">
                <Image
                  src="/images/guia-tallas-oficial-la12store.png"
                  alt="Guía oficial de tallas La 12 Store: Aficionado (Fan), Jugador (Player) y Femenina (Mujer), con medidas de largo, ancho, altura y peso por talla"
                  width={1122}
                  height={1402}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dorsal */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#8A6435]/10">
          <p
            className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Dorsal personalizado{" "}
            <span className="text-[#22C55E] ml-1">GRATIS</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dorsal-name" className="sr-only">Nombre para el dorsal</label>
              <input
                id="dorsal-name"
                type="text"
                placeholder="Nombre"
                value={dorsalName}
                onChange={(e) => setDorsalName(e.target.value)}
                maxLength={20}
                className="w-full bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#A47C42]/50"
              />
            </div>
            <div>
              <label htmlFor="dorsal-number" className="sr-only">Número para el dorsal</label>
              <input
                id="dorsal-number"
                type="text"
                placeholder="Número"
                value={dorsalNumber}
                onChange={(e) => setDorsalNumber(e.target.value)}
                maxLength={3}
                className="w-full bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#A47C42]/50"
              />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="dorsal-patches" className="sr-only">Parches (opcional)</label>
            <input
              id="dorsal-patches"
              type="text"
              placeholder="¿Algún parche especial? (opcional — ej: Liga, Champions)"
              value={patches}
              onChange={(e) => setPatches(e.target.value)}
              maxLength={60}
              className="w-full bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#A47C42]/50"
            />
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <p
            className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Cantidad
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Disminuir cantidad"
              className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#8A6435]/20 flex items-center justify-center text-white hover:border-[#A47C42]/40 transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="text-white font-semibold text-base w-6 text-center" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              aria-label="Aumentar cantidad"
              className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#8A6435]/20 flex items-center justify-center text-white hover:border-[#A47C42]/40 transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 ${
              addedToCart
                ? "bg-[#22C55E] text-white"
                : "bg-[#A47C42] hover:bg-[#C4A06A] text-black"
            }`}
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <ShoppingCart size={18} />
            {addedToCart ? "¡Agregado!" : "Agregar al Carrito"}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-sm bg-[#25D366] hover:bg-[#20ba5a] text-white transition-all duration-300"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <MessageCircle size={18} />
            Comprar por WhatsApp
          </button>
        </div>

        {/* Shipping & payment info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <span>🚚</span>
            <span>{SHIPPING.nacional.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <span>💳</span>
            <span>{paymentMethodNames().join(" · ")}</span>
          </div>
        </div>

        {/* Confianza — solo compromisos reales y verificables, no cifras inventadas */}
        <div className="grid grid-cols-3 gap-4 text-center border-t border-[#8A6435]/10 pt-6">
          <div>
            <p className="text-xl" aria-hidden="true">👚</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Dorsal y parches gratis</p>
          </div>
          <div>
            <p className="text-xl" aria-hidden="true">🔄</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Cambios por talla incorrecta</p>
          </div>
          <div>
            <p className="text-xl" aria-hidden="true">💬</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Asesoría directa por WhatsApp</p>
          </div>
        </div>

        {/* Información ampliada — acordeón accesible */}
        <Accordion>
          {product.description && (
            <AccordionItem title="Descripción" defaultOpen>
              <p>{product.description}</p>
            </AccordionItem>
          )}
          <AccordionItem title="Versión y ajuste">
            <p>
              {product.isRetro
                ? "Corte clásico retro, ajuste regular. Tela técnica transpirable."
                : "Versión Fan: ajuste regular, cómoda para uso diario. Versión Jugador: corte más entallado, tela técnica de mayor compresión, igual a la usada en cancha."}
            </p>
          </AccordionItem>
          <AccordionItem title="Materiales y cuidados">
            <p>
              Tela técnica transpirable con acabados profesionales. Lavar a máquina con agua fría,
              del revés, sin blanqueador. Secar a la sombra — no usar secadora ni planchar
              directamente sobre el estampado o el dorsal.
            </p>
          </AccordionItem>
          <AccordionItem title="Envíos y cambios">
            <p className="mb-2">
              {SHIPPING.nacional.label}.
            </p>
            <p>
              Cambios por talla incorrecta o defecto de fábrica dentro de los 3 días de recibido —
              ver{" "}
              <Link href="/cambios" className="text-[#A47C42] hover:underline">
                política de cambios
              </Link>
              .
            </p>
          </AccordionItem>
          <AccordionItem title="Preguntas frecuentes">
            <p className="mb-2">
              <strong className="text-white">¿El dorsal y los parches tienen costo?</strong> No,
              van incluidos gratis en cada pedido.
            </p>
            <p>
              Más preguntas en nuestra{" "}
              <Link href="/faq" className="text-[#A47C42] hover:underline">
                página de FAQ
              </Link>
              .
            </p>
          </AccordionItem>
        </Accordion>
      </FadeInRight>
    </div>
  );
}
