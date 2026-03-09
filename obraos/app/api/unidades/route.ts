import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const proyectoId = searchParams.get("proyectoId");
  if (!proyectoId) {
    return NextResponse.json({ error: "proyectoId requerido" }, { status: 400 });
  }

  const unidades = await prisma.unidad.findMany({
    where: { proyectoId, activa: true },
    orderBy: { numero: "asc" },
    include: { modeloCasa: true, faseActual: true },
  });

  return NextResponse.json(unidades);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { proyectoId, etiqueta } = body;

  if (!proyectoId) {
    return NextResponse.json({ error: "proyectoId requerido" }, { status: 400 });
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    include: { _count: { select: { unidades: true } } },
  });

  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  if (proyecto._count.unidades >= proyecto.numUnidades) {
    return NextResponse.json(
      { error: `Límite alcanzado: máximo ${proyecto.numUnidades} unidades` },
      { status: 400 }
    );
  }

  const maxNumero = await prisma.unidad.aggregate({
    where: { proyectoId },
    _max: { numero: true },
  });
  const numero = (maxNumero._max.numero ?? 0) + 1;
  const etq = etiqueta || `Unidad ${numero}`;

  // Crear unidad limpia: sin fase actual, sin avances ni tareas heredados
  const unidad = await prisma.unidad.create({
    data: {
      proyectoId,
      numero,
      etiqueta: String(etq),
      faseActualId: null,
      pctAvanceGlobal: 0,
    },
    include: { modeloCasa: true, faseActual: true },
  });

  return NextResponse.json(unidad);
}
