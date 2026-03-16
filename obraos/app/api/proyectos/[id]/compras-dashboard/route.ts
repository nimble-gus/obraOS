import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type SeriePorDia = {
  fecha: string;
  materiales: number;
  planilla: number;
  otrosCostos: number;
  total: number;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: proyectoId } = await params;
  const { searchParams } = new URL(req.url);
  const unidadId = searchParams.get("unidad") || null;

  if (!proyectoId) {
    return NextResponse.json(
      { error: "proyectoId requerido" },
      { status: 400 },
    );
  }

  // Materiales:
  // Para tener un valor NETO después de devoluciones, usamos siempre
  // las asignaciones vivas a tareas/unidades (MaterialAsignadoTarea).
  // Si se elimina o ajusta una asignación, el histórico se corrige.
  const materialesPorDia = await prisma.materialAsignadoTarea.groupBy({
    by: ["createdAt"],
    where: unidadId
      ? {
          unidadId,
          unidad: { proyectoId },
        }
      : {
          unidad: { proyectoId },
        },
    _sum: { monto: true },
  });

  // Planilla (mano de obra): montos asignados a tareas/unidades
  const planillaBloquePorDia = await prisma.planillaAsignadaTarea.groupBy({
    by: ["createdAt"],
    where: {
      unidad: {
        proyectoId,
      },
    },
    _sum: { monto: true },
  });

  const planillaRegistroPorDia =
    await prisma.planillaRegistroAsignadoTarea.groupBy({
      by: ["createdAt"],
      where: {
        unidad: {
          proyectoId,
        },
      },
      _sum: { monto: true },
    });

  // Otros costos: servicios asignados
  const serviciosPorDia = await prisma.servicioAsignadoTarea.groupBy({
    by: ["createdAt"],
    where: {
      unidad: {
        proyectoId,
      },
    },
    _sum: { monto: true },
  });

  const mapa: Record<string, SeriePorDia> = {};

  const ensureDia = (fechaIso: string): SeriePorDia => {
    const fecha = fechaIso.slice(0, 10);
    if (!mapa[fecha]) {
      mapa[fecha] = {
        fecha,
        materiales: 0,
        planilla: 0,
        otrosCostos: 0,
        total: 0,
      };
    }
    return mapa[fecha];
  };

  for (const row of materialesPorDia) {
    const dia = ensureDia(row.createdAt.toISOString());
    const valor = row._sum.monto ?? 0;
    dia.materiales += valor;
  }

  for (const row of [...planillaBloquePorDia, ...planillaRegistroPorDia]) {
    const dia = ensureDia(row.createdAt.toISOString());
    const valor = row._sum.monto ?? 0;
    dia.planilla += valor;
  }

  for (const row of serviciosPorDia) {
    const dia = ensureDia(row.createdAt.toISOString());
    const valor = row._sum.monto ?? 0;
    dia.otrosCostos += valor;
  }

  const seriesDiaria = Object.values(mapa)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((d) => ({
      ...d,
      total: d.materiales + d.planilla + d.otrosCostos,
    }));

  const resumen = seriesDiaria.reduce(
    (acc, d) => {
      acc.materiales += d.materiales;
      acc.planilla += d.planilla;
      acc.otrosCostos += d.otrosCostos;
      acc.total += d.total;
      return acc;
    },
    { materiales: 0, planilla: 0, otrosCostos: 0, total: 0 },
  );

  return NextResponse.json({
    resumen,
    seriesDiaria,
  });
}

