import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const liga = searchParams.get("liga");
  const tipo = searchParams.get("tipo");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where: Record<string, unknown> = { isActive: true };
  if (q) where.OR = [{ name: { contains: q } }, { team: { contains: q } }];
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
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.name);

    const product = await prisma.product.create({
      data: { ...body, slug },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando producto" }, { status: 500 });
  }
}
