"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP, buildWhatsAppMessage } from "@/lib/utils";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  const shipping = 0; // Gratis Santa Marta / por definir
  const total = totalPrice();

  const handleWhatsApp = () => {
    if (items.length === 0) return;
    const lines = items.map(
      (item) =>
        `• ${item.name} (Talla: ${item.size}, ${item.version}${item.dorsalName ? `, Dorsal: ${item.dorsalName} #${item.dorsalNumber}` : ""}) x${item.quantity} - ${formatCOP(item.price * item.quantity)}`
    );
    const msg = `Hola La 12 Store! Quiero hacer este pedido:

${lines.join("\n")}

*Total: ${formatCOP(total)} COP*
¿Cómo procedo con el pago? 👀`;
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
      <div className="max-w-6xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#141414] rounded-xl p-4 border border-[#B8860B]/10 flex gap-4"
              >
                <div className="relative w-20 h-20 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
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

          {/* Summary */}
          <div>
            <div className="bg-[#141414] rounded-xl border border-[#B8860B]/20 p-5 sticky top-24">
              <h2
                className="text-white font-bold uppercase tracking-wider mb-4 text-sm"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span className="text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {formatCOP(total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">Envío</span>
                  <span className="text-[#22C55E] font-semibold">
                    Por definir
                  </span>
                </div>
                <div className="border-t border-[#B8860B]/10 pt-3 flex justify-between">
                  <span className="text-white font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                    Total
                  </span>
                  <span
                    className="text-[#D4A017] font-bold text-lg"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {formatCOP(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-all duration-300 gold-glow"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  Finalizar Compra
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-all duration-300"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  <MessageCircle size={16} />
                  Pagar por WhatsApp
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#B8860B]/10">
                <p className="text-[#666666] text-xs text-center">
                  Métodos: Nequi · Daviplata · Nubank
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
