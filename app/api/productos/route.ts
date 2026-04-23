import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdminAuth } from "@/lib/admin-auth";
import { ProductCreateSchema, ProductQuerySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  // Solo accesible por admins (retorna todos los productos, incluyendo inactivos)
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const query = ProductQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    liga: searchParams.get("liga") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
    page: searchParams.get("page") ?? "1",
  });

  if (!query.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { q, liga, tipo, page } = query.data;
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { team: { contains: q, mode: "insensitive" } },
    ];
  }
  if (liga) where.league = liga;
  if (tipo) where.type = tipo;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isTrending: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = ProductCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  try {
    const product = await prisma.product.create({
      data: { ...data, slug },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando producto" }, { status: 500 });
  }
}
