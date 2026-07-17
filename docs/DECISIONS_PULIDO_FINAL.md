# DECISIONES — PULIDO FINAL

> Rama `pulido-final` (creada desde `redesign-v2`, no mergeada a `master`).
> Mismo formato que `docs/DECISIONS_V2.md`.

- **Imagen oficial de guía de tallas**: provista por el dueño vía WhatsApp,
  verificada visualmente (Fan/Player/Mujer con medidas) antes de commitear a
  `public/images/guia-tallas-oficial-la12store.png`. Reemplaza la tabla HTML
  que había en `ProductDetail.tsx` con cifras de pecho/largo que NO coincidían
  con los datos oficiales del negocio (eran una aproximación genérica, no la
  guía real) — la ficha de producto ahora muestra la imagen oficial completa.
- **Segunda cuenta Bancolombia agregada**, dato confirmado directamente por el
  dueño en esta sesión (no inventado): ahorros, titular Andrés Méndez, número
  91202310007. Ambas cuentas Bancolombia comparten `name: "Bancolombia"`
  (correcto para no filtrar titulares fuera del checkout vía
  `paymentMethodNames()`, ahora deduplicado); dentro del checkout
  (`Step4Pago.tsx`) se distinguen mostrando el titular bajo el nombre en cada
  tarjeta, para que el cliente elija la correcta sin ambigüedad.
- **Bug real de iPhone encontrado y corregido: "títulos cortados"** —
  `Navbar.tsx` combinaba un emoji (🔥/🏆) y texto con gradiente
  (`background-clip: text` + `-webkit-text-fill-color: transparent`) dentro
  del MISMO nodo de texto, en los links promocionales "SUPER CLÁSICO -15%" y
  "BARÇA CAMPEÓN -20%" (versión desktop y móvil, 4 ocurrencias). Es un bug
  documentado y reproducible específico de iOS Safari/WebKit: al aplicar
  relleno transparente a un nodo que contiene un emoji, WebKit intercambia mal
  las capas de color del glifo emoji con el clip de texto, y el resultado
  visible es exactamente "título cortado" (el emoji y a veces la primera
  palabra se recortan o desaparecen). Corregido separando el emoji en un
  `<span>` hermano fuera del estilo de gradiente — el emoji mantiene su color
  nativo, solo el texto queda con el efecto de gradiente. Se añadió también la
  propiedad estándar `backgroundClip: "text"` (antes solo existía el prefijo
  `Webkit`) en las 5 ocurrencias del patrón en el proyecto, incluida
  `app/campeones-barca/page.tsx` (esa no tenía emoji adyacente, pero se
  endurece por consistencia). No se pudo confirmar en un iPhone físico desde
  este entorno — pendiente de verificación visual real por el dueño antes de
  aprobar el merge (ver checklist de QA).
- **Reclamo de envío "a toda Colombia y el mundo" corregido en 2 lugares**:
  `components/home/Hero.tsx` (subtítulo del hero, la superficie más visible
  del sitio) y la meta description global en `app/layout.tsx`. Ambos seguían
  afirmando envío internacional pese a que la Fase 5 de `redesign-v2` ya había
  retirado ese mismo reclamo de `/faq` y la ficha de producto por no ser un
  dato de negocio confirmado (ver `docs/DECISIONS_V2.md`) — esta pasada de
  pulido encontró que sobrevivía en 2 superficies adicionales no revisadas
  entonces. Reemplazado por el texto honesto ya usado en el resto del sitio
  (`lib/shipping.ts`): gratis en Santa Marta, resto de Colombia se confirma
  por WhatsApp. Sin mención de envío internacional en ningún lugar, consistente
  con que no es un dato de negocio confirmado.
- **Checkbox de aceptación de políticas agregado en el checkout** (paso 3,
  Revisión, `Step3Revision.tsx`), obligatorio para poder confirmar el pedido:
  "He leído y acepto la política de cambios y devoluciones y los términos de
  uso", con enlaces reales a `/cambios` y `/terminos` (ambas páginas ya
  existían y se revisaron: contenido honesto, sin cifras inventadas, con nota
  de pendiente de revisión legal formal — no requirieron cambios).

## Corrección posterior: envío gratis a toda Colombia, sin excepción

> **[SUPERA la entrada anterior de este mismo archivo](#).** El punto de
> "envío gratis en Santa Marta, resto de Colombia se confirma por WhatsApp"
> arriba (heredado de `redesign-v2` Fase 5) fue corregido por el dueño: no era
> la regla comercial correcta.

- **Regla comercial DEFINITIVA, dada directamente por el dueño, prevalece
  sobre `docs/DECISIONS_V2.md` y cualquier política de envío anterior**:
  todas las camisetas compradas desde la web tienen **envío GRATIS a toda
  Colombia**, sin excepción de ciudad, sin monto mínimo y sin "confirmar por
  WhatsApp" el costo. `lib/shipping.ts` reescrito como fuente única: un solo
  valor (`SHIPPING.nacional`, costo `0`, label "Envío gratis en todas las
  camisetas de la web"), sin distinción Santa Marta/nacional.
- **Barrido de coherencia completo** — se buscaron y corrigieron todas las
  contradicciones restantes de "Santa Marta gratis / resto se confirma" y
  "según destino" en: `Hero.tsx`, meta description de `app/layout.tsx` y
  `app/page.tsx`, `Footer.tsx`, `ProductDetail.tsx` (banda de envío + acordeón
  "Envíos y cambios"), `app/terminos/page.tsx`, `app/faq/page.tsx`,
  `UrgencyBar.tsx` (ahora incluye "envío gratis" en el mensaje rotativo),
  `Step2Entrega.tsx` y `Step3Revision.tsx` del checkout (fila "Envío" ahora
  muestra literalmente "GRATIS · $0", se eliminó el aviso "el envío no está
  incluido en el total — se confirma por WhatsApp"), `app/carrito/page.tsx`
  (decía "Por confirmar", corregido a "GRATIS · $0"), y `lib/whatsapp.ts`
  (`buildOrderMessage` ahora incluye una línea "Envío: GRATIS · $0" en el
  mensaje enviado al negocio). Los envíos internacionales (fuera de Colombia)
  NO están cubiertos por esta regla — siguen sin ser un dato de negocio
  confirmado, se mantiene la invitación honesta a confirmar por WhatsApp en
  `/faq` para ese caso específico, sin contradecir la regla nacional.
- **Plazo de entrega actualizado**: "20-25 días hábiles" → "25 a 30 días
  calendario" en `app/faq/page.tsx` (dato dado directamente por el dueño en
  esta corrección). También se quitó de esa misma respuesta la mención "En
  Santa Marta la entrega es personal", que ya no aplicaba tras unificar la
  política de envío.
- **Links de navbar "SUPER CLÁSICO -15%" y "BARÇA CAMPEÓN -20%" eliminados
  por completo** (`Navbar.tsx`, desktop y móvil) — el dueño confirmó que son
  promociones vencidas que ya no existen.

## Eliminación completa de las promos vencidas (Súper Clásico / Barça Campeón)

- **Hallazgo en la base de datos (solo se reporta, no se tocó ninguna fila)**:
  la tabla `Promo` tiene una única fila, slug `campeones-barca`, con
  `active: false` (venció el 2026-05-11, hoy es 2026-07-16) — ya estaba
  auto-desactivada por la lógica existente en `lib/promo-barca.ts`. La promo
  "Súper Clásico" nunca tuvo fila en esta tabla: estaba fijada por código a
  una sola fecha ya pasada (19 de abril de 2026) en
  `lib/promo-super-clasico.ts`. Ninguna de las dos está activa hoy en ningún
  sentido — confirma lo que dijo el dueño, no fue solo de palabra.
- **Archivos eliminados por completo** (rutas, componentes y lógica
  exclusivos de estas 2 promos, verificado que ningún otro archivo los usa
  antes de borrar):
  - `app/super-clasico/page.tsx`, `app/campeones-barca/page.tsx`
  - `app/api/promo-barca-status/route.ts`,
    `app/api/admin/activar-promo-barca/route.ts`
  - `lib/promo-barca.ts`, `lib/promo-super-clasico.ts`
  - `components/promo/BarcaCountdown.tsx`,
    `components/promo/ConfettiBlaugrana.tsx` (solo la usaba `BarcaCountdown`),
    `components/promo/SuperClasicoCountdown.tsx`,
    `components/promo/SuperClasicoCard.tsx`
  - `proxy.ts` (middleware de Next 16, su única función era redirigir
    `/super-clasico` a `/catalogo` tras vencer la promo — sin la ruta, no
    tiene nada que hacer)
- **Referencias limpiadas en el resto del código** (no eran la ruta en sí,
  pero dependían de ella):
  - `Navbar.tsx`: estado `isPromoActive`/`isBarcaPromoActive`, el `fetch` a
    `/api/promo-barca-status`, y los 4 bloques de link (desktop + móvil).
  - `app/page.tsx`: los 2 banners superiores de portada ("¡BARÇA CAMPEÓN DE
    LIGA!" y "PROMO SUPER CLÁSICO") y su lógica (`promoActive`, `barcaPromo`).
  - `app/catalogo/page.tsx`: dejó de calcular `barcaPromoActive` y de pasar
    `showBarcaBadge` a cada `ProductCard`.
  - `components/product/ProductCard.tsx`: se quitaron las props
    `showBarcaBadge` (badge "-20%") y `discountPercent` (precio tachado) —
    ambas quedaban muertas sin `campeones-barca/page.tsx`, que era el único
    lugar que las usaba.
- **Qué se dejó intacto a propósito**: la tabla `Promo` en el esquema de
  Prisma y `promo-rls.sql` (políticas de seguridad de esa tabla en Supabase)
  — el dueño pidió explícitamente no borrar filas de la base de datos, y la
  tabla en sí es infraestructura genérica reutilizable para una futura promo,
  no algo exclusivo de Súper Clásico o Barça Campeón.
- **Balance del navbar verificado**: los 4 links eliminados eran
  renderizado condicional (`{isPromoActive && ...}` / `{isBarcaPromoActive &&
  ...}`) casi siempre en `false` — el navbar en producción ya se veía, el
  99% del tiempo, exactamente igual a como queda ahora. No se necesitó
  ningún ajuste adicional de espaciado en desktop ni en móvil.
