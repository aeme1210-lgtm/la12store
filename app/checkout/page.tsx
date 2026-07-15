"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import { buildOrderMessage, whatsAppLink } from "@/lib/whatsapp";
import { CheckCircle, MessageCircle, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const paymentMethods = [
  { id: "nequi", label: "Nequi", detail: "300 844 3885" },
  { id: "daviplata", label: "Daviplata", detail: "300 844 3885" },
  { id: "bancolombia", label: "Bancolombia (Cta. Ahorros · Silvana Ossa)", detail: "91622993231" },
  { id: "nubank", label: "Nubank (Llave)", detail: "@AME429" },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "payment" | "done">("form");
  const [paymentMethod, setPaymentMethod] = useState("nequi");
  const [orderNumber, setOrderNumber] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    department: "",
    notes: "",
  });

  const total = totalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            version: i.version,
            dorsalName: i.dorsalName,
            dorsalNumber: i.dorsalNumber,
            price: i.price,
          })),
          subtotal: total,
          shipping: 0,
          total,
        }),
      });
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      setStep("payment");
    } catch {
      alert("Error al procesar el pedido. Por favor contáctanos por WhatsApp.");
    }
  };

  const handleConfirm = () => {
    setStep("done");
    clearCart();
  };

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const whatsappMsg = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const msg = buildOrderMessage({
      items: items.map((item) => ({
        name: item.name,
        url: `${origin}/catalogo/${item.slug}`,
        size: item.size,
        version: item.version,
        dorsalName: item.dorsalName,
        dorsalNumber: item.dorsalNumber,
        patches: item.patches,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      subtotal: total,
      orderNumber,
      city: form.city || undefined,
      paymentMethod: selectedMethod?.label,
      notes: form.notes || undefined,
    });
    return whatsAppLink(msg);
  };

  if (items.length === 0 && step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white uppercase mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Tu carrito está vacío
          </h1>
          <Link href="/catalogo" className="text-[#D4A017] hover:underline">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-[#22C55E] mx-auto mb-4" />
          <h1
            className="text-3xl font-black text-white uppercase mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            ¡Pedido Confirmado!
          </h1>
          <p className="text-[#A0A0A0] mb-4">
            Tu número de pedido es{" "}
            <span className="text-[#D4A017] font-bold">{orderNumber}</span>
          </p>
          <p className="text-[#666666] text-sm mb-8">
            Pronto te contactaremos para confirmar el envío. ¡Gracias por confiar en La 12 Store!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#D4A017] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-[#D4A017] text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              Pedido {orderNumber}
            </p>
            <h1 className="text-3xl font-black text-white uppercase" style={{ fontFamily: "var(--font-playfair)" }}>
              Realiza el Pago
            </h1>
          </div>

          <div className="bg-[#141414] rounded-xl border border-[#B8860B]/20 p-6 mb-6">
            <p className="text-[#A0A0A0] text-sm mb-4">
              Transfiere el siguiente monto a:
            </p>

            <div className="space-y-3 mb-6">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    paymentMethod === m.id
                      ? "border-[#D4A017] bg-[#D4A017]/10"
                      : "border-[#B8860B]/20 bg-[#1A1A1A]"
                  }`}
                >
                  <span
                    className={`font-bold uppercase text-sm ${paymentMethod === m.id ? "text-[#D4A017]" : "text-[#A0A0A0]"}`}
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {m.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                      {m.detail}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(m.detail, m.id);
                      }}
                      className="text-[#666666] hover:text-[#D4A017] transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    {copied === m.id && (
                      <span className="text-[#22C55E] text-xs">Copiado!</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#B8860B]/10 text-center">
              <p className="text-[#A0A0A0] text-sm mb-1">Monto a transferir</p>
              <p
                className="text-[#D4A017] text-3xl font-bold"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {formatCOP(total)}
              </p>
            </div>

            <p className="text-[#A0A0A0] text-sm mt-4 text-center">
              Después de transferir, envía el comprobante por WhatsApp.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={whatsappMsg()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <MessageCircle size={18} />
              Enviar Comprobante por WhatsApp
            </a>
            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#B8860B]/20 text-[#A0A0A0] font-bold py-3 rounded-xl uppercase tracking-wider text-sm hover:border-[#D4A017]/30 hover:text-white transition-all"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ya pagué, confirmar pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1
          className="text-3xl font-black text-white uppercase mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2
              className="text-lg font-bold text-white uppercase mb-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Datos de Contacto
            </h2>

            {[
              { name: "name", label: "Nombre completo", required: true, type: "text" },
              { name: "phone", label: "Teléfono / WhatsApp", required: true, type: "tel" },
              { name: "email", label: "Email (opcional)", required: false, type: "email" },
              { name: "address", label: "Dirección de envío", required: false, type: "text" },
              { name: "city", label: "Ciudad", required: false, type: "text" },
              { name: "department", label: "Departamento", required: false, type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label
                  className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="w-full bg-[#141414] border border-[#B8860B]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50"
                />
              </div>
            ))}

            <div>
              <label
                className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Notas adicionales
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-[#141414] border border-[#B8860B]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50 resize-none"
                placeholder="Instrucciones especiales, referencias, etc."
              />
            </div>

            <div>
              <p
                className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Método de pago
              </p>
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? "border-[#D4A017] bg-[#D4A017]/10"
                        : "border-[#B8860B]/20 bg-[#141414]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-[#D4A017]"
                    />
                    <span className="text-white font-semibold text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Confirmar Pedido
            </button>
          </form>

          {/* Order summary */}
          <div>
            <h2
              className="text-lg font-bold text-white uppercase mb-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Tu Pedido
            </h2>
            <div className="bg-[#141414] rounded-xl border border-[#B8860B]/20 p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-[#1A1A1A] rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white text-xs font-semibold leading-tight truncate"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-[#666666] text-xs">
                      {item.size} · {item.version} x{item.quantity}
                    </p>
                  </div>
                  <span
                    className="text-[#D4A017] text-sm font-bold flex-shrink-0"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-[#B8860B]/10 pt-3 flex justify-between">
                <span className="text-white font-bold uppercase text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                  Total
                </span>
                <span
                  className="text-[#D4A017] text-xl font-bold"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatCOP(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
