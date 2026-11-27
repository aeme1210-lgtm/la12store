import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import SLUG_REDIRECTS from "@/lib/slug-redirects.json";

/**
 * URLs de producto anteriores a la normalización de fase 2 (2026-11-27) →
 * 308 permanente a la URL nueva, ANTES de renderizar.
 *
 * La ficha (app/catalogo/[slug]/page.tsx) también redirige, pero como esa
 * ruta hace streaming (tiene loading.tsx) Next solo puede emitir un
 * <meta refresh> con estado 200. Google trata mejor un 308 real, así que se
 * resuelve aquí. Se conserva la query (?utm_source=…).
 */
const MAP = SLUG_REDIRECTS as Record<string, string>;

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice("/catalogo/".length);
  const target = MAP[decodeURIComponent(slug)];
  if (!target || target === slug) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/catalogo/${target}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/catalogo/:slug",
};
