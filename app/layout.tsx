import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "La 12 Store | Camisetas de Fútbol Premium en Colombia",
    template: "%s | La 12 Store",
  },
  description:
    "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío a todo el país. Selecciones, ligas europeas y sudamericanas. Santa Marta, Colombia.",
  keywords: [
    "camisetas fútbol Colombia",
    "camisetas premium",
    "camisetas selección Colombia",
    "camisetas Real Madrid",
    "camisetas Barcelona",
    "Santa Marta",
    "La 12 Store",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "La 12 Store",
    title: "La 12 Store | Camisetas de Fútbol Premium",
    description: "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío a todo el país.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#FAFAFA]" style={{ fontFamily: "var(--font-inter)" }}>
        <Navbar />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
