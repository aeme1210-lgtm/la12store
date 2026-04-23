/**
 * admin-auth.ts
 * Verifica que la request tenga una sesión de admin válida.
 * Usar en todos los Route Handlers que modifican datos.
 */
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

type AuthOk = { ok: true; userId: string };
type AuthFail = { ok: false; response: Response };

export async function requireAdminAuth(): Promise<AuthOk | AuthFail> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  // Verifica que el ID de sesión corresponde a un admin real en la BD.
  // Esto impide que una cookie con un valor arbitrario sea válida.
  const user = await prisma.adminUser.findUnique({
    where: { id: session.value },
    select: { id: true },
  });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { ok: true, userId: user.id };
}
