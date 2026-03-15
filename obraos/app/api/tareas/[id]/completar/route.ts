import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * POST: Marcar/desmarcar tarea como completada para una unidad.
 * Body: { unidadId }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: tareaId } = await params;
  const body = await req.json();
  const { unidadId } = body;

  if (!unidadId) {
    return NextResponse.json({ error: "unidadId requerido" }, { status: 400 });
  }

  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    select: { faseId: true },
  });
  if (!tarea) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const existing = await prisma.tareaCompletadaUnidad.findUnique({
    where: { tareaId_unidadId: { tareaId, unidadId } },
  });

  if (existing) {
    await prisma.tareaCompletadaUnidad.delete({
      where: { tareaId_unidadId: { tareaId, unidadId } },
    });
  } else {
    await prisma.tareaCompletadaUnidad.create({
      data: { tareaId, unidadId },
    });
  }

  const faseId = tarea.faseId;
  const fase = await prisma.fase.findUnique({
    where: { id: faseId },
    include: { tareas: { include: { completadas: { where: { unidadId } } } } },
  });
  if (fase) {
    const total = fase.tareas.length;
    const completadas = fase.tareas.filter((t) => t.completadas.some((c) => c.unidadId === unidadId)).length;
    const pctAvance = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const status = pctAvance === 100 ? "DONE" : "ACTIVE";
    await prisma.avanceUnidadFase.upsert({
      where: { unidadId_faseId: { unidadId, faseId } },
      create: { unidadId, faseId, pctAvance, status },
      update: { pctAvance, status },
    });
  }

  // Actualizar pctAvanceGlobal de la unidad: promedio de avance por fase
  const proyecto = await prisma.unidad.findUnique({
    where: { id: unidadId },
    select: { proyectoId: true },
  });
  if (proyecto) {
    const fases = await prisma.fase.findMany({
      where: { proyectoId: proyecto.proyectoId },
      orderBy: { orden: "asc" },
      include: { tareas: { include: { completadas: { where: { unidadId } } } } },
    });
    if (fases.length > 0) {
      let sumaPct = 0;
      for (const f of fases) {
        const total = f.tareas.length;
        const completadas = total > 0
          ? f.tareas.filter((t) => t.completadas.some((c) => c.unidadId === unidadId)).length
          : 0;
        sumaPct += total > 0 ? (completadas / total) * 100 : 0;
      }
      const pctGlobal = Math.round(sumaPct / fases.length);
      await prisma.unidad.update({
        where: { id: unidadId },
        data: { pctAvanceGlobal: pctGlobal },
      });
    }
  }

  return NextResponse.json({ completada: !existing });
}
