export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { CatalogoFilters } from "@/components/product/CatalogoFilters";
import { LigaVideoBanner } from "@/components/product/LigaVideoBanner";
import { FadeInUp, ScaleIn } from "@/components/ui/ScrollAnimations";
import Link from "next/link";
import type { Metadata } from "next";
import { resolveSearchTerms } from "@/lib/search";

export const metadata: Metadata = {
  title: "Catálogo de Camisetas",
  description:
    "Explora nuestro catálogo completo de camisetas de fútbol premium. Selecciones, ligas europeas, sudamericanas y retros.",
};

const PAGE_SIZE = 24;

const VIDEO_BASE = "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/";

const ligaVideoMap: Record<string, string> = {
  "la-liga":                `${VIDEO_BASE}LigaE.mp4`,
  "liga-espanola":          `${VIDEO_BASE}LigaE.mp4`,
  "premier-league":         `${VIDEO_BASE}premier%20league%20(1).mp4`,
  "ligue-1":                `${VIDEO_BASE}premier%20league%20(1).mp4`,
  "serie-a":                `${VIDEO_BASE}Serie%20A.mp4`,
  "bundesliga":             `${VIDEO_BASE}Bundesliga.mp4`,
  "selecciones-nacionales": `${VIDEO_BASE}Selecciones.mp4`,
  "selecciones":            `${VIDEO_BASE}Selecciones.mp4`,
  "liga-argentina":         `${VIDEO_BASE}WhatsApp%20Video%202026-04-01%20at%2019.43.52.mp4`,
  "retro":                  `${VIDEO_BASE}Retro.mp4`,
  "retros-clasicas":        `${VIDEO_BASE}Retro.mp4`,
  "brasileirao":            `${VIDEO_BASE}Brasileirao.mp4`,
  "ligas-sudamericanas":    `${VIDEO_BASE}Brasileirao.mp4`,
  "other-clubs":            `${VIDEO_BASE}Brasileirao.mp4`,
  "mundial-fifa-2026":      `${VIDEO_BASE}Mundial%202026.mp4`,
  "new-season":             `${VIDEO_BASE}Mundial%202026.mp4`,
};

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
    const terms = resolveSearchTerms(params.q);
    where.OR = terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" } },
      { team: { contains: term, mode: "insensitive" } },
      { league: { contains: term, mode: "insensitive" } },
    ]);
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

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let total = 0;
  let leagues: { league: string }[] = [];
  let types: { type: string }[] = [];

  try {
    [products, total, leagues, types] = await Promise.all([
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
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
            Error temporal
          </p>
          <p className="text-[#9CA3AF] text-sm">
            No pudimos cargar el catálogo. Intenta nuevamente en unos segundos.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const leagueTitle = params.liga
    ? (slugToLeague[params.liga] ?? "Catálogo")
    : "Catálogo";

  const ligaVideo = params.liga ? ligaVideoMap[params.liga] : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Video banner — shown when a liga with video is selected */}
        {ligaVideo ? (
          <FadeInUp>
            <LigaVideoBanner
              src={ligaVideo}
              title={leagueTitle}
              subtitle={`${total} productos${totalPages > 1 ? ` · Página ${page} de ${totalPages}` : ""}`}
            />
          </FadeInUp>
        ) : (
          /* Header — no video (all catalog or unsupported liga) */
          <div className="mb-8">
            <p
              className="text-[#D4AF37] text-[10px] tracking-widest uppercase mb-1"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {total} productos
              {totalPages > 1 ? ` · Página ${page} de ${totalPages}` : ""}
            </p>
            <h1
              className="text-2xl md:text-4xl font-bold text-white break-words leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {leagueTitle}
            </h1>
          </div>
        )}

        {/* Search bar — always visible above grid */}
        <div className="px-0 mb-4">
          <form action="/catalogo" method="GET" className="relative max-w-xl">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Buscar camiseta... (ej: Barcelona, Colombia, Retro)"
              className="w-full py-3 px-4 pr-12 bg-[#111111] border-2 border-[#D4AF37] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm md:text-base"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            {params.liga && <input type="hidden" name="liga" value={params.liga} />}
          </form>
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                  {products.map((p, index) => (
                    <ScaleIn key={p.id} delay={Math.min(index * 0.05, 0.5)}>
                      <ProductCard product={p} />
                    </ScaleIn>
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
