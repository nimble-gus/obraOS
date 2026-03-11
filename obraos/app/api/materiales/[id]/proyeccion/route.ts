import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { calcularProyeccionAgotamiento } from "@/lib/inventario-indicadores";

/**
 * GET: Proyección de agotamiento del material.
 * Query: ?dias=30 (opcional, días a analizar)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dias = Math.min(90, Math.max(7, parseInt(searchParams.get("dias") ?? "30", 10) || 30));

  const material = await prisma.catalogoMaterial.findUnique({
    where: { id },
    select: { id: true, nombre: true, unidad: true, stockTotal: true },
  });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dias);

  const salidas = await prisma.inventarioMovimiento.findMany({
    where: {
      materialId: id,
      tipo: "SALIDA",
      createdAt: { gte: cutoff },
    },
    select: { cantidad: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const proyeccion = calcularProyeccionAgotamiento(
    material.stockTotal,
    salidas,
    dias
  );

  return NextResponse.json({
    material: { id: material.id, nombre: material.nombre, unidad: material.unidad, stockTotal: material.stockTotal },
    proyeccion,
  });
}
