import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario || usuario.rol !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const proyectosAsignados = await prisma.proyecto.count({
    where: { pmAsignadoId: id },
  });
  if (proyectosAsignados > 0) {
    return NextResponse.json(
      { error: "El PM tiene proyectos asignados. Reasigna los proyectos antes de quitarlo." },
      { status: 400 }
    );
  }

  await prisma.usuario.update({
    where: { id },
    data: { rol: "SUPERVISOR" },
  });

  return NextResponse.json({ ok: true });
}
