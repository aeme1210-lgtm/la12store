import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { UrgencyBar } from "@/components/ui/UrgencyBar";
import { BRAND_URLS } from "@/lib/brand-urls";

// Sistema tipográfico v2 (REDESIGN_V2_BRIEF.md "ADN DE DISEÑO"): Archivo
// (display, titulares editoriales) + Inter (interfaz/cuerpo). Reemplaza
// Playfair Display de la v1. Archivo es fuente variable con eje de ancho
// (wdth 62-125) además de peso (wght 100-900) — permite un verdadero
// "Black Expanded" vía variación real, no solo letter-spacing (confirmado
// en font-data.json del paquete instalado, ver docs/DECISIONS_V2.md).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  // "variable" (no pesos fijos) carga el archivo variable completo, con
  // acceso real a los ejes wght (100-900) y wdth (62-125) vía CSS
  // font-variation-settings/font-stretch — necesario para el "Expanded".
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://la12store.vercel.app"),
  title: {
    default: "La 12 Store | Camisetas de Fútbol Premium en Colombia",
    template: "%s | La 12 Store",
  },
  description:
    "Tienda de camisetas de fútbol premium en Santa Marta, Colombia. Más de 2,500 camisetas disponibles. Dorsal y parches gratis. Envío a toda Colombia y el mundo.",
  keywords: [
    "camisetas de fútbol",
    "jerseys fútbol Colombia",
    "La 12 Store",
    "Santa Marta Colombia",
    "camisetas premium",
    "camisetas selección Colombia",
    "camisetas Real Madrid",
    "camisetas Barcelona",
    "dorsal gratis",
    "envío Colombia",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "La 12 Store",
    title: "La 12 Store | Camisetas de Fútbol Premium en Colombia",
    description: "Tienda de camisetas de fútbol premium en Santa Marta, Colombia. Más de 2,500 camisetas disponibles. Dorsal y parches gratis.",
    images: [{ url: BRAND_URLS.hero[0] }],
  },
  twitter: {
    card: "summary_large_image",
    title: "La 12 Store | Camisetas de Fútbol Premium en Colombia",
    description: "Tienda de camisetas de fútbol premium en Santa Marta, Colombia. Dorsal y parches gratis.",
    images: [BRAND_URLS.hero[0]],
  },
};

// Datos estructurados globales — cero JSON-LD existía en el proyecto antes
// del rediseño (docs/REDESIGN_AUDIT.md §8).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "La 12 Store",
  url: "https://la12store.vercel.app",
  logo: BRAND_URLS.logo,
  sameAs: ["https://instagram.com/la12s_tore", "https://tiktok.com/@la12s_tore"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "La 12 Store",
  url: "https://la12store.vercel.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://la12store.vercel.app/catalogo?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${archivo.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#FAFAFA]" style={{ fontFamily: "var(--font-inter)" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <UrgencyBar />
        <Navbar />
        <main className="flex-1" style={{ paddingTop: "calc(var(--urgency-h, 0px) + var(--nav-h, 64px))" }}>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
