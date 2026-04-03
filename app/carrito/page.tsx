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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Carrito ({totalItems()} items)
          </h1>
          <button
            onClick={clearCart}
            className="text-[#C70101] hover:text-red-400 text-sm transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} />
            Vaciar
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#141414] rounded-xl p-4 border border-[#B8860B]/10 flex gap-4"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-white font-semibold text-sm leading-tight mb-1"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {item.name}
                  </h3>
                  <div className="text-[#666666] text-xs space-y-0.5">
                    <p>Talla: {item.size} · {item.version}</p>
                    {item.dorsalName && (
                      <p>Dorsal: {item.dorsalName} #{item.dorsalNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#B8860B]/20 flex items-center justify-center text-white hover:border-[#D4A017]/40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-sm w-6 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#B8860B]/20 flex items-center justify-center text-white hover:border-[#D4A017]/40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[#D4A017] font-bold text-sm"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        {formatCOP(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#666666] hover:text-[#C70101] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary / Payment step */}
          <div>
            <div className="bg-[#141414] rounded-xl border border-[#B8860B]/20 p-5 sticky top-24">
              {step === "cart" ? (
                <>
                  <h2
                    className="text-white font-bold uppercase tracking-wider mb-4 text-sm"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    Resumen del pedido
                  </h2>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Subtotal</span>
                      <span className="text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {formatCOP(total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Envío</span>
                      <span className="text-[#22C55E] font-semibold text-sm">Por confirmar</span>
                    </div>
                    <div className="border-t border-[#B8860B]/10 pt-3 flex justify-between">
                      <span className="text-white font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                        Total
                      </span>
                      <span className="text-[#D4A017] font-bold text-lg" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {formatCOP(total)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("payment")}
                    className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-all duration-300"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    <CreditCard size={16} />
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
                    className="text-white font-bold uppercase tracking-wider mb-1 text-sm"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    Confirmar Pedido
                  </h2>
                  <p className="text-[#9CA3AF] text-xs mb-4">
                    Total:{" "}
                    <span className="text-[#D4A017] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {formatCOP(total)}
                    </span>
                  </p>

                  {/* Payment methods */}
                  <div className="bg-[#0F0F0F] rounded-lg p-4 mb-4 space-y-2.5 border border-white/5">
                    <p
                      className="text-[#D4AF37] text-[10px] uppercase tracking-widest mb-3"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
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

                  {/* WhatsApp CTA */}
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-lg uppercase tracking-wider text-sm transition-all duration-300"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    <MessageCircle size={16} />
                    Enviar Comprobante por WhatsApp
                  </button>

                  <div className="mt-4 bg-[#1A1A0A] border border-[#D4AF37]/20 rounded-lg p-3">
                    <p className="text-[#D4AF37] text-xs font-semibold mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
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
      </div>
    </div>
  );
}
