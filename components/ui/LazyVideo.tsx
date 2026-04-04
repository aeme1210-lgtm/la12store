"use client";

import { useRef, useEffect, useState } from "react";

interface Props {
  src: string;
  className?: string;
}

export function LazyVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      autoPlay={isVisible}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    >
      {isVisible && <source src={src} type="video/mp4" />}
    </video>
  );
}
