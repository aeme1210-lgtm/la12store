import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { UrgencyBar } from "@/components/ui/UrgencyBar";
import { LogoIntro } from "@/components/ui/LogoIntro";

// Sistema tipográfico consolidado a 2 familias (REDESIGN_SYSTEM.md §3):
// Playfair Display para titulares editoriales, Inter para todo lo demás
// (interfaz, precios con tabular-nums, cuerpo). Se eliminaron Oswald y
// JetBrains Mono — el brief pide máximo 2 familias.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "La 12 Store | Camisetas de Fútbol Premium en Colombia",
    template: "%s | La 12 Store",
  },
  description:
    "Tienda de camisetas de fútbol premium en Santa Marta, Colombia. Más de 2800 camisetas disponibles. Dorsal y parches gratis. Envío a toda Colombia y el mundo.",
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
    description: "Tienda de camisetas de fútbol premium en Santa Marta, Colombia. Más de 2800 camisetas disponibles. Dorsal y parches gratis.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#FAFAFA]" style={{ fontFamily: "var(--font-inter)" }}>
        <LogoIntro />
        <UrgencyBar />
        <Navbar />
        <main className="flex-1" style={{ paddingTop: "calc(var(--urgency-h, 0px) + var(--nav-h, 64px))" }}>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
