import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit";
import { AdminLoginSchema } from "@/lib/validation";

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // ── Rate limiting ──────────────────────────────────────────────────────
  const rl = isRateLimited(ip);
  if (rl.limited) {
    return NextResponse.json(
      { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil((rl.retryAfterSec ?? 3600) / 60)} minutos.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec ?? 3600) },
      }
    );
  }

  // ── Validación de input ────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = AdminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // ── Autenticación ──────────────────────────────────────────────────────
  const user = await prisma.adminUser.findUnique({ where: { email } });

  // bcrypt.compare siempre se llama para evitar timing attacks (no cortocircuitar)
  const dummyHash = "$2a$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const valid = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash).then(() => false);

  if (!user || !valid) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // ── Login exitoso ──────────────────────────────────────────────────────
  clearAttempts(ip);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", user.id, {
    httpOnly: true,
    secure: true,               // siempre HTTPS — Vercel siempre sirve HTTPS
    sameSite: "strict",         // CSRF protection
    maxAge: 60 * 60 * 24 * 7,  // 7 días
    path: "/",
  });

  return NextResponse.json({ ok: true, name: user.name });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ ok: true });
}
