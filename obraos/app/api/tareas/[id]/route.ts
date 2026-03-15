import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** PATCH: Actualizar tarea (nombre, fechas, m2, m3) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
  if (body.fechaInicio !== undefined)
    data.fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : null;
  if (body.fechaFin !== undefined)
    data.fechaFin = body.fechaFin ? new Date(body.fechaFin) : null;
  if (body.cantidadM2 !== undefined)
    data.cantidadM2 = Math.max(0, parseFloat(body.cantidadM2) || 0);
  if (body.cantidadM3 !== undefined)
    data.cantidadM3 = Math.max(0, parseFloat(body.cantidadM3) || 0);
  if (body.orden !== undefined) data.orden = Number(body.orden);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Ningún campo para actualizar" }, { status: 400 });
  }

  const tarea = await prisma.tarea.update({
    where: { id },
    data: data as Parameters<typeof prisma.tarea.update>[0]["data"],
  });

  return NextResponse.json(tarea);
}
