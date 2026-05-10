"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const COLORS = ["#A50044", "#004D98", "#FFD700", "#A50044", "#004D98"];
const TOTAL = 40; // máx partículas simultáneas

interface Particle {
  id: number;
  x: number;       // % horizontal
  delay: number;   // s
  duration: number; // s
  size: number;    // px
  color: string;
  rotate: number;  // deg final
  shape: "rect" | "circle";
}

function seededRandom(seed: number) {
  // Simple deterministic LCG para generar valores estables en SSR
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildParticles(): Particle[] {
  const rand = seededRandom(42);
  return Array.from({ length: TOTAL }, (_, i) => ({
    id: i,
    x: rand() * 100,
    delay: rand() * 6,
    duration: 4 + rand() * 4,
    size: 6 + rand() * 8,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    rotate: rand() > 0.5 ? 360 : -360,
    shape: rand() > 0.5 ? "rect" : "circle",
  }));
}

const particles = buildParticles();

export function ConfettiBlaugrana() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Limitar a máximo 40 partículas simultáneas (ya está definido en TOTAL)
  useEffect(() => {
    // noop — partículas controladas por TOTAL
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.x}%` }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0,
            ease: "linear",
          }}
        >
          <div
            style={{
              width: p.size,
              height: p.shape === "rect" ? p.size * 0.5 : p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
