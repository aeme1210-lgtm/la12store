import { NextResponse } from "next/server";
import { getBarcaPromoStatus } from "@/lib/promo-barca";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getBarcaPromoStatus();
  return NextResponse.json({
    active: status.active,
    endAt: status.endAt ? status.endAt.toISOString() : null,
  });
}
