-- RLS para la tabla "Promo"
--
-- Contexto (verificado en el código, 2026-07-06):
-- - La app NO usa @supabase/supabase-js ni PostgREST en ningún archivo.
--   Todo el acceso a "Promo" pasa por Prisma (lib/prisma.ts), conectado
--   directo a Postgres via DATABASE_URL (pool pgbouncer).
-- - Lectura pública real: GET /api/promo-barca-status (sin auth) -> lib/promo-barca.ts
--   -> getBarcaPromoStatus(). Es intencional, la web muestra el estado de la promo
--   a cualquier visitante.
-- - Escritura real: POST /api/admin/activar-promo-barca, protegida por
--   requireAdminAuth() (cookie admin_session). Solo el admin puede activar/reactivar.
--
-- Riesgo que esto cierra: si RLS está deshabilitada en "Promo", Supabase expone
-- la tabla completa (SELECT + INSERT + UPDATE + DELETE) sin filtro alguno via
-- REST a cualquiera que tenga la anon key, sin pasar por requireAdminAuth().
-- Estas políticas replican en la capa de base de datos lo que la app ya hace
-- a nivel de aplicación: lectura abierta, escritura bloqueada para anon/authenticated.
--
-- Nota: el rol "service_role" de Supabase tiene BYPASSRLS por defecto, así que
-- NO necesita una política explícita de escritura — RLS simplemente no le aplica.
-- Por eso no se define ninguna policy para service_role abajo.

ALTER TABLE "Promo" ENABLE ROW LEVEL SECURITY;

-- Lectura pública: igual a lo que ya expone /api/promo-barca-status sin auth.
CREATE POLICY "Promo: lectura pública"
  ON "Promo"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sin política de INSERT/UPDATE/DELETE para anon/authenticated:
-- con RLS activa y ninguna policy de escritura, esas operaciones quedan
-- bloqueadas por defecto para esos roles. Solo service_role (que bypassea
-- RLS) y las rutas admin del backend (via Prisma) pueden escribir.
