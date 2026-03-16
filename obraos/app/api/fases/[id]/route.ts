import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** PATCH: Actualizar fase (nombre, orden) */
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
  if (body.orden !== undefined) data.orden = Number(body.orden);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Ningún campo para actualizar" }, { status: 400 });
  }

  const fase = await prisma.fase.update({
    where: { id },
    data: data as Parameters<typeof prisma.fase.update>[0]["data"],
  });

  return NextResponse.json(fase);
}

/** DELETE: Eliminar fase (cascade elimina tareas y relaciones) */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.fase.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
