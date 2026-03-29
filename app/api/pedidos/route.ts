import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      city,
      department,
      notes,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
    } = body;

    if (!name || !phone || !items?.length) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        address,
        city,
        department,
        notes,
        paymentMethod,
        subtotal,
        shipping: shipping ?? 0,
        total,
        items: {
          create: items.map((item: {
            productId: string;
            quantity: number;
            size: string;
            version: string;
            dorsalName?: string;
            dorsalNumber?: string;
            price: number;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            version: item.version,
            dorsalName: item.dorsalName,
            dorsalNumber: item.dorsalNumber,
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
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
