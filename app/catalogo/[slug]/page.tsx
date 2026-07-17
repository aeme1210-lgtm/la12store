export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { FadeInUp } from "@/components/ui/ScrollAnimations";
import type { Metadata } from "next";
import { formatCOP } from "@/lib/utils";
import { getStartingPrice } from "@/lib/pricing";
import supabaseImageUrl from "@/supabase-image-loader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };

  const price = getStartingPrice(product);
  const description = `${product.name} - ${product.type} ${product.season ?? ""}. ${formatCOP(price)} COP. Calidad premium con acabados profesionales.`;
  const rawImage = (JSON.parse(product.images || "[]") as string[])[0];
  // Misma transformación que supabase-image-loader.js (sin /render/image/,
  // solo objeto público directo) — necesaria porque og:image debe ser una URL
  // absoluta, los crawlers de WhatsApp/Instagram no ejecutan next/image.
  const mainImage = rawImage ? supabaseImageUrl({ src: rawImage }) : undefined;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: mainImage ? [{ url: mainImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

const BASE_URL = "https://la12store.vercel.app";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      league: product.league,
      isActive: true,
      NOT: { id: product.id },
    },
    take: 4,
  });

  const price = getStartingPrice(product);
  const rawImage = (JSON.parse(product.images || "[]") as string[])[0];
  const productImage = rawImage ? supabaseImageUrl({ src: rawImage }) : undefined;
  const productUrl = `${BASE_URL}/catalogo/${product.slug}`;

  // Datos estructurados — cero JSON-LD existía en el proyecto antes (auditoría §8).
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productImage ? [productImage] : undefined,
    description: product.description || `${product.name} - ${product.type}`,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "COP",
      price,
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Catálogo", item: `${BASE_URL}/catalogo` },
      { "@type": "ListItem", position: 2, name: product.league, item: `${BASE_URL}/catalogo?liga=${encodeURIComponent(product.league)}` },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mt-16">
            <FadeInUp>
              <h2
                className="text-2xl font-black text-white uppercase mb-6"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                También te puede gustar
              </h2>
            </FadeInUp>
            {/* Sin animación por tarjeta (REDESIGN_V2 Fase 1) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((p: (typeof related)[number]) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}
