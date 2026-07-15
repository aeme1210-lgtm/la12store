"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { useCheckout } from "@/lib/checkout-store";
import { formatCOP } from "@/lib/utils";
import { shippingLineFor } from "@/lib/shipping";

export function Step2Entrega({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { items, totalPrice } = useCart();
  const { data } = useCheckout();
  const subtotal = totalPrice();
  const shippingLine = shippingLineFor(data.city);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          Tu pedido
        </h2>
        <p className="text-[#666666] text-sm">Revisa productos, tallas y personalizaciones antes de continuar.</p>
      </div>

      <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 divide-y divide-[#8A6435]/10">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 p-4">
            <div className="relative w-16 h-16 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">{item.name}</p>
              <p className="text-[#666666] text-xs mt-0.5">
                Talla {item.size} · {item.version} · x{item.quantity}
              </p>
              {(item.dorsalName || item.dorsalNumber) && (
                <p className="text-[#666666] text-xs">
                  Dorsal: {item.dorsalName || "-"} #{item.dorsalNumber || "-"}
                </p>
              )}
              {item.patches && <p className="text-[#666666] text-xs">Parches: {item.patches}</p>}
            </div>
            <span className="text-[#A47C42] text-sm font-bold flex-shrink-0">
              {formatCOP(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#A0A0A0]">Subtotal</span>
          <span className="text-white">{formatCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm gap-4">
          <span className="text-[#A0A0A0] flex-shrink-0">Envío</span>
          <span className="text-[#22C55E] text-right">{shippingLine}</span>
        </div>
        <div className="border-t border-[#8A6435]/10 pt-2 flex justify-between">
          <span className="text-white font-bold uppercase text-sm">Total</span>
          <span className="text-[#A47C42] text-xl font-bold">{formatCOP(subtotal)}</span>
        </div>
        <p className="text-[#666666] text-[11px]">
          El envío no está incluido en el total — se confirma por WhatsApp antes de pagar.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-[#1A1A1A] border border-[#8A6435]/20 text-[#A0A0A0] font-bold py-4 rounded-xl uppercase tracking-wider text-sm hover:text-white transition-colors"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-[#A47C42] hover:bg-[#C4A06A] text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
