"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  const targetRef = useRef(target);
  targetRef.current = target;

  function start() {
    if (startedRef.current) return;
    const t = targetRef.current;
    if (t === 0) return;
    startedRef.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * t));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { count, start };
}

export function CounterBanner({ total }: { total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const { count, start } = useCounter(total);

  useEffect(() => {
    if (isInView) start();
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0A 0%, #1a1a0f 50%, #0A0A0A 100%)",
      }}
    >
      {/* Decorative gold lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4AF37]/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4AF37]/10 to-transparent" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* Counter */}
        <p
          className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Nuestro catálogo
        </p>
        <h2
          className="text-6xl md:text-8xl font-black text-white mb-2 tabular-nums"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          +{count.toLocaleString("es-CO")}
        </h2>
        <p
          className="text-xl md:text-3xl font-bold text-[#D4AF37] uppercase tracking-wider mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          camisetas disponibles
        </p>
        <p className="text-[#A0A0A0] text-base mb-10 max-w-lg mx-auto" style={{ fontFamily: "var(--font-inter)" }}>
          Dorsal personalizado y parches incluidos{" "}
          <span className="text-[#D4AF37] font-bold">sin costo adicional</span> en cada pedido.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-3 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-black px-10 py-4 rounded-lg uppercase tracking-widest transition-all duration-300 text-sm"
          style={{
            fontFamily: "var(--font-inter)",
            boxShadow: "0 0 30px rgba(212,175,55,0.3)",
          }}
        >
          Explorar catálogo
        </Link>
      </div>
    </section>
  );
}
