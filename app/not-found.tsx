import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p
          className="text-[#A47C42] text-sm uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Error 404
        </p>
        <h1
          className="text-3xl md:text-4xl font-black text-white uppercase mb-4"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Esta página no existe
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-8">
          El enlace puede estar roto o la página se movió. Prueba buscando tu camiseta
          en el catálogo completo.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 bg-[#A47C42] hover:bg-[#C4A06A] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm transition-all"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
