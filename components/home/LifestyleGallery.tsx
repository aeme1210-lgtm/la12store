"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_URLS } from "./HeroSlider";

const photos = BRAND_URLS.gallery; // 8 photos — use first 6

export function LifestyleGallery() {
  return (
    <section className="py-20 md:py-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10 px-4"
      >
        <p
          className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-3"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Nuestra comunidad
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-[#FAFAFA]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          El estilo que nos define
        </h2>
      </motion.div>

      {/* Editorial layout — 4px gap, no text overlay */}
      <div className="flex flex-col gap-1">
        {/* Row 1: 60% / 40% */}
        <div className="flex gap-1 h-[55vw] max-h-[500px] min-h-[240px]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex-[3] overflow-hidden group"
          >
            <Image
              src={photos[0]}
              alt="La 12 Store lifestyle"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 60vw, 60vw"
              unoptimized
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="relative flex-[2] overflow-hidden group"
          >
            <Image
              src={photos[1]}
              alt="La 12 Store lifestyle"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 40vw, 40vw"
              unoptimized
            />
          </motion.div>
        </div>

        {/* Row 2: 4 equal columns */}
        <div className="flex gap-1 h-[28vw] max-h-[280px] min-h-[140px]">
          {[photos[2], photos[3], photos[4], photos[5]].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.04 * (i + 1) }}
              className="relative flex-1 overflow-hidden group"
            >
              <Image
                src={src}
                alt="La 12 Store lifestyle"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 25vw, 25vw"
                unoptimized
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
