# DECISIONES AUTÓNOMAS — REDESIGN V2

> Cada decisión tomada sin preguntar (modo autónomo), con justificación de una línea.
> Formato: **[Fase] Decisión** — Justificación.

- **[Setup] Rama `redesign-v2` creada desde `master` (no desde `redesign`)** — el brief pide reproducir y auditar los problemas de la versión ya publicada en producción; ramificar desde ahí evita arrastrar cualquier deuda de la rama de trabajo anterior.
- **[Setup] `/backups/` agregado a `.gitignore`** — instrucción explícita del brief (backups locales, no se versionan, pueden contener datos reales/pesados).
- **[Fase 0/2] Tipografía "Archivo Black/Expanded": se usa la fuente variable `Archivo` (next/font/google la soporta, confirmado en `font-data.json`) con eje `wght` hasta 900 (Black) y eje `wdth` hasta 125 (expandido real vía variación, no letter-spacing) — no existe una familia separada "Archivo Expanded" en Google Fonts, pero la variable sí trae el eje de ancho, así que se logra el efecto pedido de forma nativa y auténtica.**
- **[Fase 0/3] View Transitions API: NO se implementa, se usa el fallback sin animación** — verificado con `node -e` que React 19.2.4 (versión real instalada) NO exporta el componente experimental `ViewTransition` (solo `startTransition`/`useTransition`, que son la API de Concurrent Mode, no de transiciones visuales). Intentar la View Transitions nativa del navegador a mano por fuera de React, coordinada con la navegación de Next.js App Router, es frágil y no está oficialmente soportado — justo el tipo de inestabilidad que la Fase 1 pide eliminar, no agregar. El brief autoriza explícitamente este fallback ("solo si es estable... fallback sin animación").
