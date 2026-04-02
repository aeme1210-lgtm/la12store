"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ChevronDown } from "lucide-react";

const B = "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/";
const u = (f: string) => B + encodeURIComponent(f);

export const BRAND_URLS = {
  logo:     u("WhatsApp Image 2026-04-01 at 14.39.59 (3).jpeg"),
  nosotros: u("WhatsApp Image 2026-04-01 at 14.39.58 (3).jpeg"),
  hero: [
    u("WhatsApp Image 2026-04-01 at 14.39.56.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.56 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57.jpeg"),
  ],
  gallery: [
    u("WhatsApp Image 2026-04-01 at 14.39.57 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57 (2).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58 (2).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57 (1) (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.59.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.59 (1).jpeg"),
  ],
};

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % BRAND_URLS.hero.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden -mt-16 md:-mt-20">
      {/* Background slides — crossfade 2s */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={BRAND_URLS.hero[current]}
            alt="La 12 Store lifestyle"
            fill
            priority={current === 0}
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/55 to-black/20 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* "Santa Marta, Colombia" ABOVE the logo — premium brand pattern */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#D4AF37] text-[10px] md:text-xs tracking-[0.5em] uppercase mb-6"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Santa Marta · Colombia
        </motion.p>

        {/* Logo — mix-blend-mode:multiply removes white background on dark bg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src={BRAND_URLS.logo}
            alt="La 12 Store"
            width={150}
            height={75}
            className="object-contain"
            style={{ mixBlendMode: "multiply", filter: "invert(1)" }}
            unoptimized
            priority
          />
        </motion.div>

        {/* Slogan — Playfair Display */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-white/90 text-xl md:text-3xl mb-10 font-bold italic"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Camisetas de fútbol premium
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/catalogo"
            className="px-8 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-[#F0D060] transition-colors duration-200 rounded-lg text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver Catálogo
          </Link>
          <a
            href="https://wa.me/573008443885?text=Hola%20La%2012%20Store!"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-white/40 text-white font-bold uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all duration-200 rounded-lg text-sm flex items-center gap-2 justify-center"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </motion.div>

        {/* Slide dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-2 mt-10"
        >
          {BRAND_URLS.hero.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-px rounded-full transition-all duration-500 ${
                i === current ? "w-10 bg-[#D4AF37]" : "w-4 bg-white/30"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll bounce */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50"
      >
        <div className="w-px h-5 bg-gradient-to-b from-transparent to-[#D4AF37]" />
        <ChevronDown size={12} className="text-[#D4AF37]" />
      </motion.div>
    </section>
  );
}
