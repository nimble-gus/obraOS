import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
  const { materialId, cantidadRequerida } = body;

  if (!materialId || cantidadRequerida == null) {
    return NextResponse.json(
      { error: "Faltan materialId o cantidadRequerida" },
      { status: 400 }
    );
  }

  const cant = Math.max(1, parseInt(String(cantidadRequerida)) || 1);

  const existing = await prisma.materialFase.findUnique({
    where: { faseId_materialId: { faseId, materialId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Este material ya está en la fase" },
      { status: 400 }
    );
  }

  const material = await prisma.catalogoMaterial.findUnique({
    where: { id: materialId },
    select: { stockTotal: true, nombre: true, unidad: true },
  });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  const yaAsignado = await prisma.materialFase.aggregate({
    where: { materialId },
    _sum: { cantidadRequerida: true },
  });
  const totalAsignado = yaAsignado._sum.cantidadRequerida ?? 0;
  const disponible = Math.max(0, material.stockTotal - totalAsignado);
  if (cant > disponible) {
    return NextResponse.json(
      { error: `Stock insuficiente. Disponible: ${disponible} ${material.unidad}, solicitado: ${cant}` },
      { status: 400 }
    );
  }

  const mf = await prisma.materialFase.create({
    data: {
      faseId,
      materialId,
      cantidadRequerida: cant,
      pctEjecutado: 0,
    },
    include: { material: true },
  });

  return NextResponse.json(mf);
}
