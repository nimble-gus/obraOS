import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { puedeConfigurarModeloFinanciero } from "@/lib/permissions";

/** GET: Lista de límites por rubro del proyecto */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const rubros = await prisma.presupuestoRubro.findMany({
    where: { proyectoId: id },
    orderBy: { rubro: "asc" },
  });
  return NextResponse.json(rubros);
}

/** PUT: Reemplazar todos los límites por rubro. Body: { rubros: { rubro: string, pctPresupuesto: number }[] } */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!puedeConfigurarModeloFinanciero(session.user.role ?? "")) {
    return NextResponse.json(
      { error: "Solo el administrador puede configurar límites por rubro" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { rubros } = body as { rubros: { rubro: string; pctPresupuesto: number }[] };

  if (!Array.isArray(rubros)) {
    return NextResponse.json(
      { error: "rubros debe ser un arreglo" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.presupuestoRubro.deleteMany({ where: { proyectoId: id } });
    const valid = rubros.filter(
      (r) =>
        r?.rubro &&
        typeof r.rubro === "string" &&
        typeof r.pctPresupuesto === "number" &&
        r.pctPresupuesto > 0 &&
        r.pctPresupuesto <= 1
    );
    if (valid.length > 0) {
      await tx.presupuestoRubro.createMany({
        data: valid.map((r) => ({
          proyectoId: id,
          rubro: String(r.rubro).trim(),
          pctPresupuesto: Math.min(1, Math.max(0, r.pctPresupuesto)),
        })),
      });
    }
  });

  const updated = await prisma.presupuestoRubro.findMany({
    where: { proyectoId: id },
    orderBy: { rubro: "asc" },
  });
  return NextResponse.json(updated);
}
