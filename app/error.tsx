"use client";

import { useEffect } from "react";
import Link from "next/link";
import { whatsAppLink } from "@/lib/whatsapp";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p
          className="text-[#C70101] text-sm uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Algo salió mal
        </p>
        <h1
          className="text-3xl md:text-4xl font-black text-white uppercase mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          No pudimos cargar esta página
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-8">
          Intenta de nuevo en unos segundos. Si el problema sigue, escríbenos por
          WhatsApp y te ayudamos directamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Reintentar
          </button>
          <a
            href={whatsAppLink("Hola La 12 Store, tuve un error en la web y necesito ayuda")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Escribir por WhatsApp
          </a>
        </div>
        <Link
          href="/"
          className="block mt-6 text-[#9CA3AF] hover:text-white text-sm transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
