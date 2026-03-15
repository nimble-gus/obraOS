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

  const { id: proyectoId } = await params;

  const [lotes, planillas, servicios] = await Promise.all([
    prisma.loteMaterial.findMany({
      where: { proyectoId, cantidad: { gt: 0 } },
      include: {
        catalogoMaterial: { select: { nombre: true, unidad: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.planilla.findMany({
      where: { proyectoId },
      include: {
        registros: { select: { tarifa: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.catalogoServicio.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return NextResponse.json({
    lotes,
    planillas: planillas.map((p) => ({
      ...p,
      total: p.registros.reduce((s, r) => s + r.tarifa, 0),
    })),
    servicios,
  });
}
