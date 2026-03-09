import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tipos = await prisma.catalogoTipoServicio.findMany({
    orderBy: { orden: "asc" },
  });

  return NextResponse.json(tipos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nombre, orden } = body;

  if (!nombre?.trim()) {
    return NextResponse.json(
      { error: "nombre es requerido" },
      { status: 400 }
    );
  }

  const maxOrden = await prisma.catalogoTipoServicio.aggregate({
    _max: { orden: true },
  });
  const nextOrden = orden != null ? Number(orden) : (maxOrden._max.orden ?? 0) + 1;

  const tipo = await prisma.catalogoTipoServicio.create({
    data: {
      nombre: nombre.trim(),
      orden: nextOrden,
    },
  });

  return NextResponse.json(tipo);
}
