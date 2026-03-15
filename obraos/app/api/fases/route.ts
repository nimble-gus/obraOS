import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parsePartes3D } from "@/app/platform/visor/lib/partes3d";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { proyectoId, nombre, orden, partes3D, catalogoFaseId } = body;

  if (!proyectoId || !nombre) {
    return NextResponse.json(
      { error: "Faltan proyectoId o nombre" },
      { status: 400 }
    );
  }

  const maxOrden = await prisma.fase.aggregate({
    where: { proyectoId },
    _max: { orden: true },
  });
  const nextOrden = orden != null ? Number(orden) : (maxOrden._max.orden ?? -1) + 1;

  const raw = Array.isArray(partes3D) ? partes3D : parsePartes3D(partes3D);
  const partes = raw.length > 0 ? raw : ["foundation"];

  const fase = await prisma.fase.create({
    data: {
      proyectoId,
      catalogoFaseId: catalogoFaseId || null,
      nombre: String(nombre),
      orden: nextOrden,
      status: "PENDING",
      partes3D: partes,
    },
    include: { materiales: { include: { material: true } } },
  });

  return NextResponse.json(fase);
}
