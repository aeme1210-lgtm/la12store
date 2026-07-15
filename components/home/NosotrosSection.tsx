"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeInUp } from "@/components/ui/ScrollAnimations";

export function NosotrosSection() {
  return (
    <section className="relative py-0 overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Fondo estático — REDESIGN_V2 Fase 1: se quitó el parallax real
          (useScroll/useTransform) explícitamente prohibido para móvil, causa
          común de jank en Safari/iOS con scroll-linked transforms. */}
      <div className="absolute inset-0">
        <Image
          src="https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/PAREJA%20QUIENES%20SOMOS.jpeg"
          alt="Andrés y Silvana — La 12 Store"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[500px] md:min-h-[600px] px-4">
        <FadeInUp className="max-w-2xl text-center">
          <p
            className="text-[#A47C42] text-xs tracking-[0.4em] uppercase mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Nuestra historia
          </p>
          <h2
            className="text-3xl md:text-5xl font-black text-white uppercase mb-6 leading-tight"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Pasión por el fútbol
            <br />
            <span className="text-[#A47C42]">desde Santa Marta</span>
          </h2>
          <p
            className="text-white/80 text-base md:text-lg mb-8 leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Somos Andrés y Silvana, desde Santa Marta para el mundo. La 12 Store nació de nuestra
            pasión por el fútbol y las camisetas con historia. Cada prenda que vendemos la
            elegimos con el mismo amor con que la usaríamos nosotros.
          </p>
          <Link
            href="/nosotros"
            className="inline-flex items-center gap-2 border border-[#A47C42] text-[#A47C42] hover:bg-[#A47C42] hover:text-black font-bold px-8 py-3 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Conócenos
          </Link>
        </FadeInUp>
      </div>
    </section>
  );
}
