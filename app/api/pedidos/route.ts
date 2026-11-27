import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";
import { requireAdminAuth } from "@/lib/admin-auth";
import { OrderCreateSchema } from "@/lib/validation";
import { ORDER_STATUS } from "@/lib/order-status";
import { isValidSizeForVersion } from "@/lib/sizes";
import { getProductPrice } from "@/lib/pricing";
import { SHIPPING } from "@/lib/shipping";

async function generateUniqueOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateOrderCode();
    const existing = await prisma.order.findUnique({ where: { orderNumber: code } });
    if (!existing) return code;
  }
  // Extremadamente improbable (requeriría 10 colisiones de 4 dígitos el
  // mismo día), pero si pasa, se agrega un sufijo extra para garantizar unicidad.
  return `${generateOrderCode()}-${Date.now().toString().slice(-4)}`;
}

// POST — público: los clientes crean pedidos
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = OrderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const {
    name, phone, email, address, city, department, neighborhood,
    notes, paymentMethod, items, subtotal, shipping, total,
  } = parsed.data;

  const invalidItem = items.find((item) => !isValidSizeForVersion(item.size, item.version));
  if (invalidItem) {
    return NextResponse.json(
      { error: `La talla ${invalidItem.size} no existe para la versión ${invalidItem.version}` },
      { status: 422 }
    );
  }

  // El precio NUNCA se confía al navegador: se recalcula desde la BD con la
  // misma función que usa la ficha. Antes cualquiera podía crear un pedido
  // con `price: 1000` y el admin lo vería como total "real" al verificar.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (items.some((i) => !byId.has(i.productId))) {
    return NextResponse.json(
      { error: "Uno de los productos ya no está disponible. Actualiza tu carrito." },
      { status: 409 }
    );
  }
  const pricedItems = items.map((item) => ({
    ...item,
    price: getProductPrice(byId.get(item.productId)!, item.version),
  }));
  const serverSubtotal = pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serverShipping = SHIPPING.nacional.cost;
  const serverTotal = serverSubtotal + serverShipping;
  if (serverSubtotal !== subtotal || serverTotal !== total) {
    return NextResponse.json(
      {
        error:
          "Los precios de tu carrito cambiaron. Vuelve al carrito para ver el total actualizado.",
        subtotal: serverSubtotal,
        total: serverTotal,
      },
      { status: 409 }
    );
  }

  try {
    const orderNumber = await generateUniqueOrderCode();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: ORDER_STATUS.READY_FOR_PAYMENT,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        address: address || null,
        city: city || null,
        department: department || null,
        neighborhood: neighborhood || null,
        notes: notes || null,
        paymentMethod: paymentMethod || null,
        subtotal: serverSubtotal,
        shipping: serverShipping,
        total: serverTotal,
        items: {
          create: pricedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            version: item.version,
            dorsalName: item.dorsalName ?? null,
            dorsalNumber: item.dorsalNumber ?? null,
            price: item.price,
          })),
        },
      },
    });
    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// GET — solo admins: lista todos los pedidos con PII de clientes
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const rawPage = parseInt(searchParams.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 20;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page });
}
