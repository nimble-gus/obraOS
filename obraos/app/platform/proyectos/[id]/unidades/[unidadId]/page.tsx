import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UnidadDetalleClient } from "./UnidadDetalleClient";

export default async function UnidadDetallePage({
  params,
}: {
  params: Promise<{ id: string; unidadId: string }>;
}) {
  const { id: proyectoId, unidadId } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    select: { id: true, nombre: true, numUnidades: true },
  });
  const unidad = await prisma.unidad.findFirst({
    where: { id: unidadId, proyectoId, activa: true },
    include: {
      proyecto: { select: { nombre: true } },
      avancesFase: { select: { faseId: true, pctAvance: true, status: true } },
    },
  });

  if (!proyecto || !unidad) notFound();

  const fases = await prisma.fase.findMany({
    where: { proyectoId },
    orderBy: { orden: "asc" },
    include: {
      tareas: {
        orderBy: { orden: "asc" },
        select: {
          id: true,
          nombre: true,
          cantidadM2: true,
          cantidadM3: true,
          fechaInicio: true,
          fechaFin: true,
          completadas: {
            where: { unidadId },
            select: { unidadId: true },
          },
          materialesAsignados: {
            where: { unidadId },
            include: {
              lote: { include: { catalogoMaterial: true } },
              catalogoMaterial: true,
            },
          },
          planillasRegistroAsignadas: {
            where: { unidadId },
            include: {
              planillaRegistro: {
                include: { planilla: { select: { nombre: true } } },
              },
            },
          },
          planillasBloqueAsignadas: {
            where: { unidadId },
            include: { planilla: { select: { nombre: true } } },
          },
          serviciosAsignados: {
            where: { unidadId },
            include: { servicio: true },
          },
        },
      },
    },
  });

  const [materialesConStock, planillas, servicios] = await Promise.all([
    prisma.catalogoMaterial.findMany({
      where: { activo: true, stockTotal: { gt: 0 } },
      select: { id: true, nombre: true, unidad: true, costoUnitario: true, stockTotal: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.planilla.findMany({
      where: { proyectoId },
      include: { registros: true },
    }),
    prisma.catalogoServicio.findMany({ where: { activo: true } }),
  ]);

  const fasesConCompletadas = fases.map((f) => ({
    ...f,
    tareas: f.tareas.map((t) => ({
      ...t,
      completada: t.completadas.length > 0,
      materialesAsignados: t.materialesAsignados,
      planillasRegistroAsignadas: t.planillasRegistroAsignadas,
      planillasBloqueAsignadas: t.planillasBloqueAsignadas,
      serviciosAsignados: t.serviciosAsignados,
    })),
  }));

  return (
    <div>
      <Link
        href={`/platform/visor?proyecto=${proyectoId}`}
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a Control de Obra
      </Link>
      <UnidadDetalleClient
        proyectoId={proyectoId}
        unidad={{
          id: unidad.id,
          etiqueta: unidad.etiqueta,
          numero: unidad.numero,
          pctAvanceGlobal: unidad.pctAvanceGlobal,
          fechaEntregaEstimada: unidad.fechaEntregaEstimada?.toISOString().slice(0, 10) ?? null,
        }}
        materialesConStock={materialesConStock}
        planillasConRegistros={planillas.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          registros: p.registros.map((r) => ({
            id: r.id,
            nombre: r.nombre,
            unidad: r.unidad,
            tarifa: r.tarifa,
          })),
        }))}
        servicios={servicios}
        fases={fasesConCompletadas.map((f) => {
          const avance = unidad.avancesFase?.find((a) => a.faseId === f.id);
          return {
            id: f.id,
            nombre: f.nombre,
            orden: f.orden,
            status: f.status,
            pctAvance: avance?.pctAvance ?? 0,
            tareas: f.tareas.map((t) => ({
              id: t.id,
              nombre: t.nombre,
              cantidadM2: t.cantidadM2,
              cantidadM3: t.cantidadM3,
              fechaInicio: t.fechaInicio?.toISOString().slice(0, 10) ?? null,
              fechaFin: t.fechaFin?.toISOString().slice(0, 10) ?? null,
              completada: t.completada,
              materialesAsignados: t.materialesAsignados.map((ma) => ({
                id: ma.id,
                cantidad: ma.cantidad,
                monto: ma.monto,
                lote: ma.lote ? { catalogoMaterial: { nombre: ma.lote.catalogoMaterial.nombre, unidad: ma.lote.catalogoMaterial.unidad } } : undefined,
                catalogoMaterial: ma.catalogoMaterial ? { nombre: ma.catalogoMaterial.nombre, unidad: ma.catalogoMaterial.unidad } : undefined,
              })),
              planillasRegistroAsignadas: t.planillasRegistroAsignadas,
              planillasBloqueAsignadas: t.planillasBloqueAsignadas,
              serviciosAsignados: t.serviciosAsignados,
            })),
          };
        })}
      />
    </div>
  );
}
