# La 12 Store — Tienda de Camisetas de Fútbol Premium

**Santa Marta, Colombia** | Instagram: @la12s_tore | WhatsApp: +57 300 844 3885

---

## Inicio rápido

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** — Paleta negro + dorado premium
- **SQLite + Prisma v7** (adapter better-sqlite3)
- **Zustand** — Carrito persistido en localStorage

---

## Panel Admin

| Campo | Valor |
|-------|-------|
| URL | `/admin` |
| Email | `admin@la12store.com` |
| Contraseña | `La12Store2026!` |

---

## Estructura

```
app/
  page.tsx              → Home (Hero, Tendencias, Categorías)
  catalogo/             → Catálogo + filtros
  catalogo/[slug]/      → Producto individual
  carrito/              → Carrito
  checkout/             → Pedido + métodos de pago
  nosotros/             → Historia
  contacto/             → Contacto + formulario
  faq/                  → Preguntas frecuentes
  admin/                → Dashboard (protegido)
  admin/productos/      → CRUD productos
  admin/pedidos/        → Gestión de pedidos
  api/                  → REST API endpoints
```

---

## Precios

| Versión | Precio |
|---------|--------|
| Fan | $150.000 COP |
| Player | $180.000 COP |
| Retro | $170.000 COP |
| Dorsal + Parches | **GRATIS** |
| Envío Santa Marta | **GRATIS** |
| Envío nacional | $25.000–$30.000 |
| Envío internacional | **GRATIS** |

---

## Métodos de Pago

- **Nequi:** 300 844 3885
- **Daviplata:** 300 844 3885
- **Nubank:** @AME429

---

## Imágenes

Las fotos van en `/public/images/`. Sube las fotos reales desde el panel admin (`/admin/productos`) actualizando el campo de imágenes con URLs.

---

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run seed         # Cargar productos de ejemplo
npx prisma studio    # UI visual de la DB
```

---

## Deploy (Vercel)

Configura las variables de entorno en el dashboard de Vercel. Para producción se recomienda migrar a **Turso** (SQLite distribuido) o **PostgreSQL** (Neon/Supabase).
