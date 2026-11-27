import Link from "next/link";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * Fan / Jugador / Retro (redesign-v3) — la pregunta que más se repite por
 * WhatsApp, respondida antes de que la hagan. Precios = lib/pricing.ts.
 */
const VERSIONS = [
  {
    name: "Fan",
    price: "$150.000",
    fit: "Corte regular",
    body: "La que usa la tribuna. Holgada y cómoda para todo el día. Tallas hasta 4XL.",
    href: "/catalogo",
  },
  {
    name: "Jugador",
    price: "$180.000",
    fit: "Corte entallado",
    body: "La misma tela técnica y liviana que se usa en cancha, ajustada al cuerpo. Si estás entre dos tallas, pide la grande.",
    href: "/catalogo?version=Player",
  },
  {
    name: "Retro",
    price: "$170.000",
    fit: "Corte de época",
    body: "Reediciones de camisetas históricas, con los cuellos, sponsors y detalles de su temporada original.",
    href: "/catalogo?liga=retro",
  },
];

export function VersionGuide() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-[#181816]">
      <div className="max-w-6xl mx-auto">
        <FadeInUp className="max-w-2xl mb-10 md:mb-14">
          <p
            className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Antes de escoger
          </p>
          <h2 className="font-display text-white text-3xl md:text-5xl uppercase mb-4">
            ¿Fan, Jugador o Retro?
          </h2>
          <p className="text-white/60" style={{ fontFamily: "var(--font-inter)" }}>
            Tres versiones, tres maneras de llevarla. Manga larga en cualquiera: $185.000.
          </p>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-lg overflow-hidden">
          {VERSIONS.map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group bg-[#181816] hover:bg-[#221F1C] p-6 md:p-8 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-display text-white text-2xl md:text-3xl uppercase group-hover:text-[#C4A06A] transition-colors">
                  {v.name}
                </h3>
                <span className="text-white font-semibold" style={{ fontFamily: "var(--font-inter)" }}>
                  {v.price}
                </span>
              </div>
              <p
                className="text-[#C4A06A] text-[10px] uppercase tracking-[0.25em] mb-3"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {v.fit}
              </p>
              <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                {v.body}
              </p>
              <span
                className="inline-block mt-6 text-white/50 group-hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Ver camisetas →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
