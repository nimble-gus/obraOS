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

  const { id: proyectoId } = await params;
  const body = await req.json();
  const { catalogoMaterialId, cantidad, precioUnitario, descripcion } = body;

  if (!catalogoMaterialId || cantidad == null || cantidad <= 0 || precioUnitario == null || precioUnitario < 0) {
    return NextResponse.json(
      { error: "Faltan catalogoMaterialId, cantidad o precioUnitario válidos" },
      { status: 400 }
    );
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
  });
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const material = await prisma.catalogoMaterial.findFirst({
    where: { id: catalogoMaterialId, activo: true },
  });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  const cantidadNum = parseFloat(String(cantidad));
  const precioNum = parseFloat(String(precioUnitario));
  const total = cantidadNum * precioNum;

  const lote = await prisma.loteMaterial.create({
    data: {
      catalogoMaterialId,
      proyectoId,
      cantidad: cantidadNum,
      cantidadInicial: cantidadNum,
      precioUnitario: precioNum,
      total,
      descripcion: descripcion && String(descripcion).trim() ? String(descripcion) : null,
    },
    include: {
      catalogoMaterial: { select: { nombre: true, unidad: true } },
    },
  });

  return NextResponse.json(lote);
}
