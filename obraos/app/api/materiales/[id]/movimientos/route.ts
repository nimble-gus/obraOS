import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET: Trazabilidad - listado de movimientos (entradas/salidas) de un material.
 * Query: ?limit=50&tipo=ENTRADA|SALIDA (opcional)
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
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const tipo = searchParams.get("tipo") as "ENTRADA" | "SALIDA" | null;

  const material = await prisma.catalogoMaterial.findUnique({
    where: { id },
    select: { id: true, nombre: true, unidad: true, stockTotal: true },
  });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  const movimientos = await prisma.inventarioMovimiento.findMany({
    where: {
      materialId: id,
      ...(tipo ? { tipo } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      unidad: { select: { etiqueta: true, numero: true } },
    },
  });

  return NextResponse.json({
    material: { id: material.id, nombre: material.nombre, unidad: material.unidad, stockTotal: material.stockTotal },
    movimientos,
  });
}
