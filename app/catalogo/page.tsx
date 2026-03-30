export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { CatalogoFilters } from "@/components/product/CatalogoFilters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Camisetas",
  description:
    "Explora nuestro catálogo completo de camisetas de fútbol premium. Selecciones, ligas europeas, sudamericanas y retros.",
};

interface SearchParams {
  liga?: string;
  tipo?: string;
  q?: string;
  precioMin?: string;
  precioMax?: string;
}

async function getProducts(params: SearchParams) {
  const where: Record<string, unknown> = { isActive: true };

  if (params.liga) {
    const slugToLeague: Record<string, string> = {
      "new-season": "New Season",
      "la-liga": "La Liga",
      retro: "Retro",
      "premier-league": "Premier League",
      "serie-a": "Serie A",
      bundesliga: "Bundesliga",
      selecciones: "Selecciones",
      brasileirao: "Brasileirao",
      "liga-espanola": "La Liga",
      "ligue-1": "Retro",
      "ligas-sudamericanas": "Retro",
      "retros-clasicas": "Retro",
    };
    const leagueName = slugToLeague[params.liga];
    if (leagueName) where.league = leagueName;
  }

  if (params.tipo) {
    where.type = params.tipo;
  }

  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { team: { contains: params.q } },
      { league: { contains: params.q } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: [{ isTrending: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  const leagues = await prisma.product.groupBy({
    by: ["league"],
    where: { isActive: true },
  });
  const types = await prisma.product.groupBy({
    by: ["type"],
    where: { isActive: true },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-[#D4A017] text-xs tracking-widest uppercase mb-1"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {products.length} productos
          </p>
          <h1
            className="text-3xl md:text-4xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {params.liga
              ? leagues.find((l) =>
                  l.league
                    .toLowerCase()
                    .includes(params.liga?.replace(/-/g, " ") ?? "")
                )?.league ?? "Catálogo"
              : "Catálogo"}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <CatalogoFilters
            leagues={leagues.map((l) => l.league)}
            types={types.map((t) => t.type)}
            currentParams={params}
          />

          {/* Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-[#666666] text-lg">
                  No se encontraron productos con estos filtros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
