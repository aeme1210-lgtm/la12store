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

- **Next.js 16.2.4** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** — Paleta negro + dorado premium
- **PostgreSQL (Supabase) + Prisma v7** (adapter `@prisma/adapter-pg`)
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
  api/cron/backup/      → Cron job semanal de backup
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

# Backup manual (requiere pg_dump instalado y DIRECT_URL en .env)
node scripts/backup-db.js               # Backup completo → Google Drive
node scripts/backup-db.js --dry-run    # Ver qué haría sin ejecutar
node scripts/backup-db.js --local      # Guardar .sql.gz local, sin subir a Drive
```

---

## Deploy (Vercel)

Variables de entorno requeridas en el dashboard de Vercel:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL pooler (puerto 6543, pgbouncer) |
| `DIRECT_URL` | PostgreSQL directo (puerto 5432, para migraciones y pg_dump) |
| `CRON_SECRET` | Secret para autenticar el cron job de backup |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo de la Service Account de Google |
| `GOOGLE_DRIVE_FOLDER_ID` | ID de la carpeta en Google Drive para los backups |

---

## Backup de Base de Datos

El sistema de backup tiene **dos mecanismos** complementarios:

### 1. Vercel Cron (automático, sin pg_dump)

- **Cuándo:** Cada domingo a las 4:00 AM UTC (configurado en `vercel.json`)
- **Cómo:** El endpoint `/api/cron/backup` exporta los datos vía Prisma y genera SQL válido
- **Archivo:** `backup-la12store-vercel-YYYY-MM-DD.sql.gz`
- **Retención:** Últimos 10 backups automáticos

Vercel inyecta el header `Authorization: Bearer {CRON_SECRET}` automáticamente.
Para disparar manualmente:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://tu-dominio.vercel.app/api/cron/backup
```

### 2. GitHub Actions (alternativo, usa pg_dump completo)

- **Cuándo:** Cada domingo a las 4:00 AM UTC (`.github/workflows/backup.yml`)
- **Cómo:** `pg_dump` completo (schema + datos) → gzip → Google Drive
- **Archivo:** `backup-la12store-YYYY-MM-DD.sql.gz`
- **Retención:** Últimos 20 backups

Requiere configurar estos secrets en GitHub → Settings → Secrets and variables → Actions:
- `DIRECT_URL`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_DRIVE_FOLDER_ID`

### 3. Backup manual desde terminal

```bash
# Asegúrate de tener pg_dump instalado y DIRECT_URL en .env
node scripts/backup-db.js
```

---

## Configuración de Google Drive

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto (o usa uno existente)
3. Habilita la **Google Drive API**
4. Crea una **Service Account**:
   - IAM & Admin → Service Accounts → Create
   - Descarga el JSON de credenciales
5. Crea una carpeta en Google Drive para los backups
6. Comparte la carpeta con el **email de la Service Account** (como Editor)
7. Copia el **ID de la carpeta** (última parte de la URL: `drive.google.com/drive/folders/{ID}`)
8. Configura en `.env` (o en Vercel/GitHub Secrets):

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
GOOGLE_DRIVE_FOLDER_ID=1ABC123xyz...
```

---

## Restaurar desde Backup

### Desde backup de Vercel Cron (SQL INSERT statements)

El archivo contiene `INSERT ... ON CONFLICT DO NOTHING` para todas las tablas.
Requiere que el schema ya exista (corre migraciones primero).

```bash
# 1. Descomprimir
gunzip backup-la12store-vercel-2026-04-20.sql.gz

# 2. Aplicar el schema (si la DB está vacía)
npx prisma migrate deploy

# 3. Restaurar los datos
psql "$DIRECT_URL" < backup-la12store-vercel-2026-04-20.sql
```

### Desde backup completo de pg_dump / GitHub Actions

El archivo contiene schema + datos completos.

```bash
# 1. Descomprimir
gunzip backup-la12store-2026-04-20.sql.gz

# 2. Restaurar (reemplaza todo el contenido de la DB)
psql "$DIRECT_URL" < backup-la12store-2026-04-20.sql
```

> **Nota:** Para restaurar en Supabase, usa la URL de conexión directa (puerto 5432), no la del pooler.

---

## Seguridad

- Todos los endpoints de admin requieren cookie de sesión válida (`/api/admin/*`, `/api/productos/*`, `/api/pedidos/*` GET)
- Rate limiting en login: 5 intentos fallidos en 15 min → bloqueo de 1 hora
- Headers de seguridad: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- Cookie de sesión: `httpOnly`, `secure`, `sameSite: strict`
- Passwords de admin hasheados con bcrypt (rounds=12)
- Validación Zod en todos los inputs de API
