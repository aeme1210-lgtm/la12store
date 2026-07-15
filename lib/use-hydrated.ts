"use client";
import { useEffect, useState } from "react";

/**
 * true solo después del montaje en cliente. Usar antes de leer cualquier
 * store persistido en localStorage (carrito, checkout) en una rama que
 * decide QUÉ árbol renderizar (no solo un texto) — el servidor nunca ve
 * localStorage, así que decidir la rama con datos aún no hidratados
 * produce mismatches de hidratación reales (confirmado en QA de Fase 5:
 * rompía el formulario del checkout en cada carga con carrito no vacío).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
