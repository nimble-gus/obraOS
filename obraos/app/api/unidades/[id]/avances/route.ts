import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET: Obtener avances por fase para una unidad.
 * Retorna un mapa faseId -> { pctAvance, status, fechaInicio, fechaFin }
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: unidadId } = await params;

  const avances = await prisma.avanceUnidadFase.findMany({
    where: { unidadId },
    include: { fase: true },
  });

  const map: Record<string, { pctAvance: number; status: string; fechaInicio: string | null; fechaFin: string | null }> = {};
  for (const a of avances) {
    map[a.faseId] = {
      pctAvance: a.pctAvance,
      status: a.status,
      fechaInicio: a.fechaInicio?.toISOString() ?? null,
      fechaFin: a.fechaFin?.toISOString() ?? null,
    };
  }

  return NextResponse.json(map);
}

/**
 * POST: Crear o actualizar avance de una unidad en una fase.
 * Body: { faseId, pctAvance?, status?, fechaInicio?, fechaFin? }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: unidadId } = await params;
  const body = await req.json();
  const { faseId, pctAvance, status, fechaInicio, fechaFin } = body;

  if (!faseId) {
    return NextResponse.json({ error: "faseId requerido" }, { status: 400 });
  }

  const st = status ?? "PENDING";
  const fi = fechaInicio ? new Date(fechaInicio) : null;
  const ff = fechaFin ? new Date(fechaFin) : null;
  const pct =
    pctAvance != null
      ? Math.max(0, Math.min(100, Number(pctAvance)))
      : st === "DONE"
        ? 100
        : undefined;

  const updateData: Record<string, unknown> = {};
  if (pct != null) updateData.pctAvance = pct;
  if (status != null) updateData.status = st;
  if (fechaInicio !== undefined) updateData.fechaInicio = fi;
  if (fechaFin !== undefined) updateData.fechaFin = ff;

  const pctFinal = pct ?? (st === "DONE" ? 100 : 0);

  const avance = await prisma.avanceUnidadFase.upsert({
    where: {
      unidadId_faseId: { unidadId, faseId },
    },
    create: {
      unidadId,
      faseId,
      pctAvance: pctFinal,
      status: st,
      fechaInicio: fi,
      fechaFin: ff,
    },
    update: updateData as Parameters<typeof prisma.avanceUnidadFase.update>[0]["data"],
    include: { fase: true },
  });

  return NextResponse.json(avance);
}
