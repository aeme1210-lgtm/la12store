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

## Correcciones críticas post-revisión en iPhone real

> El reporte anterior daba por resueltos los títulos cortados (arreglo del
> emoji+gradiente en `Navbar.tsx`) — el dueño probó la preview real en un
> iPhone físico y seguían fallando. Esa corrección era real pero no era la
> causa de los 2 casos reportados esta vez (Estrenos 26/27, CTA de WhatsApp
> del hero). Se investigó de nuevo desde cero con `getComputedStyle` en la
> preview real (Chrome DevTools vía automatización), no por inspección visual
> del código.

### 1) Causa raíz real de los títulos cortados/solapados

**`app/globals.css` tenía `* { box-sizing: border-box; margin: 0; padding: 0; }`
declarado FUERA de cualquier `@layer`.** En CSS, una regla sin capa
(`@layer`) le gana a CUALQUIER regla dentro de una capa — sin importar
especificidad. Tailwind v4 (`@import "tailwindcss"`) genera sus utilidades
(`.mb-8`, `.py-14`, `.px-8`, etc.) dentro de `@layer utilities`. Resultado:
ese reset anulaba TODAS las utilidades de margin/padding de Tailwind en el
sitio entero, no solo en Estrenos o el Hero. Confirmado con
`getComputedStyle` en la preview real: `margin-bottom` del header de
"Estrenos 26/27" medía `0px` pese a tener `mb-8 md:mb-10`; el botón de
WhatsApp del hero tenía `padding: 0px` pese a `py-3.5 px-8`, quedando su
borde inferior pegado al `overflow-hidden` del hero (`h-[90vh]`) — de ahí la
"franja" que se veía. **Fix**: envolver el reset en `@layer base` para que
las utilidades (capa posterior) vuelvan a ganar.

Efectos secundarios del mismo bug, corregidos de una sola vez: paddings de
tarjetas overlay (`WorldsGrid.tsx`), separación de TODAS las secciones con
`py-*`/`px-*`/`mb-*`/`gap` — ningún componente necesitó cambios propios, el
fix vive en un solo lugar.

Reglas adicionales aplicadas, tal como se pidió:
- **`line-height` de titulares display**: `.font-display` (Archivo Black
  Expanded) también vivía sin capa — se movió a `@layer components` (para
  que un `leading-*` explícito en un componente concreto pueda seguir
  ganando cuando haga falta) y se le agregó un piso `line-height: 1.15`
  (antes heredaba el default de Tailwind, `1` en tamaños grandes como
  `text-5xl` — insuficiente para acentos españoles en peso Black expandido).
  El único `leading-[0.95]` explícito del sitio (título del Hero) se subió a
  `leading-[1.05]`, el piso mínimo pedido.
- **Hero sin altura fija arriesgada**: `h-[90vh] min-h-[600px]
  max-h-[820px] overflow-hidden` → `min-h-[90vh] max-h-[820px]
  overflow-hidden` — ahora la sección nunca puede ser más chica que su
  contenido real (título + subtítulo + 2 CTAs), crece si hace falta, en vez
  de arriesgarse a recortarlo. La negativa `-mt-14 md:-mt-20` del Hero se
  dejó intacta a propósito: es la única del sitio (verificado con grep en
  todos los componentes) y es intencional — sube la foto por debajo del
  navbar transparente fijo, no es el bug de "grilla montada sobre header"
  que se pidió buscar.

**Hallazgo adicional (no pedido, corregido igual)**: el sistema de reveal
`FadeInLeft`/`FadeInRight`/`FadeInUp`/`GroupReveal`
(`components/ui/ScrollAnimations.tsx`) usaba `viewport={{ amount: 0.3 }}` —
exige que el 30% del PROPIO alto del bloque esté visible para animarse. Para
bloques mucho más altos que el viewport (ej. la columna de info completa de
la ficha de producto: precio + versión + talla + dorsal + cantidad +
botones + acordeón) eso puede no alcanzarse nunca en un viewport corto,
dejando el contenido en su estado inicial (`opacity:0`) para siempre. Se
cambió a `amount: "some"` (dispara con cualquier intersección, sin importar
el alto del bloque) — más correcto para bloques de altura variable, sin
cambiar la duración ni el resto de la animación.

### 2a) Causa raíz real de la guía de tallas rota

**Confirmado en orden, como se pidió:**
- `git ls-files` confirma que `public/images/guia-tallas-oficial-la12store.png`
  está commiteado (no fue un apagón a medias).
- La URL directa `/images/guia-tallas-oficial-la12store.png` en el deploy
  responde `200`, `Content-Type: image/png`, tamaño correcto — el archivo
  estático se sirve bien.
- **La causa real era el loader personalizado de imágenes**
  (`supabase-image-loader.js`, `next.config.ts: images.loader = "custom"`),
  aplicado a TODAS las imágenes de `next/image` del sitio, incluidas las
  locales de `/public`. El loader solo tenía ramas para URLs de Supabase
  Storage y de Yupoo; cualquier otra cosa (como una ruta local
  `/images/...`) caía al `else` final, que le ANTEPONÍA el host de Supabase
  Storage: `https://...supabase.co/storage/v1/object/public//images/guia-tallas-oficial-la12store.png`
  — una URL que no existe en el bucket, de ahí el icono de imagen rota.
  **Fix**: nueva rama al principio del loader — si `src` empieza con `/`
  (ruta local), se sirve tal cual, sin tocar las ramas de Supabase/Yupoo que
  ya funcionaban bien para productos.
- **Alcance real, más amplio que el reportado**: el mismo bug rompía
  también el placeholder de productos sin imagen
  (`/images/placeholder.jpg`, usado en `ProductCard.tsx` como imagen inicial
  y como fallback de `onError`) — cualquier producto sin foto o con una foto
  que fallara mostraba un icono roto en vez del placeholder. Corregido con
  el mismo fix, sin cambios adicionales.

### Rediseño del flujo de guía de tallas (2b)

Se eliminó el bloque blanco inline dentro de la ficha. Nuevo componente
`components/product/SizeGuideSheet.tsx` (bottom sheet en móvil, modal
centrado en desktop, con backdrop, foco atrapado y cierre por Escape — mismo
patrón ya usado en `CartDrawer.tsx`):
- Botón permanente "Ver guía de tallas" junto al selector de talla, para
  consulta libre (sin flujo de confirmación).
- Al tocar una talla, se abre el mismo sheet en modo confirmación: "Revisa
  las medidas antes de confirmar tu talla", "Talla seleccionada: X",
  botones "Confirmar talla X" / "Volver a elegir". Cerrar de cualquier otra
  forma (backdrop, Escape, X) nunca guarda la talla — solo "Confirmar" la
  guarda (`selectedSize` solo cambia desde `onConfirm`). Verificado
  end-to-end con clicks reales en la preview de desarrollo: seleccionar,
  confirmar, cambiar de versión y volver a confirmar, todo actualiza el
  estado correctamente.

### 3) Bug de matriz de tallas — Player mostraba 4XL

`product.sizes` es una sola lista por producto en la BD, sin distinguir
versión — la ficha mostraba esa lista completa sin filtrar sin importar si
la versión activa era Fan o Player, así que 4XL (que solo existe en Fan)
aparecía también con Player seleccionado. Nueva fuente de verdad única,
`lib/sizes.ts` (`availableSizesFor`, `isValidSizeForVersion`): Fan hasta
4XL, Player hasta 3XL, Mujer hasta XL (este último definido para cuando
exista esa categoría — hoy no hay ningún producto así etiquetado en la BD,
verificado con una consulta real). Aplicado en 2 lugares:
- `ProductDetail.tsx`: los botones de talla se filtran según la versión
  activa; un `useEffect` limpia `selectedSize` si deja de ser válida al
  cambiar de versión (verificado: Player+3XL → Fan conserva 3XL; Fan+4XL →
  Player limpia la selección).
- `app/api/pedidos/route.ts`: valida `size`/`version` de cada ítem antes de
  crear el pedido — rechaza con 422 una combinación inválida, por si algo
  llega a saltarse la UI (el carrito y el checkout son de solo lectura de
  talla/versión, no hay otro punto de entrada hoy, pero se protege igual).

### 5) Comprobante → chat directo de WhatsApp

Rediseñado el paso 5 del checkout: el botón principal ahora abre
directamente `wa.me/573008443885` (`whatsAppLink`) con el resumen completo
del pedido precargado — mismo builder único que el resto del sitio
(`buildOrderMessage`, extendido con `context: "receipt"` para el saludo
correcto y `policyAccepted` para la línea "Condiciones aceptadas: Sí/No").
El checkbox de políticas del paso 3 se movió de estado local a
`checkout-store.ts` (`policyAccepted`) para que el paso 5 también pueda
leerlo. Debajo del botón principal, instrucción honesta y visible: "Adjunta
el comprobante desde tu galería antes de enviar — WhatsApp se abre con tu
pedido ya escrito, pero no puede adjuntar la imagen automáticamente" — la
miniatura del archivo ya se mostraba arriba (vista previa + nombre + peso),
sirve como recordatorio. Compartir con archivo adjunto automático (Web
Share API) queda como botón secundario, mostrado solo cuando
`navigator.canShare({ files })` confirma soporte real (antes cualquier
navegador mostraba el mismo botón y recién en el click se descubría si
había soporte). Número de WhatsApp verificado en todo el proyecto — ya era
`3008443885` (`lib/whatsapp.ts`, fuente única) en los 5 lugares donde
aparece, sin ninguna aparición del número incorrecto que mencionó el dueño.
