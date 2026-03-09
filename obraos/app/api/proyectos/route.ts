import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    nombre,
    tipo,
    ubicacion,
    numUnidades,
    pmAsignadoId,
    precioVenta,
    margenObjetivo,
    pctCostosIndirectos,
    pctContingencia,
    presupuestoTotal,
  } = body;

  if (!nombre || !tipo || !ubicacion) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: String(nombre),
      tipo,
      ubicacion: String(ubicacion),
      numUnidades: parseInt(numUnidades) || 0,
      pmAsignadoId: pmAsignadoId || undefined,
      precioVenta: parseFloat(precioVenta) || 0,
      margenObjetivo: parseFloat(margenObjetivo) ?? 0.25,
      pctCostosIndirectos: parseFloat(pctCostosIndirectos) ?? 0.12,
      pctContingencia: parseFloat(pctContingencia) ?? 0.05,
      presupuestoTotal: presupuestoTotal != null ? parseFloat(presupuestoTotal) : null,
    },
  });

  return NextResponse.json(proyecto);
}
