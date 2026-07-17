import type { NextConfig } from "next";

// Supabase project hostname (images y media)
const SUPABASE_HOST = "https://chljxifjjzaffvwixtfm.supabase.co";
// REDESIGN_V2 Fase 4: productos 26/27 con foto enlazada directo al CDN del
// proveedor (Yupoo) — ver docs/DECISIONS_V2.md (sin SUPABASE_SERVICE_ROLE_KEY
// en este entorno no se pudieron subir al bucket propio).
const YUPOO_HOST = "https://photo.yupoo.com";

// Content-Security-Policy: evita XSS, clickjacking e inyección de recursos.
// - script-src 'unsafe-inline' necesario porque Next.js inyecta scripts inline.
// - style-src 'unsafe-inline' necesario por inline styles (fontFamily, etc.).
// - connect-src incluye wss: para hot-reload en desarrollo.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${SUPABASE_HOST} ${YUPOO_HOST}`,
  `media-src 'self' ${SUPABASE_HOST}`,
  `connect-src 'self' ${SUPABASE_HOST} wss:`,
  "font-src 'self' data:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Evita que la página se cargue en un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Impide que el browser "adivine" el Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Fuerza HTTPS por 1 año (incluye subdominios)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Referrer: envía solo el origen cuando se va a otro dominio
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restringe acceso a funciones del browser
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Content-Security-Policy
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./supabase-image-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chljxifjjzaffvwixtfm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "photo.yupoo.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["@prisma/adapter-pg"],
  async headers() {
    return [
      {
        // Aplica headers de seguridad a todas las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
// redeploy Sun Mar 29 00:37:49 HPS 2026
