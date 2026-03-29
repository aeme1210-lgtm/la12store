import type { Metadata } from "next";
import { Oswald, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    description:
      "Lo mejor en camisetas de fútbol en Colombia. Calidad premium, envío a todo el país.",
  },
  twitter: {
    card: "summary_large_image",
    title: "La 12 Store | Camisetas de Fútbol Premium",
    description:
      "Lo mejor en camisetas de fútbol en Colombia. Calidad premium.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
