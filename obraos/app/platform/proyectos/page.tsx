import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { puedeCrearProyectos } from "@/lib/permissions";
import { ProyectosGrid } from "./ProyectosGrid";

const TIPO_LABEL: Record<string, string> = {
  RESIDENCIAL: "Residencial",
  APARTAMENTOS: "Apartamentos",
  VILLAS: "Villas",
  CONDOMINIO: "Condominio",
  COMERCIAL: "Comercial",
};

export default async function ProyectosPage() {
  const session = await auth();
  const puedeCrear = puedeCrearProyectos(session?.user?.role ?? "");

  const [proyectos, pms] = await Promise.all([
    prisma.proyecto.findMany({
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }),
    prisma.usuario.findMany({
      where: { rol: "PROJECT_MANAGER", estado: "ACTIVO" },
      select: { id: true, nombre: true },
    }),
  ]);

  function calcularAvancePorUnidad(p: (typeof proyectos)[0]) {
    const unidades = p.unidades;
    const numFases = p.fases.length;
    const numPlanificadas = Math.max(1, p.numUnidades);
    if (unidades.length === 0) {
      const pctFases = numFases
        ? Math.round(p.fases.reduce((s, f) => s + f.pctAvance, 0) / numFases)
        : 0;
      return { pctTotal: pctFases, pctPorUnidad: [] as { etiqueta: string; numero: number; pct: number }[] };
    }
    if (numFases === 0) {
      return {
        pctTotal: 0,
        pctPorUnidad: unidades.map((u) => ({ etiqueta: u.etiqueta, numero: u.numero, pct: 0 })),
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
          const avance = fase.avancesUnidad?.find((a) => a.unidadId === u.id);
          pctFase = avance?.pctAvance ?? 0;
        }
        sumaPctFase += pctFase;
      }
      const pct = Math.round(sumaPctFase / numFases);
      return { etiqueta: u.etiqueta, numero: u.numero, pct };
    });
    const sumaPcts = pctPorUnidad.reduce((s, x) => s + x.pct, 0);
    const pctTotal = Math.round(sumaPcts / numPlanificadas);
    return { pctTotal, pctPorUnidad };
  }

  function presupuestoObraDirecta(p: (typeof proyectos)[0]) {
    const total = p.presupuestoTotal ?? 0;
    const pct =
      1 -
      (p.pctCostosIndirectos ?? 0) -
      (p.pctContingencia ?? 0) -
      (p.margenObjetivo ?? 0);
    return total * Math.max(0, pct);
  }

  const proyectosConAvance = proyectos.map((p) => ({
    ...p,
    ...calcularAvancePorUnidad(p),
    presupuestoObra: presupuestoObraDirecta(p),
  }));

  if (!puedeCrear && proyectos.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Proyectos</h1>
        <div
          className="mt-8 rounded-xl border border-dashed p-16 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          <p className="text-lg font-medium">No hay proyectos activos</p>
          <p className="mt-2 text-sm">
            No existen proyectos asignados. Contacta al administrador para que agregue proyectos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Proyectos</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            {proyectos.length} proyectos activos
          </p>
        </div>
      </div>

      <ProyectosGrid
        proyectos={proyectosConAvance}
        pms={pms}
        esAdmin={session?.user?.role === "ADMIN"}
        puedeCrear={puedeCrear}
      />
    </div>
  );
}
