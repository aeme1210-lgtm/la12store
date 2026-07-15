/**
 * Sistema de motion centralizado — REDESIGN_V2_BRIEF.md, Fase 1.
 *
 * Un solo lugar para duraciones y curvas. Nada en el proyecto debe declarar
 * su propia duración/easing suelta — importar de aquí.
 *
 * Rangos del brief:
 *   micro           140-180ms  (hover, toggles pequeños)
 *   drawer          220-300ms  (carrito, buscador, menú móvil)
 *   checkoutStep    220-320ms  (paso a paso del checkout)
 *   editorial       350-550ms  (revelado de secciones al hacer scroll)
 *   shared          ≤400ms     (transición compartida entre vistas)
 *
 * Curvas: entrada cubic-bezier(0.22,1,0.36,1) — desacelera con energía;
 *         salida  cubic-bezier(0.4,0,1,1)     — acelera hacia afuera.
 */

export const EASE_IN = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT = [0.4, 0, 1, 1] as const;

export const DURATION = {
  micro: 0.16,
  drawer: 0.26,
  checkoutStep: 0.28,
  editorial: 0.42,
  shared: 0.35,
} as const;

/** Reveal editorial estándar: opacidad + translate ≤16px, una sola vez. */
export const REVEAL_DISTANCE_PX = 16;

export const revealTransition = {
  duration: DURATION.editorial,
  ease: EASE_IN,
} as const;

export const drawerTransition = {
  duration: DURATION.drawer,
  ease: EASE_IN,
} as const;

export const drawerExitTransition = {
  duration: DURATION.drawer,
  ease: EASE_OUT,
} as const;

export const microTransition = {
  duration: DURATION.micro,
  ease: EASE_IN,
} as const;

export const checkoutStepTransition = {
  duration: DURATION.checkoutStep,
  ease: EASE_IN,
} as const;
