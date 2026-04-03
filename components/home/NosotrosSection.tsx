"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { BRAND_URLS } from "@/lib/brand-urls";

export function NosotrosSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Subtle parallax: background shifts slightly relative to scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative py-0 overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/PAREJA%20QUIENES%20SOMOS.jpeg"
          alt="Andrés y Silvana — La 12 Store"
          fill
          className="object-cover object-center scale-110"
          unoptimized
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[500px] md:min-h-[600px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl text-center"
        >
          <p
            className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Nuestra historia
          </p>
          <h2
            className="text-3xl md:text-5xl font-black text-white uppercase mb-6 leading-tight"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Pasión por el fútbol
            <br />
            <span className="text-[#D4AF37]">desde Santa Marta</span>
          </h2>
          <p
            className="text-white/80 text-base md:text-lg mb-8 leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Somos Andrés y Silvana, desde Santa Marta para el mundo. La 12 Store nació de nuestra
            pasión por el fútbol y las camisetas con historia. Cada prenda que vendemos la
            elegimos con el mismo amor con que la usaríamos nosotros.
          </p>
          <Link
            href="/nosotros"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-8 py-3 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Conócenos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
