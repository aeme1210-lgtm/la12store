import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderClientStatusUpdateSchema } from "@/lib/validation";
import { ORDER_STATUS, CLIENT_UPDATABLE_STATUSES } from "@/lib/order-status";

/**
 * PATCH público (sin auth) — el propio checkout reporta su progreso a través
 * de los estados honestos (ver lib/order-status.ts). Restringido a un
 * subconjunto de estados "hacia adelante": nunca permite volver a DRAFT ni
 * auto-confirmarse (CONFIRMED_MANUALLY es exclusivo del admin, que solo lo
 * pone tras verificar el pago real — ver ADMIN_GUIDE.md).
 *
 * El `id` es un cuid largo no adivinable — actúa como token de acceso de
 * bajo riesgo para esta operación de solo-avance sobre un pedido propio.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = OrderClientStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 422 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  // Nunca permitir que el cliente sobrescriba una confirmación manual ya hecha.
  if (existing.status === ORDER_STATUS.CONFIRMED_MANUALLY) {
    return NextResponse.json({ error: "Pedido ya confirmado" }, { status: 409 });
  }

  if (!CLIENT_UPDATABLE_STATUSES.includes(parsed.data.status)) {
    return NextResponse.json({ error: "Estado no permitido" }, { status: 422 });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.receiptFileName ? { receiptFileName: parsed.data.receiptFileName } : {}),
        ...(parsed.data.receiptShareMethod ? { receiptShareMethod: parsed.data.receiptShareMethod } : {}),
      },
    });
    return NextResponse.json({ status: order.status });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
