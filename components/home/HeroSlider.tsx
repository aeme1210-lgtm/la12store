"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ChevronDown } from "lucide-react";

import { BRAND_URLS } from "@/lib/brand-urls";
export { BRAND_URLS } from "@/lib/brand-urls";

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

        {/* Logo — letter-by-letter stagger animation */}
        <div className="flex justify-center flex-wrap mb-6">
          {"LA 12 STORE".split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: "easeOut" }}
              className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-wider uppercase ${
                i >= 6 ? "text-[#D4AF37]" : "text-white"
              }`}
              style={{ fontFamily: "var(--font-oswald)", letterSpacing: "0.08em" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Main headline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-white/90 text-base sm:text-xl md:text-3xl mb-3 font-bold italic px-4 text-center"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Las camisetas más exclusivas de fútbol en Colombia
        </motion.p>

        {/* Subtexto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-[#D4AF37] text-xs md:text-sm tracking-widest uppercase mb-10"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Ediciones limitadas · Dorsal gratis · Envío a todo el mundo
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
            Explorar Colección
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
