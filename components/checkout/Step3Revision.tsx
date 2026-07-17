"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { useCheckout } from "@/lib/checkout-store";
import { formatCOP } from "@/lib/utils";
import { shippingLineFor } from "@/lib/shipping";
import { ORDER_STATUS } from "@/lib/order-status";
import { getPaymentMethod } from "@/lib/payment-methods";

export function Step3Revision({
  onNext,
  onEditData,
  onEditItems,
}: {
  onNext: () => void;
  onEditData: () => void;
  onEditItems: () => void;
}) {
  const { items, totalPrice } = useCart();
  const { data, paymentMethodId, setOrder } = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const subtotal = totalPrice();
  const shippingLine = shippingLineFor(data.city);
  const method = getPaymentMethod(paymentMethodId);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          city: data.city,
          department: data.department,
          address: data.address,
          neighborhood: data.neighborhood,
          notes: data.notes || undefined,
          paymentMethod: method?.name,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            version: i.version,
            dorsalName: i.dorsalName,
            dorsalNumber: i.dorsalNumber,
            price: i.price,
          })),
          subtotal,
          shipping: 0,
          total: subtotal,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      const result = await res.json();
      setOrder(result.id, result.orderNumber, ORDER_STATUS.READY_FOR_PAYMENT);
      onNext();
    } catch {
      setError("No pudimos registrar tu pedido. Verifica tu conexión e inténtalo de nuevo, o escríbenos directo por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          Revisa tu pedido
        </h2>
        <p className="text-[#666666] text-sm">Todo es editable antes de continuar al pago.</p>
      </div>

      <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm uppercase tracking-wider">Datos de entrega</p>
          <button onClick={onEditData} className="text-[#A47C42] text-xs hover:underline">
            Editar
          </button>
        </div>
        <p className="text-[#A0A0A0] text-sm">{data.name} · {data.phone}</p>
        {data.email && <p className="text-[#666666] text-xs">{data.email}</p>}
        <p className="text-[#666666] text-xs mt-1">
          {data.address}, {data.neighborhood} — {data.city}, {data.department}
        </p>
        {data.notes && <p className="text-[#666666] text-xs mt-1 italic">&quot;{data.notes}&quot;</p>}
      </div>

      <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm uppercase tracking-wider">Productos</p>
          <button onClick={onEditItems} className="text-[#A47C42] text-xs hover:underline">
            Editar
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-12 h-12 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                <p className="text-[#666666] text-xs">{item.size} · {item.version} · x{item.quantity}</p>
              </div>
              <span className="text-[#A47C42] text-xs font-bold flex-shrink-0">
                {formatCOP(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#8A6435]/10 mt-3 pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">Subtotal</span>
            <span className="text-white">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs gap-4">
            <span className="text-[#A0A0A0] flex-shrink-0">Envío</span>
            <span className="text-[#22C55E] text-right">{shippingLine}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-white font-bold uppercase text-sm">Total</span>
            <span className="text-[#A47C42] text-xl font-bold">{formatCOP(subtotal)}</span>
          </div>
        </div>
      </div>

      {method && (
        <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4">
          <p className="text-white font-bold text-sm uppercase tracking-wider mb-1">Método de pago</p>
          <p className="text-[#A0A0A0] text-sm">{method.name}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[#C70101] text-sm bg-[#C70101]/10 border border-[#C70101]/20 rounded-lg p-3">
          {error}
        </p>
      )}

      <label className="flex items-start gap-2.5 text-xs text-[#A0A0A0] cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedPolicy}
          onChange={(e) => setAcceptedPolicy(e.target.checked)}
          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[#A47C42]"
        />
        <span>
          He leído y acepto la{" "}
          <a href="/cambios" target="_blank" rel="noopener noreferrer" className="text-[#A47C42] hover:underline">
            política de cambios y devoluciones
          </a>{" "}
          y los{" "}
          <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#A47C42] hover:underline">
            términos de uso
          </a>{" "}
          de La 12 Store.
        </span>
      </label>

      <button
        onClick={handleConfirm}
        disabled={loading || !acceptedPolicy}
        className="w-full bg-[#A47C42] hover:bg-[#C4A06A] disabled:opacity-50 text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-colors"
      >
        {loading ? "Confirmando..." : "Confirmar e ir a pago"}
      </button>
    </div>
  );
}
