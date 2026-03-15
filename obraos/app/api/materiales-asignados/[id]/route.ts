import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const asignacion = await prisma.materialAsignadoTarea.findUnique({
    where: { id },
    include: { catalogoMaterial: true, lote: true },
  });

  if (!asignacion) {
    return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
  }

  const cantidad = Math.round(asignacion.cantidad);

  if (asignacion.catalogoMaterialId) {
    await prisma.$transaction([
      prisma.materialAsignadoTarea.delete({ where: { id } }),
      prisma.catalogoMaterial.update({
        where: { id: asignacion.catalogoMaterialId },
        data: { stockTotal: { increment: cantidad } },
      }),
    ]);
  } else if (asignacion.loteId && asignacion.lote) {
    await prisma.$transaction([
      prisma.materialAsignadoTarea.delete({ where: { id } }),
      prisma.loteMaterial.update({
        where: { id: asignacion.loteId },
        data: { cantidad: { increment: asignacion.cantidad } },
      }),
    ]);
  } else {
    await prisma.materialAsignadoTarea.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
