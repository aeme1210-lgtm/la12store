import Link from "next/link";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * Bloque editorial (redesign-v3): lo que separa una marca de un catálogo es
 * que dice algo. Fondo marfil para romper el negro continuo del sitio.
 */
export function Manifesto() {
  return (
    <section className="bg-[#F1EBDD] py-20 md:py-28 px-5">
      <FadeInUp className="max-w-4xl mx-auto">
        <p
          className="text-[#6B202B] text-[10px] md:text-xs tracking-[0.4em] uppercase mb-6"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Por qué existimos
        </p>
        <p className="font-display text-[#0B0B0A] text-3xl md:text-5xl uppercase leading-[1.1]">
          La camiseta es lo que queda cuando el partido se acaba.
        </p>
        <div
          className="grid md:grid-cols-2 gap-6 md:gap-12 mt-10 text-[#0B0B0A]/75 text-base leading-relaxed"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <p>
            Se queda en la foto del estadio, en el viaje a la playa, en la noche que tu equipo
            ganó contra todo pronóstico. Por eso no vendemos tela con un escudo: vendemos la
            camiseta del recuerdo que tú escojas.
          </p>
          <p>
            Desde Santa Marta escogemos cada referencia, la personalizamos con tu nombre y tu
            número sin costo y te acompañamos por WhatsApp hasta que llega a tu puerta.
          </p>
        </div>
        <Link
          href="/nosotros"
          className="inline-block mt-10 text-[#6B202B] font-semibold uppercase tracking-[0.2em] text-xs border-b border-[#6B202B]/40 hover:border-[#6B202B] pb-1 transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Nuestra historia →
        </Link>
      </FadeInUp>
    </section>
  );
}
