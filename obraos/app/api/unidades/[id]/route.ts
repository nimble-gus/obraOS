import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { puedeBorrarUnidades } from "@/lib/permissions";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!puedeBorrarUnidades(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "Solo el administrador puede borrar unidades" },
      { status: 403 }
    );
  }
  const { id } = await params;
  await prisma.unidad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

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
  if (body.etiqueta != null) data.etiqueta = String(body.etiqueta);
  if (body.fechaEntregaEstimada !== undefined)
    data.fechaEntregaEstimada = body.fechaEntregaEstimada ? new Date(body.fechaEntregaEstimada) : null;
  if (body.faseActualId != null) data.faseActualId = body.faseActualId || null;
  if (body.modeloCasaId != null) data.modeloCasaId = body.modeloCasaId || null;
  if (body.pctAvanceGlobal != null) data.pctAvanceGlobal = Math.max(0, Math.min(100, Number(body.pctAvanceGlobal)));
  if (body.activa != null) data.activa = Boolean(body.activa);

  const unidad = await prisma.unidad.update({
    where: { id },
    data: data as Parameters<typeof prisma.unidad.update>[0]["data"],
    include: { modeloCasa: true, faseActual: true },
  });

  return NextResponse.json(unidad);
}
