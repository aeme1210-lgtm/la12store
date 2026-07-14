"use client";

interface Props {
  src: string;
  title: string;
  subtitle: string;
}

export function LigaVideoBanner({ src, title, subtitle }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl mb-6 md:mb-8" style={{ height: "clamp(160px, 35vw, 240px)" }}>
      {/* key=src forces full DOM remount when liga changes — browser reloads video */}
      <video
        key={src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 md:p-8">
        <p
          className="text-[#D4AF37] text-[10px] tracking-widest uppercase mb-1"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {subtitle}
        </p>
        <h1
          className="text-3xl md:text-5xl font-bold text-white break-words leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
