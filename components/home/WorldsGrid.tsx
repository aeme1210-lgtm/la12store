import Link from "next/link";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { GroupReveal } from "@/components/ui/ScrollAnimations";

export interface World {
  name: string;
  subtitle: string;
  slug: string;
  video: string;
}

/**
 * "Mundos" — navegación por colección con imagen, composición asimétrica
 * (REDESIGN_V2_BRIEF.md Fase 2 bloque 5): un mundo dominante + secundarios,
 * no la misma grilla uniforme de la v1. Reveal de grupo, no por tile.
 */
export function WorldsGrid({ worlds }: { worlds: World[] }) {
  const [dominant, ...rest] = worlds;

  return (
    <GroupReveal className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[140px] md:auto-rows-[160px]">
      {dominant && (
        <WorldTile world={dominant} className="col-span-2 row-span-2" titleClassName="text-3xl md:text-5xl" />
      )}
      {rest.map((w) => (
        <WorldTile key={w.slug} world={w} />
      ))}
    </GroupReveal>
  );
}

function WorldTile({
  world,
  className = "",
  titleClassName = "text-xl md:text-2xl",
}: {
  world: World;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <Link
      href={`/catalogo?liga=${world.slug}`}
      className={`group relative overflow-hidden rounded-xl block ${className}`}
    >
      <LazyVideo
        src={world.video}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-all duration-300 group-hover:from-black/70" />
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-10">
        <h3
          className={`font-display text-white group-hover:text-[#C4A06A] transition-colors duration-200 ${titleClassName}`}
        >
          {world.name}
        </h3>
        <p className="text-xs md:text-sm text-[#C4A06A]">{world.subtitle}</p>
      </div>
    </Link>
  );
}
