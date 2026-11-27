import Image from "next/image";
import { BRAND_URLS } from "@/lib/brand-urls";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * Lookbook (redesign-v3): fotos reales de la marca con las camisetas puestas.
 * Es la prueba visual de cómo se ven fuera de la foto de proveedor. Se
 * presentan como fotos de La 12 (no como "clientes") — no inventar
 * testimonios. Cuando haya fotos de clientes con permiso, van en un bloque
 * aparte.
 */
const LOOKS = [
  { src: BRAND_URLS.gallery[3], caption: "Real Madrid · Tercera 12/13" },
  { src: BRAND_URLS.gallery[4], caption: "Argentina · la 10" },
  { src: BRAND_URLS.gallery[0], caption: "Lazio · Retro manga larga" },
  { src: BRAND_URLS.gallery[1], caption: "Manchester United · Champions" },
  { src: BRAND_URLS.gallery[6], caption: "Italia · Retro" },
  { src: BRAND_URLS.gallery[2], caption: "Boca Juniors · Retro" },
];

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Lookbook() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <FadeInUp className="max-w-7xl mx-auto px-4 md:px-6 flex items-end justify-between gap-6 mb-8 md:mb-10">
        <div>
          <p
            className="text-[#C4A06A] text-[10px] tracking-[0.4em] uppercase mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Fuera de la cancha
          </p>
          <h2 className="font-display text-white text-3xl md:text-5xl uppercase">
            La calle es la tribuna
          </h2>
        </div>
        <a
          href="https://instagram.com/la12s_tore"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 text-white/70 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <InstagramIcon />
          @la12s_tore
        </a>
      </FadeInUp>

      {/* Carrusel nativo con scroll-snap — sin JS ni autoplay. */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LOOKS.map((look) => (
          <figure
            key={look.src}
            className="relative flex-shrink-0 w-[72vw] sm:w-[44vw] md:w-[30vw] lg:w-[23vw] aspect-[4/5] snap-start rounded-lg overflow-hidden bg-[#181816]"
          >
            <Image src={look.src} alt={look.caption} fill className="object-cover" sizes="(max-width: 768px) 72vw, 25vw" />
            <figcaption
              className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {look.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <a
        href="https://instagram.com/la12s_tore"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden mt-6 mx-4 inline-flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <InstagramIcon />
        Síguenos en @la12s_tore
      </a>
    </section>
  );
}
