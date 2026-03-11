import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; mfId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { mfId } = await params;
  const body = await req.json();
  const pct = body.pctEjecutado != null ? Math.max(0, Math.min(100, Number(body.pctEjecutado))) : undefined;

  if (pct === undefined) {
    return NextResponse.json({ error: "pctEjecutado requerido" }, { status: 400 });
  }

  const actual = await prisma.materialFase.findUnique({
    where: { id: mfId },
    include: { material: true },
  });
  if (!actual) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const oldUsado = Math.floor((actual.cantidadRequerida * actual.pctEjecutado) / 100);
  const newUsado = Math.floor((actual.cantidadRequerida * Math.round(pct)) / 100);
  const delta = newUsado - oldUsado;

  if (delta > 0) {
    const mat = await prisma.catalogoMaterial.findUnique({
      where: { id: actual.materialId },
    });
    if (!mat || mat.stockTotal < delta) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${mat?.stockTotal ?? 0}, necesario: ${delta}` },
        { status: 400 }
      );
    }
    const saldoAntes = mat.stockTotal;
    const saldoDespues = saldoAntes - delta;
    const fase = await prisma.fase.findUnique({
      where: { id: actual.faseId },
      select: { proyectoId: true },
    });
    await prisma.$transaction([
      prisma.catalogoMaterial.update({
        where: { id: actual.materialId },
        data: { stockTotal: { decrement: delta } },
      }),
      prisma.inventarioMovimiento.create({
        data: {
          materialId: actual.materialId,
          tipo: "SALIDA",
          cantidad: delta,
          saldoAntes,
          saldoDespues,
          faseId: actual.faseId,
          materialFaseId: mfId,
          proyectoId: fase?.proyectoId ?? undefined,
        },
      }),
    ]);
  }

  const mf = await prisma.materialFase.update({
    where: { id: mfId },
    data: { pctEjecutado: Math.round(pct) },
    include: { material: true },
  });

  return NextResponse.json(mf);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; mfId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { mfId } = await params;
  await prisma.materialFase.delete({ where: { id: mfId } });
  return NextResponse.json({ ok: true });
}
