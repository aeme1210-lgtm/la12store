"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";

export function RecentlyViewed({ excludeId }: { excludeId: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed(excludeId));
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2
        className="text-xl font-bold text-white uppercase mb-4"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Vistos recientemente
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/catalogo/${item.slug}`}
            className="flex-shrink-0 w-24 md:w-28 group"
          >
            <div className="relative aspect-[3/4] bg-[#141414] rounded-lg overflow-hidden mb-1.5">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="112px"
              />
            </div>
            <p className="text-[#9CA3AF] text-[11px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
