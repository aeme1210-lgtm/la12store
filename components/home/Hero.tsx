"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BRAND_URLS } from "@/lib/brand-urls";
import { whatsAppLink } from "@/lib/whatsapp";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

/**
 * Hero editorial — REDESIGN_V2_BRIEF.md Fase 2, bloque 3.
 *
 * ANTES (HeroSlider.tsx, eliminado): carrusel automático cada 5s, logo
 * animado letra por letra (11 elementos), scroll-bounce con repeat:Infinity.
 * Todo eliminado — una sola fotografía, altura estable, un titular breve,
 * máximo 2 CTA, sin animación continua. Ver docs/redesign-v2-audit.md.
 */
export function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] max-h-[820px] overflow-hidden -mt-14 md:-mt-20">
      <Image
        src={BRAND_URLS.hero[0]}
        alt="La 12 Store — camisetas de fútbol con historia"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradiente — legibilidad del texto, no decorativo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0A] via-black/50 to-black/10" />

      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 md:pb-20 px-4 text-center">
        <FadeInUp className="max-w-2xl">
          <p
            className="text-[#C4A06A] text-[10px] md:text-xs tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Santa Marta · Colombia
          </p>

          <h1
            className="font-display text-white text-4xl sm:text-5xl md:text-7xl uppercase leading-[0.95] mb-5"
          >
            Camisetas que
            <br />
            cuentan historias
          </h1>

          <p
            className="text-white/85 text-sm md:text-base mb-8"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Dorsal y parches personalizados, siempre gratis. Envío gratis en todas las camisetas de
            la web.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalogo"
              className="px-8 py-3.5 bg-[#D95632] text-white font-bold uppercase tracking-widest hover:bg-[#c14a29] transition-colors duration-200 rounded-lg text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Explorar colección
            </Link>
            <a
              href={whatsAppLink("Hola La 12 Store!")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-white/40 text-white font-bold uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all duration-200 rounded-lg text-sm flex items-center gap-2 justify-center"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <MessageCircle size={15} aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
