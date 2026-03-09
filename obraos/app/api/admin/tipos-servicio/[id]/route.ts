import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nombre, orden, activo } = body;

  const data: Record<string, unknown> = {};
  if (nombre !== undefined) data.nombre = String(nombre).trim();
  if (orden !== undefined) data.orden = Number(orden);
  if (activo !== undefined) data.activo = Boolean(activo);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Ningún campo para actualizar" }, { status: 400 });
  }

  const tipo = await prisma.catalogoTipoServicio.update({
    where: { id },
    data: data as Parameters<typeof prisma.catalogoTipoServicio.update>[0]["data"],
  });

  return NextResponse.json(tipo);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const serviciosCount = await prisma.catalogoServicio.count({
    where: { tipoServicioId: id },
  });
  if (serviciosCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: hay ${serviciosCount} servicio(s) que usan este tipo` },
      { status: 400 }
    );
  }

  await prisma.catalogoTipoServicio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
