import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS } from "@/lib/collections";
import { GUAYOS, isGuayosUnlocked } from "@/lib/launches";

const BASE_URL = "https://la12store.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/colecciones`, changeFrequency: "weekly", priority: 0.8 },
    ...COLLECTIONS.map((c) => ({
      url: `${BASE_URL}/coleccion/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contacto`, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Solo campos mínimos (slug/updatedAt) — no se trae el catálogo completo
  // al cliente, esto corre en el servidor durante la generación del sitemap.
  const products = await prisma.product.findMany({
    // Los guayos del aniversario no se anuncian a Google antes de la apertura.
    where: isGuayosUnlocked() ? { isActive: true } : { isActive: true, league: { not: GUAYOS.league } },
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/catalogo/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
