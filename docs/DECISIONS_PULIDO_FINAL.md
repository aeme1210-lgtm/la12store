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
