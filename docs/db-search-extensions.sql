-- Ejecutado en producción el 2026-07-14 (ver docs/REDESIGN_PROGRESS.md).
-- Aditivo: extensiones + índices nuevos, no toca datos existentes.
-- Habilita búsqueda tolerante a errores de escritura (trigramas) y sin tildes.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE INDEX IF NOT EXISTS product_name_trgm_idx ON "Product" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS product_team_trgm_idx ON "Product" USING gin (team gin_trgm_ops);
