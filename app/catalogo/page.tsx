export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { CatalogoFilters } from "@/components/product/CatalogoFilters";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Camisetas",
  description:
    "Explora nuestro catálogo completo de camisetas de fútbol premium. Selecciones, ligas europeas, sudamericanas y retros.",
};

const PAGE_SIZE = 48;

const slugToLeague: Record<string, string> = {
  "new-season": "New Season",
  "la-liga": "La Liga",
  retro: "Retro",
  "premier-league": "Premier League",
  "serie-a": "Serie A",
  bundesliga: "Bundesliga",
  "selecciones-nacionales": "Selecciones Nacionales",
  brasileirao: "Brasileirao",
  "other-clubs": "Other Clubs",
  "ligue-1": "Ligue 1",
  "mundial-fifa-2026": "Mundial FIFA 2026",
  "liga-argentina": "Liga Argentina",
  // aliases legacy
  "liga-espanola": "La Liga",
  "ligas-sudamericanas": "Retro",
  "retros-clasicas": "Retro",
};

interface SearchParams {
  liga?: string;
  tipo?: string;
  q?: string;
  page?: string;
}

function buildWhere(params: SearchParams): Record<string, unknown> {
  const where: Record<string, unknown> = { isActive: true };
  if (params.liga) {
    const leagueName = slugToLeague[params.liga];
    if (leagueName) where.league = leagueName;
  }
  if (params.tipo) where.type = params.tipo;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { team: { contains: params.q } },
      { league: { contains: params.q } },
    ];
  }
  return where;
}

function buildPageUrl(params: SearchParams, page: number): string {
  const p = new URLSearchParams();
  if (params.liga) p.set("liga", params.liga);
  if (params.tipo) p.set("tipo", params.tipo);
  if (params.q) p.set("q", params.q);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return `/catalogo${qs ? `?${qs}` : ""}`;
}

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where = buildWhere(params);
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [products, total, leagues, types] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({ by: ["league"], where: { isActive: true } }),
    prisma.product.groupBy({ by: ["type"], where: { isActive: true } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const leagueTitle = params.liga
    ? (slugToLeague[params.liga] ?? "Catálogo")
    : "Catálogo";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-[#D4A017] text-xs tracking-widest uppercase mb-1"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {total} productos
            {totalPages > 1 ? ` · Página ${page} de ${totalPages}` : ""}
          </p>
          <h1
            className="text-3xl md:text-4xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {leagueTitle}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <CatalogoFilters
            leagues={leagues.map((l) => l.league)}
            types={types.map((t) => t.type)}
            currentParams={params}
          />

          {/* Grid + Pagination */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-[#666666] text-lg">
                  No se encontraron productos con estos filtros.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    {page > 1 && (
                      <Link
                        href={buildPageUrl(params, page - 1)}
                        className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#B8860B]/20 text-[#A0A0A0] hover:text-white hover:border-[#D4A017]/40 transition-all text-sm font-semibold"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        ← Anterior
                      </Link>
                    )}
                    {getPaginationPages(page, totalPages).map((pg, idx) =>
                      pg === "..." ? (
                        <span key={`e${idx}`} className="px-2 text-[#666666] select-none">
                          …
                        </span>
                      ) : (
                        <Link
                          key={pg}
                          href={buildPageUrl(params, pg as number)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            pg === page
                              ? "bg-[#D4A017] text-black"
                              : "bg-[#1A1A1A] border border-[#B8860B]/20 text-[#A0A0A0] hover:text-white hover:border-[#D4A017]/40"
                          }`}
                          style={{ fontFamily: "var(--font-oswald)" }}
                        >
                          {pg}
                        </Link>
                      )
                    )}
                    {page < totalPages && (
                      <Link
                        href={buildPageUrl(params, page + 1)}
                        className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#B8860B]/20 text-[#A0A0A0] hover:text-white hover:border-[#D4A017]/40 transition-all text-sm font-semibold"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
