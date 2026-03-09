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

  const { id } = await params;
  const planilla = await prisma.planilla.findUnique({
    where: { id },
    include: {
      registros: true,
      asignaciones: { include: { fase: { select: { id: true, nombre: true } } } },
      proyecto: { select: { id: true, nombre: true } },
    },
  });

  if (!planilla) {
    return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
  }

  const totalRegistros = planilla.registros.reduce((s, r) => s + r.total, 0);

  return NextResponse.json({ ...planilla, totalRegistros });
}
