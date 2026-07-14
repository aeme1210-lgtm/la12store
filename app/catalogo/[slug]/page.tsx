export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/ScrollAnimations";
import type { Metadata } from "next";
import { formatCOP } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };

  const price = product.isRetro
    ? product.priceRetro ?? 170000
    : product.priceFan ?? 150000;

  return {
    title: product.name,
    description: `${product.name} - ${product.type} ${product.season ?? ""}. ${formatCOP(price)} COP. Calidad premium con acabados profesionales.`,
  };
}

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

  return (
    <div className="min-h-screen">
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
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5" staggerDelay={0.1}>
              {related.map((p: (typeof related)[number]) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}
      </div>
    </div>
  );
}
