import { prisma } from "@/lib/prisma";
import { GUAYOS, isGuayosUnlocked } from "@/lib/launches";
import { GuayosTile } from "@/components/home/GuayosTile";

/**
 * Datos de la sección Guayos para la portada: la primera foto de cada guayo
 * (para la portada rotativa) y el total. Se consulta en cada visita, así que
 * los guayos nuevos aparecen solos.
 */
export async function GuayosLaunch() {
  const products = await prisma.product.findMany({
    where: { isActive: true, league: GUAYOS.league },
    select: { images: true },
    orderBy: { createdAt: "desc" },
  });
  const images = products
    .map((p) => (JSON.parse(p.images || "[]") as string[])[0])
    .filter((src): src is string => !!src)
    .slice(0, 40); // suficiente para la rotación sin cargar cientos de fotos

  return (
    <section className="py-12 md:py-16 px-3 md:px-6 max-w-7xl mx-auto">
      <GuayosTile
        images={images}
        total={products.length}
        unlockAt={GUAYOS.unlockAt.toISOString()}
        initiallyUnlocked={isGuayosUnlocked()}
      />
    </section>
  );
}
