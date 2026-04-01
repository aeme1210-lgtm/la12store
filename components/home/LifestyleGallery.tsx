"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_URLS } from "./HeroSlider";

// Each photo has an optional rowSpan for masonry feel
const photos = BRAND_URLS.gallery.map((src, i) => ({
  src,
  alt: `La 12 Store — lifestyle ${i + 1}`,
  tall: [0, 3].includes(i), // images 0 and 3 span 2 rows
}));

export function LifestyleGallery() {
  return (
    <section className="py-20 md:py-28 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p
          className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Nuestra comunidad
        </p>
        <h2
          className="text-3xl md:text-5xl font-black text-white uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          El estilo que nos define
        </h2>
      </motion.div>

      {/* Masonry grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[260px]">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-xl group cursor-pointer ${
              photo.tall ? "row-span-2" : ""
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-400 flex items-center justify-center">
              <Link
                href="/catalogo"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-[#D4AF37] text-black font-black text-xs px-5 py-2.5 rounded-full uppercase tracking-widest"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Ver Catálogo
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
