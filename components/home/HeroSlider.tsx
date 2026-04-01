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
    u("WhatsApp Image 2026-04-01 at 14.39.59.jpeg"),
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
      {/* Slides — crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={BRAND_URLS.hero[current]}
            alt="La 12 Store lifestyle"
            fill
            priority={current === 0}
            className="object-cover object-center"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — bottom-up */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/50 to-black/10 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Logo image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-5"
        >
          <Image
            src={BRAND_URLS.logo}
            alt="La 12 Store"
            width={200}
            height={100}
            className="object-contain drop-shadow-2xl"
            unoptimized
            priority
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-white/90 text-lg md:text-xl mb-2 font-light"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Camisetas de fútbol premium
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="text-[#D4AF37] text-xs tracking-[0.35em] uppercase mb-10"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Santa Marta, Colombia
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/catalogo"
            className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300 rounded-lg text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Ver Catálogo
          </Link>
          <a
            href="https://wa.me/573008443885?text=Hola%20La%2012%20Store%2C%20quiero%20información"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-[#25D366] text-[#25D366] font-bold uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all duration-300 rounded-lg text-sm flex items-center gap-2 justify-center"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </motion.div>

        {/* Slide dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-2 mt-8"
        >
          {BRAND_URLS.hero.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-[#D4AF37]" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll bounce indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-60"
      >
        <div className="w-px h-6 bg-gradient-to-b from-transparent to-[#D4AF37]" />
        <ChevronDown size={14} className="text-[#D4AF37]" />
      </motion.div>
    </section>
  );
}
