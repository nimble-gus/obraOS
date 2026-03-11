import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { puedeBorrarUnidades } from "@/lib/permissions";

function calcularCostoComprometido(proyecto: {
  fases?: {
    materiales: { cantidadRequerida: number; material: { costoUnitario: number } }[];
    servicios: { cantidadRequerida: number; servicio: { costoUnitario: number } }[];
    planillasAsignadas: { monto: number }[];
  }[];
}) {
  let total = 0;
  for (const fase of proyecto.fases ?? []) {
    for (const mf of fase.materiales ?? []) {
      total += mf.cantidadRequerida * mf.material.costoUnitario;
    }
    for (const sf of fase.servicios ?? []) {
      total += sf.cantidadRequerida * sf.servicio.costoUnitario;
    }
    for (const pa of fase.planillasAsignadas ?? []) {
      total += pa.monto;
    }
  }
  return total;
}
import { VisorIndicadoresClient } from "./VisorIndicadoresClient";
import { ProyectoSelector } from "./ProyectoSelector";

export default async function VisorPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const proyectoId = params.proyecto;

  const proyecto = proyectoId
    ? await prisma.proyecto.findUnique({
        where: { id: proyectoId },
        include: {
          fases: {
            orderBy: { orden: "asc" },
            include: {
              materiales: {
                include: {
                  material: true,
                  distribucionesUnidad: { select: { unidadId: true, porcentaje: true } },
                },
              },
              servicios: { include: { servicio: true } },
              planillasAsignadas: { include: { planilla: { select: { nombre: true } } } },
              tareas: { orderBy: { orden: "asc" }, include: { completadas: true } },
            },
          },
          unidades: {
            where: { activa: true },
            orderBy: { numero: "asc" },
            include: { modeloCasa: true, avancesFase: true },
          },
          partes3D: true,
          pmAsignado: { select: { nombre: true } },
        },
      })
    : null;

  const proyectos = await prisma.proyecto.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Visor</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            {proyecto
              ? `${proyecto.nombre} — PM: ${proyecto.pmAsignado?.nombre}`
              : "Selecciona un proyecto"}
          </p>
        </div>
        {proyectos.length > 0 && (
          <ProyectoSelector proyectos={proyectos} value={proyectoId} />
        )}
      </div>

      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--border)",
          height: "calc(100vh - 220px)",
          minHeight: 400,
        }}
      >
        <VisorIndicadoresClient
          proyectoId={proyecto?.id}
          proyectoNombre={proyecto?.nombre}
          fases={proyecto?.fases ?? []}
          unidades={proyecto?.unidades ?? []}
          numUnidadesMax={proyecto?.numUnidades ?? 0}
          presupuestoTotal={proyecto?.presupuestoTotal ?? null}
          presupuestoObraDirecta={
            proyecto?.presupuestoTotal
              ? (proyecto.presupuestoTotal *
                  Math.max(
                    0,
                    1 - (proyecto.pctCostosIndirectos ?? 0) - (proyecto.pctContingencia ?? 0) - (proyecto.margenObjetivo ?? 0)
                  )) || null
              : null
          }
          costoComprometido={proyecto ? calcularCostoComprometido(proyecto) : 0}
          puedeBorrarUnidades={puedeBorrarUnidades(session?.user?.role ?? "")}
          proyectos={proyectos}
          fechaEntregaEstimada={proyecto?.fechaEntregaEstimada ?? null}
        />
      </div>
    </div>
  );
}
