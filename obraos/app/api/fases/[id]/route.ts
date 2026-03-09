import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parsePartes3D } from "@/app/platform/visor/lib/partes3d";

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
  if (body.nombre != null) data.nombre = String(body.nombre);
  if (body.status != null) data.status = body.status;
  if (body.pctAvance != null) data.pctAvance = Math.max(0, Math.min(100, Number(body.pctAvance)));
  if (body.orden != null) data.orden = Number(body.orden);
  if (body.fechaInicio != null) data.fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : null;
  if (body.fechaFin != null) data.fechaFin = body.fechaFin ? new Date(body.fechaFin) : null;
  if (body.partes3D != null) data.partes3D = Array.isArray(body.partes3D) ? body.partes3D : parsePartes3D(body.partes3D);

  if (body.status === "DONE" && data.pctAvance !== 100) {
    data.pctAvance = 100;
  }

  const fase = await prisma.fase.update({
    where: { id },
    data: data as Parameters<typeof prisma.fase.update>[0]["data"],
    include: { materiales: { include: { material: true } } },
  });

  return NextResponse.json(fase);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";

  const fase = await prisma.fase.findUnique({
    where: { id },
    include: { materiales: true },
  });

  if (!fase) {
    return NextResponse.json({ error: "Fase no encontrada" }, { status: 404 });
  }

  if (fase.materiales.length > 0 && !force) {
    return NextResponse.json(
      { error: "La fase tiene materiales asignados. Usa force=1 para confirmar y devolver al inventario." },
      { status: 400 }
    );
  }

  await prisma.fase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
