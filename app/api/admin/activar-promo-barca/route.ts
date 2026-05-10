import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/activar-promo-barca
 *
 * Activa (o reactiva) la promo Barça campeón:
 *   startAt = ahora
 *   endAt   = ahora + 24 h
 *
 * Requiere sesión de admin (cookie admin_session).
 *
 * Uso manual desde curl / Postman / panel admin:
 *   curl -X POST https://la12store.vercel.app/api/admin/activar-promo-barca \
 *        -H "Cookie: admin_session=<tu-session-id>"
 */
export async function POST() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth.response;

  const now = new Date();
  const endAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 h

  const promo = await prisma.promo.upsert({
    where: { slug: "campeones-barca" },
    create: {
      slug: "campeones-barca",
      startAt: now,
      endAt,
      active: true,
    },
    update: {
      startAt: now,
      endAt,
      active: true,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "¡Promo activada! 🏆 24 horas corriendo desde ahora.",
    startAt: promo.startAt.toISOString(),
    endAt: promo.endAt.toISOString(),
  });
}
