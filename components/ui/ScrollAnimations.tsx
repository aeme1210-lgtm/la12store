"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { EASE_IN, DURATION, REVEAL_DISTANCE_PX } from "@/lib/motion";

/**
 * Sistema de reveal editorial — REDESIGN_V2_BRIEF.md Fase 1.
 *
 * Reglas: opacidad + translate ≤16px, una sola vez (`viewport.once`), sin
 * `scale` (el 0.9/0.95 de la versión anterior era justo el patrón que causaba
 * inestabilidad percibida). Respeta `prefers-reduced-motion` explícitamente
 * vía `useReducedMotion()`, no solo la regla CSS global.
 *
 * ANTES había 3 componentes de dirección (Up/Left/Right) + ScaleIn +
 * StaggerContainer/Item duplicados en dos archivos distintos
 * (components/ui/ScrollAnimations.tsx y components/home/AnimateOnView.tsx,
 * este último código muerto, nunca importado — se eliminó). Ahora es UNA
 * sola implementación parametrizada por dirección.
 */

type Direction = "up" | "left" | "right";

function offsetFor(direction: Direction): { x?: number; y?: number } {
  if (direction === "up") return { y: REVEAL_DISTANCE_PX };
  if (direction === "left") return { x: -REVEAL_DISTANCE_PX };
  return { x: REVEAL_DISTANCE_PX };
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function Reveal({ direction, children, delay = 0, className = "" }: RevealProps & { direction: Direction }) {
  const reduce = useReducedMotion();
  const initial = reduce ? { opacity: 0 } : { opacity: 0, ...offsetFor(direction) };
  const animate = reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DURATION.editorial, delay, ease: EASE_IN }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp(props: RevealProps) {
  return <Reveal direction="up" {...props} />;
}

export function FadeInLeft(props: RevealProps) {
  return <Reveal direction="left" {...props} />;
}

export function FadeInRight(props: RevealProps) {
  return <Reveal direction="right" {...props} />;
}

/**
 * Reveal de grupo — para bloques decorativos (no tarjetas de producto: esas
 * se renderizan sin animación de entrada, ver docs/DECISIONS_V2.md). Anima
 * el contenedor una vez, no cada hijo individualmente — mucho más barato en
 * grillas con varios elementos.
 */
export function GroupReveal({ children, delay = 0, className = "" }: RevealProps) {
  return <Reveal direction="up" delay={delay} className={className}>{children}</Reveal>;
}
