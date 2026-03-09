import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: faseId } = await params;

  const tareas = await prisma.tarea.findMany({
    where: { faseId },
    orderBy: { orden: "asc" },
    include: { completadas: true },
  });

  return NextResponse.json(tareas);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: faseId } = await params;
  const body = await req.json();
  const { nombre } = body;

  if (!nombre || typeof nombre !== "string") {
    return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
  }

  const maxOrden = await prisma.tarea.aggregate({
    where: { faseId },
    _max: { orden: true },
  });
  const orden = (maxOrden._max.orden ?? -1) + 1;

  const tarea = await prisma.tarea.create({
    data: { faseId, nombre, orden },
  });

  return NextResponse.json(tarea);
}
