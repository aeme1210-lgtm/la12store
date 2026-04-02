const B = "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/";
const u = (f: string) => B + encodeURIComponent(f);

export const BRAND_URLS = {
  logo:     u("WhatsApp Image 2026-04-01 at 14.39.59 (3).jpeg"),
  nosotros: u("WhatsApp Image 2026-04-01 at 14.39.58 (3).jpeg"),
  hero: [
    u("WhatsApp Image 2026-04-01 at 14.39.56.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.56 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57.jpeg"),
  ],
  gallery: [
    u("WhatsApp Image 2026-04-01 at 14.39.57 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57 (2).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58 (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.58 (2).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.57 (1) (1).jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.59.jpeg"),
    u("WhatsApp Image 2026-04-01 at 14.39.59 (1).jpeg"),
  ],
};
