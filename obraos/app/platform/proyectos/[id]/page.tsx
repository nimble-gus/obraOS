import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CapexPanel } from "../CapexPanel";
import { FondosPanel } from "../FondosPanel";
import { FondosChart } from "../FondosChart";

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: "Residencial",
  APARTAMENTOS: "Apartamentos",
  VILLAS: "Villas",
  CONDOMINIO: "Condominio",
  COMERCIAL: "Comercial",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  ACTIVE: "En curso",
  DONE: "Listo",
};

function fmtQ(n: number): string {
  if (n >= 1e6) return `Q${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `Q${(n / 1e3).toFixed(0)}K`;
  return `Q${Math.round(n).toLocaleString()}`;
}

function toLocalDate(date: Date): string {
  // Ajustar a fecha local (según timezone del servidor) evitando el desfase por UTC
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      pmAsignado: { select: { nombre: true } },
      unidades: {
        where: { activa: true },
        orderBy: { numero: "asc" },
        select: { id: true, numero: true, etiqueta: true },
      },
      fases: {
        orderBy: { orden: "asc" },
        include: {
          tareas: { include: { completadas: { select: { unidadId: true } } } },
          avancesUnidad: { select: { unidadId: true, pctAvance: true } },
          servicios: {
            include: {
              servicio: { select: { costoUnitario: true, nombre: true } },
            },
          },
        },
      },
      planillas: {
        include: {
          registros: { select: { tarifa: true } },
        },
      },
      presupuestoRubros: true,
    },
  });

  if (!proyecto) notFound();

  // Calcular avance total (igual lógica que en proyectos/page)
  function calcularAvance(p: typeof proyecto) {
    if (!p) return { pctTotal: 0, pctPorFase: [] as number[] };
    const unidades = p.unidades;
    const numFases = p.fases.length;
    const numPlanificadas = Math.max(1, p.numUnidades);
    if (unidades.length === 0) {
      const pctFases = numFases
        ? Math.round(
            p.fases.reduce((s, f) => s + f.pctAvance, 0) / numFases
          )
        : 0;
      return {
        pctTotal: pctFases,
        pctPorFase: p.fases.map((f) => f.pctAvance),
      };
    }
    if (numFases === 0) {
      return {
        pctTotal: 0,
        pctPorFase: [] as number[],
      };
    }
    const pctPorUnidad = unidades.map((u) => {
      let sumaPctFase = 0;
      for (const fase of p.fases) {
        const totalEnFase = fase.tareas.length;
        let pctFase: number;
        if (totalEnFase > 0) {
          let completadas = 0;
          for (const t of fase.tareas) {
            if (t.completadas.some((c) => c.unidadId === u.id)) completadas++;
          }
          pctFase = (completadas / totalEnFase) * 100;
        } else {
          const avance = fase.avancesUnidad?.find(
            (a) => a.unidadId === u.id
          );
          pctFase = avance?.pctAvance ?? 0;
        }
        sumaPctFase += pctFase;
      }
      return sumaPctFase / numFases;
    });
    const sumaPcts = pctPorUnidad.reduce((s, x) => s + x, 0);
    const pctTotal = Math.round(sumaPcts / numPlanificadas);
    return {
      pctTotal,
      pctPorFase: p.fases.map((f) => f.pctAvance),
    };
  }

  const avance = calcularAvance(proyecto);

  // Presupuesto de obra directa
  const pctDirecto =
    1 -
    (proyecto.pctCostosIndirectos ?? 0) -
    (proyecto.pctContingencia ?? 0) -
    (proyecto.margenObjetivo ?? 0);
  const presupuestoObra =
    (proyecto.presupuestoTotal ?? 0) * Math.max(0, pctDirecto);

  // OPEX (costos varios) = suma de servicios por fases del proyecto
  let opexTotal = 0;
  for (const fase of proyecto.fases) {
    for (const sf of fase.servicios) {
      opexTotal +=
        sf.cantidadRequerida * (sf.servicio?.costoUnitario ?? 0);
    }
  }

  // Planilla: suma de tarifas de todos los registros (indicativo)
  const planillaTotal = proyecto.planillas.reduce((s, pl) => {
    const sumaTarifas = pl.registros.reduce((a, r) => a + r.tarifa, 0);
    return s + sumaTarifas;
  }, 0);

  const statusAvance =
    avance.pctTotal >= 80
      ? "done"
      : avance.pctTotal >= 20
        ? "active"
        : "planning";
  const colorAvance =
    statusAvance === "done"
      ? "var(--green)"
      : statusAvance === "active"
        ? "var(--accent)"
        : "var(--blue)";

  // Fondos desembolsados
  const desembolsos = await prisma.desembolsoProyecto.findMany({
    where: { proyectoId: id },
    orderBy: { fecha: "asc" },
    select: {
      id: true,
      fecha: true,
      monto: true,
      descripcion: true,
      unidad: { select: { id: true, etiqueta: true, numero: true } },
    },
  });

  const totalDesembolsado = desembolsos.reduce((s, d) => s + d.monto, 0);

  // Ejecución real diaria (materiales + planilla + servicios)
  const [
    matPorDia,
    planBloquePorDia,
    planRegPorDia,
    servPorDia,
  ] = await Promise.all([
    prisma.materialAsignadoTarea.groupBy({
      by: ["createdAt"],
      where: { unidad: { proyectoId: id } },
      _sum: { monto: true },
    }),
    prisma.planillaAsignadaTarea.groupBy({
      by: ["createdAt"],
      where: { unidad: { proyectoId: id } },
      _sum: { monto: true },
    }),
    prisma.planillaRegistroAsignadoTarea.groupBy({
      by: ["createdAt"],
      where: { unidad: { proyectoId: id } },
      _sum: { monto: true },
    }),
    prisma.servicioAsignadoTarea.groupBy({
      by: ["createdAt"],
      where: { unidad: { proyectoId: id } },
      _sum: { monto: true },
    }),
  ]);

  const ejecucionPorDiaMap = new Map<string, number>();
  const addEjecucion = (rows: { createdAt: Date; _sum: { monto: number | null } }[]) => {
    for (const r of rows) {
      const dia = r.createdAt.toISOString().slice(0, 10);
      ejecucionPorDiaMap.set(dia, (ejecucionPorDiaMap.get(dia) ?? 0) + (r._sum.monto ?? 0));
    }
  };
  addEjecucion(matPorDia);
  addEjecucion(planBloquePorDia);
  addEjecucion(planRegPorDia);
  addEjecucion(servPorDia);

  const totalEjecutado = Array.from(ejecucionPorDiaMap.values()).reduce((s, v) => s + v, 0);

  // Serie diaria para la gráfica: presupuesto (constante), fondos acumulados y ejecución acumulada
  const fechasSet = new Set<string>();
  for (const d of desembolsos) {
    fechasSet.add(toLocalDate(d.fecha));
  }
  for (const dia of ejecucionPorDiaMap.keys()) {
    fechasSet.add(dia);
  }
  const fechasOrdenadas = Array.from(fechasSet).sort();

  let acumuladoFondos = 0;
  let acumuladoEjecucion = 0;
  const serieFondos = fechasOrdenadas.map((dia) => {
    const fondosDelDia = desembolsos
      .filter((d) => toLocalDate(d.fecha) === dia)
      .reduce((s, d) => s + d.monto, 0);
    const ejecDelDia = ejecucionPorDiaMap.get(dia) ?? 0;
    acumuladoFondos += fondosDelDia;
    acumuladoEjecucion += ejecDelDia;
    return {
      fecha: dia,
      presupuesto: presupuestoObra,
      fondos: acumuladoFondos,
      ejecucion: acumuladoEjecucion,
    };
  });

  return (
    <div>
      <Link
        href="/platform/proyectos"
        className="mb-4 inline-block text-sm hover:underline"
        style={{ color: "var(--text3)" }}
      >
        ← Volver a proyectos
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {proyecto.nombre}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            {TIPO_LABEL[proyecto.tipo] ?? proyecto.tipo} · {proyecto.ubicacion} · PM:{" "}
            {proyecto.pmAsignado.nombre}
          </p>
        </div>
        <Link
          href={`/platform/visor?proyecto=${id}`}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Control de Obra →
        </Link>
      </div>

      <FondosChart series={serieFondos} />

      <CapexPanel
        proyectoId={id}
        precioVenta={proyecto.precioVenta}
        presupuestoTotal={proyecto.presupuestoTotal}
        margenObjetivo={proyecto.margenObjetivo}
        pctCostosIndirectos={proyecto.pctCostosIndirectos}
        pctContingencia={proyecto.pctContingencia}
        presupuestoRubros={proyecto.presupuestoRubros}
        puedeEditar={!!session && (session.user as any)?.role === "ADMIN"}
      />

      <FondosPanel
        proyectoId={id}
        desembolsos={desembolsos.map((d) => ({
          id: d.id,
          fecha: toLocalDate(d.fecha),
          monto: d.monto,
          descripcion: d.descripcion,
          unidad: d.unidad
            ? {
                id: d.unidad.id,
                etiqueta: d.unidad.etiqueta,
                numero: d.unidad.numero,
              }
            : null,
        }))}
        totalDesembolsado={totalDesembolsado}
        totalEjecutado={totalEjecutado}
        unidades={proyecto.unidades}
        puedeEditar={!!session && (session.user as any)?.role === "ADMIN"}
      />

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text3)" }}
          >
            Avance total
          </div>
          <div
            className="mt-1 text-2xl font-bold"
            style={{ color: colorAvance }}
          >
            {avance.pctTotal}%
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${avance.pctTotal}%`, background: colorAvance }}
            />
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text3)" }}
          >
            Presupuesto obra
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
            {fmtQ(presupuestoObra)}
          </div>
          <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>
            Total planificado
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text3)" }}
          >
            OPEX / Costos varios
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {fmtQ(opexTotal)}
          </div>
          <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>
            Servicios por fase
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text3)" }}
          >
            Unidades
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
            {proyecto.numUnidades} un.
          </div>
        </div>
      </div>

      {/* Fases */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-4 font-bold" style={{ color: "var(--text)" }}>
          Fases
        </h2>
        {proyecto.fases.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text3)" }}>
            Sin fases definidas. Configura las fases desde Control de Obra.
          </p>
        ) : (
          <div className="space-y-3">
            {proyecto.fases.map((fase) => {
              const status =
                fase.status === "DONE"
                  ? "done"
                  : fase.status === "ACTIVE"
                    ? "active"
                    : "pending";
              const color =
                status === "done"
                  ? "var(--green)"
                  : status === "active"
                    ? "var(--accent)"
                    : "var(--text3)";
              return (
                <div
                  key={fase.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border py-3 px-4"
                  style={{ borderColor: "var(--border)", background: "var(--bg)" }}
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="min-w-[140px] font-medium">
                    {fase.nombre}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, fase.pctAvance)}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-sm font-mono"
                    style={{ color }}
                  >
                    {fase.pctAvance}%
                  </span>
                  <span
                    className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: `${color}22`,
                      color,
                    }}
                  >
                    {STATUS_LABEL[fase.status] ?? fase.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/platform/visor?proyecto=${id}`}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Control de Obra
        </Link>
        <Link
          href="/platform/materiales"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Materiales
        </Link>
        <Link
          href="/platform/planilla"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Planilla
        </Link>
        <Link
          href="/platform/servicios"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Costos varios
        </Link>
      </div>
    </div>
  );
}
