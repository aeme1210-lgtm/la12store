"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { whatsAppLink } from "@/lib/whatsapp";
import { SHIPPING } from "@/lib/shipping";
import { paymentMethodNames } from "@/lib/payment-methods";

const faqs = [
  {
    category: "Pedidos",
    items: [
      {
        q: "¿Cómo hago un pedido?",
        a: "Puedes pedir directamente por nuestra web agregando productos al carrito y finalizando la compra, o escribirnos directamente por WhatsApp (+57 300 844 3885). Por WhatsApp podemos asesorarte en todo el proceso.",
      },
      {
        q: "¿Cuánto tiempo tarda en llegar mi pedido?",
        a: "Los productos bajo encargo tardan 25 a 30 días calendario en llegar a nuestras manos. Una vez despachado, el envío es gratis a toda Colombia y llega en 2-4 días hábiles. Para envíos internacionales, el tiempo y costo se confirman por WhatsApp según el destino.",
      },
      {
        q: "¿Puedo hacer pedidos al por mayor?",
        a: "Sí, manejamos precios especiales para compras mayoristas. Contáctanos por WhatsApp para cotizaciones.",
      },
    ],
  },
  {
    category: "Pagos",
    items: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: `Aceptamos ${paymentMethodNames().join(", ")}. Las cuentas completas se muestran dentro del checkout. Realizas la transferencia y compartes el comprobante desde ahí mismo.`,
      },
      {
        q: "¿Es seguro comprar aquí?",
        a: "Totalmente. Contamos con cientos de clientes satisfechos. Puedes ver reseñas en nuestro Instagram @la12s_tore. Solo procesamos tu pedido cuando confirmamos el pago.",
      },
      {
        q: "¿Qué hago después de transferir?",
        a: "Toma una captura del comprobante de pago y envíanosla por WhatsApp junto con tu número de pedido. Confirmamos en menos de 2 horas.",
      },
    ],
  },
  {
    category: "Calidad y Productos",
    items: [
      {
        q: "¿Qué calidad tienen las camisetas?",
        a: "Todas nuestras camisetas están confeccionadas con telas técnicas de alta calidad y acabados profesionales. Versión Fan es ideal para uso diario, versión Player tiene materiales aún más ligeros y técnicos para mayor rendimiento.",
      },
      {
        q: "¿Cuál es la diferencia entre versión Fan y Player?",
        a: "La versión Fan está fabricada con tela técnica estándar, perfecta para el uso diario y ver los partidos. La versión Player está hecha con materiales más livianos, transpirables y de corte más ceñido, pensada para quienes practican el deporte.",
      },
      {
        q: "¿Tienen todos los equipos disponibles?",
        a: "Trabajamos con los equipos más populares: selecciones mundialistas, grandes ligas europeas y sudamericanas. Si no encuentras un equipo específico, escríbenos y lo conseguimos.",
      },
    ],
  },
  {
    category: "Tallas y Personalización",
    items: [
      {
        q: "¿Cómo sé qué talla pedir?",
        a: "Contamos con guía de tallas detallada en cada página de producto. Si tienes dudas, escríbenos tus medidas de pecho y te recomendamos la talla ideal.",
      },
      {
        q: "¿El dorsal personalizado tiene costo adicional?",
        a: "No. El dorsal personalizado (nombre y número) está INCLUIDO GRATIS en todas las camisetas. Los parches también están incluidos sin costo adicional.",
      },
      {
        q: "¿Puedo pedir la camiseta sin dorsal?",
        a: "Sí, simplemente no ingreses nombre ni número en el campo de dorsal al hacer tu pedido.",
      },
    ],
  },
  {
    category: "Envíos",
    items: [
      {
        q: "¿Cuánto cuesta el envío?",
        a: `${SHIPPING.nacional.label}.`,
      },
      {
        q: "¿Envían a todo Colombia?",
        a: "Sí, hacemos envíos a todas las ciudades y municipios de Colombia a través de servicios de mensajería confiables.",
      },
      {
        q: "¿Hacen envíos internacionales?",
        a: "Escríbenos por WhatsApp con tu país de destino y te confirmamos disponibilidad, tiempo y costo.",
      },
    ],
  },
  {
    category: "Devoluciones",
    items: [
      {
        q: "¿Aceptan devoluciones?",
        a: "Aceptamos cambios en caso de talla incorrecta o defecto de fábrica. Debes contactarnos dentro de los 3 días siguientes a recibir el pedido.",
      },
      {
        q: "¿Qué hago si hay un problema con mi pedido?",
        a: "Contáctanos inmediatamente por WhatsApp (+57 300 844 3885) con fotos del producto y tu número de pedido. Resolvemos cualquier inconveniente rápidamente.",
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p
            className="text-[#A47C42] text-xs tracking-widest uppercase mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Resolvemos tus dudas
          </p>
          <h1
            className="text-4xl md:text-5xl font-black text-white uppercase mb-4"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Preguntas Frecuentes
          </h1>
          <div className="w-16 h-0.5 bg-[#A47C42] mx-auto" />
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2
                className="text-[#A47C42] text-xs uppercase tracking-widest font-bold mb-3"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = open === key;
                  const panelId = `faq-panel-${key}`;
                  const buttonId = `faq-button-${key}`;
                  return (
                    <div
                      key={key}
                      className="bg-[#141414] rounded-xl border border-[#8A6435]/10 overflow-hidden"
                    >
                      <button
                        id={buttonId}
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1A1A1A] transition-colors"
                      >
                        <span
                          className={`font-semibold text-sm pr-4 ${isOpen ? "text-[#A47C42]" : "text-white"}`}
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          aria-hidden="true"
                          className={`flex-shrink-0 text-[#666666] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#A47C42]" : ""}`}
                        />
                      </button>
                      {/* Siempre en el HTML (indexable/legible) — solo se oculta visual y
                          semánticamente con `hidden` cuando está colapsado. */}
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                        className="px-4 pb-4 border-t border-[#8A6435]/10 pt-3"
                      >
                        <p className="text-[#A0A0A0] text-sm leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#141414] rounded-2xl border border-[#A47C42]/20 p-6 text-center">
          <p
            className="text-white font-bold uppercase tracking-wider mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            ¿No encontraste tu respuesta?
          </p>
          <p className="text-[#A0A0A0] text-sm mb-4">
            Escríbenos directamente por WhatsApp y te respondemos al instante.
          </p>
          <a
            href={whatsAppLink("Hola La 12 Store, tengo una pregunta")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3 rounded-lg uppercase tracking-wider text-sm transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Preguntar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
