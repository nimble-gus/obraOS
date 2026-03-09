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

  const { id: planillaId } = await params;
  const body = await req.json();
  const { faseId, monto } = body;

  if (!faseId || monto == null) {
    return NextResponse.json(
      { error: "faseId y monto son requeridos" },
      { status: 400 }
    );
  }

  const planilla = await prisma.planilla.findUnique({
    where: { id: planillaId },
    include: { registros: true },
  });
  if (!planilla) {
    return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
  }

  const totalPlanilla = planilla.registros.reduce((s, r) => s + r.total, 0);
  const montoNum = Math.max(0, parseFloat(String(monto)) || 0);
  if (montoNum > totalPlanilla) {
    return NextResponse.json(
      { error: `El monto no puede exceder el total de la planilla (Q${totalPlanilla.toFixed(2)})` },
      { status: 400 }
    );
  }

  const asignacion = await prisma.planillaAsignadaFase.upsert({
    where: {
      planillaId_faseId: { planillaId, faseId },
    },
    create: { planillaId, faseId, monto: montoNum },
    update: { monto: montoNum },
  });

  return NextResponse.json(asignacion);
}
