import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "@/app/components/Link";
import { Box, Typography, Button } from "@mui/material";
import { puedeConfigurarModeloFinanciero } from "@/lib/permissions";
import { ProyectoDashboardClient } from "./ProyectoDashboardClient";

type ServicioConTipo = {
  cantidadRequerida: number;
  servicio: { costoUnitario: number; tipoServicio?: { id: string; nombre: string } | null };
};

function calcularCostoComprometido(proyecto: {
  fases?: {
    materiales: { cantidadRequerida: number; material: { costoUnitario: number } }[];
    servicios: ServicioConTipo[];
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

function calcularDesglose(proyecto: {
  fases?: {
    materiales: { cantidadRequerida: number; material: { costoUnitario: number } }[];
    servicios: ServicioConTipo[];
    planillasAsignadas: { monto: number }[];
  }[];
}): {
  materiales: number;
  planilla: number;
  costosVarios: { tipoNombre: string; monto: number }[];
} {
  let materiales = 0;
  let planilla = 0;
  const porTipo = new Map<string, number>();

  for (const fase of proyecto.fases ?? []) {
    for (const mf of fase.materiales ?? []) {
      materiales += mf.cantidadRequerida * mf.material.costoUnitario;
    }
    for (const pa of fase.planillasAsignadas ?? []) {
      planilla += pa.monto;
    }
    for (const sf of fase.servicios ?? []) {
      const monto = sf.cantidadRequerida * sf.servicio.costoUnitario;
      const nombre = sf.servicio.tipoServicio?.nombre ?? "Sin clasificar";
      porTipo.set(nombre, (porTipo.get(nombre) ?? 0) + monto);
    }
  }

  const costosVarios = Array.from(porTipo.entries())
    .map(([tipoNombre, monto]) => ({ tipoNombre, monto }))
    .sort((a, b) => b.monto - a.monto);

  return { materiales, planilla, costosVarios };
}

function calcularAvanceTotal(p: {
  unidades: { id: string }[];
  fases: {
    tareas: { completadas: { unidadId: string }[] }[];
    avancesUnidad: { unidadId: string; pctAvance: number }[];
    pctAvance: number;
  }[];
  numUnidades: number;
}) {
  const numFases = p.fases.length;
  const numPlanificadas = Math.max(1, p.numUnidades);
  if (p.unidades.length === 0) {
    if (numFases === 0) return 0;
    return Math.round(
      p.fases.reduce((s, f) => s + f.pctAvance, 0) / numFases
    );
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

export default async function ProyectoDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const puedeConfig = puedeConfigurarModeloFinanciero(session?.user?.role ?? "");

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
          materiales: { include: { material: { select: { costoUnitario: true } } } },
          servicios: {
            include: {
              servicio: {
                include: { tipoServicio: { select: { id: true, nombre: true } } },
              },
            },
          },
          planillasAsignadas: { select: { monto: true } },
          avancesUnidad: { select: { unidadId: true, pctAvance: true } },
        },
      },
      presupuestoRubros: { orderBy: { rubro: "asc" } },
    },
  });

  if (!proyecto) notFound();

  const presupuestoRubros = proyecto.presupuestoRubros;

  const costoComprometido = calcularCostoComprometido(proyecto);
  const desglose = calcularDesglose(proyecto);
  const pctAvance = calcularAvanceTotal(proyecto);
  const presupuestoTotal = proyecto.presupuestoTotal ?? 0;
  const restante = Math.max(0, presupuestoTotal - costoComprometido);
  const costoIndirectos = presupuestoTotal * (proyecto.pctCostosIndirectos ?? 0);
  const contingencia = presupuestoTotal * (proyecto.pctContingencia ?? 0);

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Link href="/platform/proyectos">
            <Typography component="span" variant="body2" color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer" }}>
              ← Proyectos
            </Typography>
          </Link>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
            {proyecto.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {proyecto.tipo} · {proyecto.ubicacion} · PM: {proyecto.pmAsignado.nombre}
          </Typography>
        </Box>
        <Button
          component={Link}
          href={`/platform/visor?proyecto=${proyecto.id}`}
          variant="contained"
          color="primary"
        >
          Abrir Visor 3D
        </Button>
      </Box>


      <ProyectoDashboardClient
        proyecto={{
          id: proyecto.id,
          nombre: proyecto.nombre,
          presupuestoTotal,
          costoComprometido,
          restante,
          costoIndirectos,
          contingencia,
          margenObjetivo: proyecto.margenObjetivo ?? 0.25,
          pctCostosIndirectos: proyecto.pctCostosIndirectos ?? 0.12,
          pctContingencia: proyecto.pctContingencia ?? 0.05,
          precioVenta: proyecto.precioVenta ?? 0,
          fechaEntregaEstimada: proyecto.fechaEntregaEstimada,
          pctAvance,
        }}
        desglose={desglose}
        presupuestoRubros={presupuestoRubros}
        puedeConfigurar={puedeConfig}
      />
    </Box>
  );
}
