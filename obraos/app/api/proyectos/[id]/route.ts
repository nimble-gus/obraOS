import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { puedeConfigurarModeloFinanciero } from "@/lib/permissions";

/**
 * PATCH: Actualizar proyecto (modelo financiero). Solo ADMIN puede editar.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!puedeConfigurarModeloFinanciero(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "Solo el administrador puede configurar el modelo financiero" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const {
    presupuestoTotal,
    margenObjetivo,
    pctCostosIndirectos,
    pctContingencia,
    precioVenta,
    fechaEntregaEstimada,
    imagenUrl,
  } = body;

  const data: Record<string, unknown> = {};
  if (presupuestoTotal !== undefined) {
    data.presupuestoTotal = presupuestoTotal != null ? parseFloat(presupuestoTotal) : null;
  }
  if (margenObjetivo !== undefined) {
    data.margenObjetivo = Math.max(0, Math.min(1, parseFloat(margenObjetivo) ?? 0));
  }
  if (pctCostosIndirectos !== undefined) {
    data.pctCostosIndirectos = Math.max(0, Math.min(1, parseFloat(pctCostosIndirectos) ?? 0));
  }
  if (pctContingencia !== undefined) {
    data.pctContingencia = Math.max(0, Math.min(1, parseFloat(pctContingencia) ?? 0));
  }
  if (precioVenta !== undefined) {
    data.precioVenta = Math.max(0, parseFloat(precioVenta) ?? 0);
  }
  if (fechaEntregaEstimada !== undefined) {
    data.fechaEntregaEstimada = fechaEntregaEstimada ? new Date(fechaEntregaEstimada) : null;
  }
  if (imagenUrl !== undefined) {
    data.imagenUrl = imagenUrl == null || imagenUrl === "" ? null : String(imagenUrl);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Ningún campo para actualizar" }, { status: 400 });
  }

  const proyecto = await prisma.proyecto.update({
    where: { id },
    data: data as Parameters<typeof prisma.proyecto.update>[0]["data"],
  });

  return NextResponse.json(proyecto);
}
