"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { checkoutStepTransition } from "@/lib/motion";

/** Crossfade + slide corto (≤16px) entre pasos del checkout — brief Fase 3/5. */
export function StepTransition({
  stepKey,
  children,
}: {
  stepKey: string | number;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
        transition={checkoutStepTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
