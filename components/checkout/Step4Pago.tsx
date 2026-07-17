"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useCheckout } from "@/lib/checkout-store";
import { formatCOP } from "@/lib/utils";
import { getActivePaymentMethods } from "@/lib/payment-methods";
import { ORDER_STATUS } from "@/lib/order-status";
import { reportClientStatus } from "@/lib/checkout-api";

export function Step4Pago({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { totalPrice } = useCart();
  const { paymentMethodId, setPaymentMethodId, orderId, orderCode, setStatus } = useCheckout();
  const [copied, setCopied] = useState<string | null>(null);
  const total = totalPrice();
  const methods = getActivePaymentMethods();
  const selected = methods.find((m) => m.id === paymentMethodId) ?? methods[0];

  useEffect(() => {
    if (!orderId) return;
    setStatus(ORDER_STATUS.PAYMENT_INSTRUCTIONS_VIEWED);
    reportClientStatus(orderId, ORDER_STATUS.PAYMENT_INSTRUCTIONS_VIEWED);
    // Solo se reporta una vez al entrar al paso de pago.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
  };

  const summaryText = `Pedido ${orderCode} · ${selected?.name} · Total ${formatCOP(total)}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-inter)" }}>
          Realiza el pago
        </h2>
        <p className="text-[#666666] text-sm">
          Pedido <span className="text-[#A47C42] font-semibold">{orderCode}</span> — elige un método y transfiere el total exacto.
        </p>
      </div>

      <div className="space-y-3">
        {methods.map((m) => {
          const isSelected = m.id === selected?.id;
          return (
            <div
              key={m.id}
              className={`rounded-xl border p-4 transition-colors ${
                isSelected ? "border-[#A47C42] bg-[#A47C42]/5" : "border-[#8A6435]/20 bg-[#141414]"
              }`}
            >
              <button
                onClick={() => setPaymentMethodId(m.id)}
                aria-pressed={isSelected}
                className="w-full flex items-center justify-between mb-2"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                  <span className="flex flex-col items-start">
                    <span className="text-white font-bold text-sm uppercase tracking-wider">{m.name}</span>
                    <span className="text-[#666666] text-[11px] normal-case">{m.titular}</span>
                  </span>
                </span>
                <span className="text-[#666666] text-xs">{isSelected ? "Seleccionado" : "Elegir"}</span>
              </button>

              {isSelected && (
                <div className="space-y-2 mt-3 pt-3 border-t border-[#8A6435]/10">
                  <Row label="Titular" value={m.titular} onCopy={() => copy(m.titular, `${m.id}-titular`)} copied={copied === `${m.id}-titular`} />
                  <Row label={m.type === "breb" ? "Llave" : "Número"} value={m.number} onCopy={() => copy(m.number, `${m.id}-number`)} copied={copied === `${m.id}-number`} />
                  <Row label="Total a transferir" value={formatCOP(total)} onCopy={() => copy(String(total), `${m.id}-total`)} copied={copied === `${m.id}-total`} highlight />
                  <p className="text-[#9CA3AF] text-xs pt-1">{m.instructions}</p>
                  {m.qrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.qrImageUrl} alt={`Código QR para pagar con ${m.name}`} width={160} height={160} className="rounded-lg mt-2" />
                  ) : (
                    <p className="text-[#666666] text-[11px] italic">QR disponible próximamente — usa el número/llave de arriba.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => copy(summaryText, "summary")}
        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#8A6435]/20 text-[#A0A0A0] hover:text-white text-xs py-3 rounded-lg transition-colors"
      >
        {copied === "summary" ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
        Copiar resumen del pedido
      </button>

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
          Ya transferí, continuar
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#9CA3AF] text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${highlight ? "text-[#A47C42] text-base" : "text-white"}`}>
          {value}
        </span>
        <button
          onClick={onCopy}
          aria-label={`Copiar ${label.toLowerCase()}`}
          className="text-[#666666] hover:text-[#A47C42] transition-colors"
        >
          {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
