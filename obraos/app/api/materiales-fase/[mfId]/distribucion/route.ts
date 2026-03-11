import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * PUT: Actualizar distribución de material por unidad.
 * Body: { distribucion: [{ unidadId: string, porcentaje: number }] }
 * Los porcentajes deben sumar 100.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ mfId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { mfId } = await params;
  const body = await req.json();
  const distribucion = (Array.isArray(body.distribucion) ? body.distribucion : []) as {
    unidadId: string;
    porcentaje: number;
  }[];

  const mf = await prisma.materialFase.findUnique({
    where: { id: mfId },
    include: {
      fase: { select: { proyectoId: true } },
      material: true,
    },
  });
  if (!mf) {
    return NextResponse.json({ error: "MaterialFase no encontrado" }, { status: 404 });
  }

  const unidades = await prisma.unidad.findMany({
    where: { proyectoId: mf.fase.proyectoId, activa: true },
    select: { id: true },
  });
  const unidadIds = new Set(unidades.map((u) => u.id));

  const total = distribucion.reduce((s: number, d: { unidadId: string; porcentaje: number }) => {
    if (!unidadIds.has(d.unidadId)) return s;
    return s + Math.max(0, Math.min(100, Number(d.porcentaje) || 0));
  }, 0);

  if (Math.abs(total - 100) > 0.01 && distribucion.length > 0) {
    return NextResponse.json(
      { error: `Los porcentajes deben sumar 100 (actual: ${total.toFixed(1)})` },
      { status: 400 }
    );
  }

  await prisma.materialFase.update({
    where: { id: mfId },
    data: {
      distribucionesUnidad: {
        deleteMany: {},
      },
    },
  });
  const toCreate = distribucion
    .filter((d) => unidadIds.has(d.unidadId))
    .map((d) => {
      const pct = Math.max(0, Math.min(100, Number(d.porcentaje) || 0));
      return pct > 0 ? { materialFaseId: mfId, unidadId: d.unidadId, porcentaje: pct } : null;
    })
    .filter((x): x is { materialFaseId: string; unidadId: string; porcentaje: number } => x != null);
  if (toCreate.length > 0) {
    await prisma.materialFaseUnidad.createMany({
      data: toCreate,
    });
  }

  const updated = await prisma.materialFase.findUnique({
    where: { id: mfId },
    include: {
      distribucionesUnidad: { include: { unidad: { select: { id: true, etiqueta: true, numero: true } } } },
      material: true,
    },
  });

  return NextResponse.json(updated);
}

/**
 * GET: Obtener distribución actual de un MaterialFase
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mfId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { mfId } = await params;
  const mf = await prisma.materialFase.findUnique({
    where: { id: mfId },
    include: {
      distribucionesUnidad: { include: { unidad: { select: { id: true, etiqueta: true, numero: true } } } },
      material: true,
      fase: {
        include: {
          proyecto: {
            include: {
              unidades: {
                where: { activa: true },
                select: { id: true, etiqueta: true, numero: true },
              },
            },
          },
        },
      },
    },
  });
  if (!mf) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(mf);
}
