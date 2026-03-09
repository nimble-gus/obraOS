import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { puedeGestionarEquipo } from "@/lib/permissions";
import { EquipoClient } from "./EquipoClient";
import { QuitarBoton } from "./QuitarBoton";

const COLORS = ["var(--accent)", "var(--blue)", "var(--purple)", "var(--green)"];

export default async function EquipoPage() {
  const session = await auth();
  const puedeGestionar = puedeGestionarEquipo(session?.user?.role ?? "");

  const pms = await prisma.usuario.findMany({
    where: { rol: "PROJECT_MANAGER", estado: "ACTIVO" },
    include: {
      proyectosAsignados: {
        include: {
          unidades: { where: { activa: true }, select: { id: true } },
          fases: {
            orderBy: { orden: "asc" as const },
            include: {
              tareas: { include: { completadas: { select: { unidadId: true } } } },
              avancesUnidad: { select: { unidadId: true, pctAvance: true } },
            },
          },
        },
      },
    },
  });

  /** Calcula avance real: tareas completadas por unidad, o avancesUnidad si no hay tareas. Igual que en Proyectos. */
  function pctAvanceProyecto(p: {
    numUnidades: number;
    unidades: { id: string }[];
    fases: {
      tareas: { completadas: { unidadId: string }[] }[];
      avancesUnidad: { unidadId: string; pctAvance: number }[];
      pctAvance: number;
    }[];
  }): number {
    const numFases = p.fases.length;
    const numPlanificadas = Math.max(1, p.numUnidades);
    if (p.unidades.length === 0) {
      if (numFases === 0) return 0;
      return Math.round(p.fases.reduce((s, f) => s + f.pctAvance, 0) / numFases);
    }
    if (numFases === 0) return 0;
    let sumaTotal = 0;
    for (const u of p.unidades) {
      let sumaPctFase = 0;
      for (const fase of p.fases) {
        const totalEnFase = fase.tareas.length;
        if (totalEnFase > 0) {
          const completadas = fase.tareas.filter((t) =>
            t.completadas.some((c) => c.unidadId === u.id)
          ).length;
          sumaPctFase += (completadas / totalEnFase) * 100;
        } else {
          const av = fase.avancesUnidad?.find((a) => a.unidadId === u.id);
          sumaPctFase += av?.pctAvance ?? 0;
        }
      }
      sumaTotal += sumaPctFase / numFases;
    }
    return Math.round(sumaTotal / numPlanificadas);
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Equipo de Project Managers
          </h1>
          <p style={{ color: "var(--text3)" }} className="mt-0.5 text-sm">
            {pms.length} PMs activos · {pms.reduce((s, p) => s + p.proyectosAsignados.length, 0)} proyectos asignados
          </p>
        </div>
        {puedeGestionar && <EquipoClient />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pms.map((pm, i) => {
          const color = COLORS[i % COLORS.length];
          const avg =
            pm.proyectosAsignados.length > 0
              ? Math.round(
                  pm.proyectosAsignados.reduce(
                    (s, p) => s + pctAvanceProyecto(p),
                    0
                  ) / pm.proyectosAsignados.length
                )
              : 0;
          return (
            <div
              key={pm.id}
              className="rounded-xl border p-5"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="mb-3 flex h-13 w-13 items-center justify-center rounded-full text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${color}44, ${color}18)`,
                    color,
                  }}
                >
                  {pm.nombre.slice(0, 2).toUpperCase()}
                </div>
                {puedeGestionar && (
                  <QuitarBoton pmId={pm.id} pmNombre={pm.nombre} />
                )}
              </div>
              <div className="mb-0.5 font-bold">{pm.nombre}</div>
              <div
                className="mb-4 font-mono text-[11px]"
                style={{ color: "var(--text3)" }}
              >
                PROJECT MANAGER
              </div>
              <div className="mb-4 flex gap-4">
                <div>
                  <div className="text-xl font-bold" style={{ color }}>
                    {pm.proyectosAsignados.length}
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text3)" }}>PROYECTOS</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: "var(--green)" }}>{avg}%</div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text3)" }}>AVG AVANCE</div>
                </div>
              </div>
              <div className="space-y-2">
                {pm.proyectosAsignados.slice(0, 3).map((p) => {
                  const pct = pctAvanceProyecto(p);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md px-2.5 py-2 text-[11px]"
                      style={{ background: "var(--bg3)" }}
                    >
                      <span className="font-semibold">{p.nombre}</span>
                      <span className="font-mono" style={{ color: "var(--accent)" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {pms.length === 0 && (
        <div
          className="rounded-xl border border-dashed p-16 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          No hay Project Managers asignados
          {puedeGestionar && (
            <p className="mt-4">
              <a href="/admin/usuarios/nuevo?rol=PROJECT_MANAGER" className="font-medium" style={{ color: "var(--accent)" }}>
                + Agregar primer PM
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
