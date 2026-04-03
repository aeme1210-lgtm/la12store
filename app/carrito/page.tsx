"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight, CreditCard, ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP, buildWhatsAppMessage } from "@/lib/utils";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [step, setStep] = useState<"cart" | "payment">("cart");

  const total = totalPrice();

  function buildOrderSummary() {
    return items
      .map(
        (item) =>
          `• ${item.name} (Talla: ${item.size}, ${item.version}${item.dorsalName ? `, Dorsal: ${item.dorsalName} #${item.dorsalNumber}` : ""}) x${item.quantity} → ${formatCOP(item.price * item.quantity)}`
      )
      .join("\n");
  }

  const handleWhatsApp = () => {
    if (items.length === 0) return;
    const msg = `Hola La 12 Store! 🙌 Acabo de hacer mi pedido y adjunto el comprobante de pago.

*MI PEDIDO:*
${buildOrderSummary()}

*Total: ${formatCOP(total)} COP*

Por favor confírmenme cuando reciban el comprobante. ¡Gracias!`;
    window.open(buildWhatsAppMessage(msg), "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={64} className="text-[#B8860B]/30 mx-auto mb-4" />
          <h1
            className="text-2xl font-black text-white uppercase mb-2"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Tu carrito está vacío
          </h1>
          <p className="text-[#666666] mb-8">Agrega algunas camisetas para continuar</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all duration-300"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver Catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl md:text-4xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Tu Carrito <span className="text-[#D4AF37] text-xl">({totalItems()})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-[#C70101] hover:text-red-400 text-sm transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} />
            Vaciar todo
          </button>
        </div>

        {/* Items list */}
        <div className="space-y-0 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 py-6 border-b border-gray-800"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white font-bold text-base md:text-lg leading-tight mb-1"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.name}
                </h3>
                <div className="text-[#666666] text-sm space-y-0.5 mb-3">
                  <p>Talla: <span className="text-[#A0A0A0]">{item.size}</span> · {item.version}</p>
                  {item.dorsalName && (
                    <p>Dorsal: <span className="text-[#A0A0A0]">{item.dorsalName} #{item.dorsalNumber}</span></p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#B8860B]/20 flex items-center justify-center text-white hover:border-[#D4A017]/40 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-white text-sm w-6 text-center font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#B8860B]/20 flex items-center justify-center text-white hover:border-[#D4A017]/40 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Price + delete */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <span
                  className="text-[#D4A017] font-bold text-lg"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {formatCOP(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#666666] hover:text-[#C70101] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary / Payment */}
        <div className="bg-[#111111] rounded-xl p-6 border border-gray-800">
          {step === "cart" ? (
            <>
              <h2
                className="text-white font-bold uppercase tracking-wider mb-5 text-sm"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Resumen del pedido
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span className="text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {formatCOP(total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Envío</span>
                  <span className="text-[#22C55E] font-semibold">Por confirmar</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-white font-bold uppercase text-lg" style={{ fontFamily: "var(--font-oswald)" }}>
                    Total
                  </span>
                  <span className="text-[#D4A017] font-bold text-xl" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {formatCOP(total)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep("payment")}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-bold py-4 rounded-lg uppercase tracking-wider text-lg transition-all duration-300"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <CreditCard size={18} />
                Proceder al Pago
              </button>
              <p className="text-[#666666] text-xs text-center mt-3">
                Nequi · Daviplata · Bancolombia · Nubank
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("cart")}
                className="flex items-center gap-1 text-[#9CA3AF] hover:text-white text-xs mb-4 transition-colors"
              >
                <ChevronLeft size={14} />
                Volver al carrito
              </button>
              <h2
                className="text-white font-bold uppercase tracking-wider mb-1"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Confirmar Pedido
              </h2>
              <p className="text-[#9CA3AF] text-sm mb-5">
                Total:{" "}
                <span className="text-[#D4A017] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {formatCOP(total)}
                </span>
              </p>

              <div className="bg-[#0F0F0F] rounded-lg p-4 mb-5 space-y-3 border border-white/5">
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-oswald)" }}>
                  Métodos de pago
                </p>
                {[
                  { label: "Nequi", value: "300 844 3885" },
                  { label: "Daviplata", value: "300 844 3885" },
                  { label: "Bancolombia", value: "Cta. Ahorros — Silvana Ossa" },
                  { label: "Nubank", value: "@AME429" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between text-sm">
                    <span className="text-[#9CA3AF]">{m.label}</span>
                    <span className="text-white font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 rounded-lg uppercase tracking-wider text-sm transition-all duration-300 mb-4"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <MessageCircle size={18} />
                Enviar Comprobante por WhatsApp
              </button>

              <div className="bg-[#1A1A0A] border border-[#D4AF37]/20 rounded-lg p-4">
                <p className="text-[#D4AF37] text-xs font-semibold mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
                  ¿Cómo confirmar tu pedido?
                </p>
                <ol className="text-[#9CA3AF] text-xs space-y-1 list-decimal list-inside">
                  <li>Realiza el pago por cualquier método</li>
                  <li>Toma captura de pantalla del comprobante</li>
                  <li>Envíala por WhatsApp con el botón de arriba</li>
                </ol>
                <p className="text-[#666666] text-[10px] mt-2">
                  Tu pedido se confirma una vez verifiquemos el pago.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
