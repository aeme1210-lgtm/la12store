import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROMO_END_MS = new Date("2026-04-20T04:59:59Z").getTime();

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/super-clasico") {
    if (Date.now() > PROMO_END_MS) {
      return NextResponse.redirect(new URL("/catalogo", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/super-clasico"],
};
