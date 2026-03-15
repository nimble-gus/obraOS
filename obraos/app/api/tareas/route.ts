import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** POST: Crear tarea en una fase */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { faseId, nombre, orden, fechaInicio, fechaFin, cantidadM2, cantidadM3 } = body;

  if (!faseId || !nombre?.trim()) {
    return NextResponse.json(
      { error: "faseId y nombre son requeridos" },
      { status: 400 }
    );
  }

  const fase = await prisma.fase.findUnique({
    where: { id: faseId },
    select: { id: true },
  });
  if (!fase) {
    return NextResponse.json({ error: "Fase no encontrada" }, { status: 404 });
  }

  const maxOrden = await prisma.tarea.aggregate({
    where: { faseId },
    _max: { orden: true },
  });
  const nextOrden = orden != null ? Number(orden) : (maxOrden._max.orden ?? 0) + 1;

  const tarea = await prisma.tarea.create({
    data: {
      faseId,
      nombre: String(nombre).trim(),
      orden: nextOrden,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      cantidadM2: typeof cantidadM2 === "number" ? cantidadM2 : parseFloat(cantidadM2) || 0,
      cantidadM3: typeof cantidadM3 === "number" ? cantidadM3 : parseFloat(cantidadM3) || 0,
    },
  });

  return NextResponse.json(tarea);
}
