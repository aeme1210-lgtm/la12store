import { MessageCircle, Ruler, ShoppingBag, CreditCard, PackageCheck } from "lucide-react";
import { GroupReveal } from "@/components/ui/ScrollAnimations";

const STEPS = [
  { Icon: ShoppingBag, title: "Elige tu camiseta", desc: "Busca por selección, club, retro o versión jugador en el catálogo." },
  { Icon: Ruler, title: "Escoge talla y dorsal", desc: "Dorsal y parches personalizados, siempre gratis en pedidos retail." },
  { Icon: CreditCard, title: "Confirma tu pedido", desc: "Revisa el resumen y elige tu método de pago (Nequi, DaviPlata, Bancolombia, Bre-B)." },
  { Icon: MessageCircle, title: "Envía tu comprobante", desc: "Comparte el comprobante de pago por WhatsApp — quedas en verificación." },
  { Icon: PackageCheck, title: "Confirmamos y enviamos", desc: "Verificamos tu pago y coordinamos el envío desde Santa Marta." },
];

/** "Cómo comprar en 5 pasos" — REDESIGN_V2_BRIEF.md Fase 2 bloque 10. */
export function ComoComprar() {
  return (
    <section className="py-14 md:py-20 px-3 md:px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <p
          className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Sin vueltas
        </p>
        <h2 className="font-display text-white text-3xl md:text-5xl uppercase">
          Cómo comprar
        </h2>
      </div>

      <GroupReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative">
            <div className="w-11 h-11 rounded-full border border-[#A47C42]/40 flex items-center justify-center mb-4">
              <step.Icon size={18} className="text-[#C4A06A]" aria-hidden="true" />
            </div>
            <p
              className="text-[#C4A06A] text-xs mb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Paso {i + 1}
            </p>
            <h3
              className="text-white font-semibold text-sm mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {step.title}
            </h3>
            <p className="text-white/60 text-xs leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </GroupReveal>
    </section>
  );
}
