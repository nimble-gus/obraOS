"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  semaforoPresupuesto,
  semaforoAvance,
  semaforoGlobal,
  prediccionFechaEntrega,
  costoMaterialesPorUnidad,
  costoServiciosPorUnidad,
  costoPlanillaPorUnidad,
  presupuestoPorUnidad,
  pctMaterialPorUnidad,
  cantidadMaterialPorUnidad,
  pctInventarioPorUnidad,
  type Semaforo,
} from "@/lib/visor-indicadores";
import { ProyectoSelector } from "./ProyectoSelector";
import { PanelDerechoVisor } from "./PanelDerechoVisor";

type MaterialFase = {
  id: string;
  cantidadRequerida: number;
  pctEjecutado: number;
  material: { id: string; nombre: string; unidad: string; stockTotal: number; costoUnitario: number };
  distribucionesUnidad?: { unidadId: string; porcentaje: number }[];
};

type FaseVisor = {
  id: string;
  nombre: string;
  pctAvance: number;
  status: string;
  orden?: number;
  partes3D?: unknown;
  materiales?: MaterialFase[];
  servicios?: { cantidadRequerida: number; servicio: { nombre: string; unidad: string; costoUnitario: number } }[];
  planillasAsignadas?: { monto: number; planilla: { nombre: string } }[];
  tareas?: { id: string; nombre: string; orden: number; completadas: { unidadId: string }[] }[];
};

type Unidad = {
  id: string;
  numero: number;
  etiqueta: string;
  pctAvanceGlobal: number;
  faseActualId?: string | null;
  avancesFase?: { faseId: string; pctAvance: number; fechaInicio?: string | Date | null; fechaFin?: string | Date | null }[];
};

function pctAvanceDesdeTareas(fases: FaseVisor[], unidadId: string): number {
  let totalPct = 0;
  let count = 0;
  for (const fase of fases) {
    const tareas = fase.tareas ?? [];
    if (tareas.length === 0) continue;
    const completadas = tareas.filter((t) =>
      t.completadas.some((c: { unidadId: string }) => c.unidadId === unidadId)
    ).length;
    totalPct += (completadas / tareas.length) * 100;
    count++;
  }
  return count > 0 ? Math.round(totalPct / count) : 0;
}

const SEMA_VERDE = "#22c55e";
const SEMA_AMARILLO = "#eab308";
const SEMA_ROJO = "#ef4444";

function SemaforoDot({ s }: { s: Semaforo }) {
  const color = s === "verde" ? SEMA_VERDE : s === "amarillo" ? SEMA_AMARILLO : SEMA_ROJO;
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        bgcolor: color,
        boxShadow: `0 0 0 2px ${color}40`,
      }}
    />
  );
}

export function VisorIndicadoresClient({
  proyectoId,
  proyectoNombre,
  fases,
  unidades = [],
  numUnidadesMax = 0,
  presupuestoTotal = null,
  presupuestoObraDirecta = null,
  costoComprometido = 0,
  puedeBorrarUnidades = false,
  proyectos = [],
  fechaEntregaEstimada = null,
}: {
  proyectoId?: string | null;
  proyectoNombre?: string;
  fases: FaseVisor[];
  unidades?: Unidad[];
  numUnidadesMax?: number;
  presupuestoTotal?: number | null;
  presupuestoObraDirecta?: number | null;
  costoComprometido?: number;
  puedeBorrarUnidades?: boolean;
  proyectos?: { id: string; nombre: string }[];
  fechaEntregaEstimada?: Date | string | null;
}) {
  const router = useRouter();
  const [unidadActivaIdx, setUnidadActivaIdx] = useState(0);
  const [faseActivaIdxLocal, setFaseActivaIdxLocal] = useState(0);
  const unidadActiva = unidades[unidadActivaIdx];
  const faseActivaIdx =
    unidades.length > 0 && unidadActiva?.faseActualId != null
      ? (() => {
          const i = fases.findIndex((f) => f.id === unidadActiva.faseActualId);
          return i >= 0 ? i : 0;
        })()
      : faseActivaIdxLocal;

  const onFaseActivaChange = (idx: number) => {
    if (unidades.length > 0 && unidadActiva && fases[idx]) {
      fetch(`/api/unidades/${unidadActiva.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faseActualId: fases[idx].id }),
      }).then(() => window.dispatchEvent(new Event("unidad-updated")));
    } else {
      setFaseActivaIdxLocal(idx);
    }
  };

  useEffect(() => {
    const h = () => router.refresh();
    window.addEventListener("unidad-updated", h);
    return () => window.removeEventListener("unidad-updated", h);
  }, [router]);

  const numUnidades = Math.max(1, unidades.length);
  const unidadIds = unidades.map((u) => u.id);

  const distribucionesByMf: Record<string, { unidadId: string; porcentaje: number }[]> = {};
  for (const fase of fases) {
    for (const mf of fase.materiales ?? []) {
      if (mf.distribucionesUnidad?.length) {
        distribucionesByMf[mf.id] = mf.distribucionesUnidad;
      }
    }
  }

  const presupuestoUnidad = presupuestoPorUnidad(presupuestoObraDirecta ?? 0, numUnidades);
  const primeraFaseConInicio = fases.find((f) => {
    const av = unidades[0]?.avancesFase?.find((a) => a.faseId === f.id);
    return av?.fechaInicio;
  });
  const fechaRef = primeraFaseConInicio
    ? (() => {
        const u = unidades[0];
        if (!u) return null;
        const av = u.avancesFase?.find((a) => a.faseId === primeraFaseConInicio.id);
        return av?.fechaInicio ? new Date(av.fechaInicio) : null;
      })()
    : null;

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Indicadores por unidad</h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              Presupuesto, materiales e inventario
            </p>
          </div>
          {proyectos.length > 0 && (
            <ProyectoSelector proyectos={proyectos} value={proyectoId ?? undefined} />
          )}
        </div>

        {!proyectoId ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              color: "var(--text3)",
            }}
          >
            Selecciona un proyecto para ver indicadores
          </Box>
        ) : unidades.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              color: "var(--text3)",
            }}
          >
            No hay unidades. Agrega unidades en el panel.
          </Box>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unidades.map((u, idx) => {
              const pctAvance = u.pctAvanceGlobal > 0 ? u.pctAvanceGlobal : pctAvanceDesdeTareas(fases, u.id);
              const costoMat = costoMaterialesPorUnidad(
                fases.flatMap((f) => f.materiales ?? []),
                u.id,
                unidadIds,
                distribucionesByMf
              );
              const costoServ = costoServiciosPorUnidad(
                fases.flatMap((f) => f.servicios ?? []),
                u.id,
                unidadIds
              );
              const costoPlan = costoPlanillaPorUnidad(
                fases.flatMap((f) => f.planillasAsignadas ?? []),
                u.id,
                unidadIds
              );
              const costoTotal = costoMat + costoServ + costoPlan;
              const pctPresupuesto =
                presupuestoUnidad && presupuestoUnidad > 0
                  ? (costoTotal / presupuestoUnidad) * 100
                  : 0;
              const semaPresu = semaforoPresupuesto(pctPresupuesto);
              const semaAvance = semaforoAvance(pctAvance, 50); // simplificado
              const sema = semaforoGlobal(semaPresu, semaAvance);
              const { fechaEstimada, diasRestantes } = prediccionFechaEntrega(
                pctAvance,
                fechaRef,
                fechaEntregaEstimada ? new Date(fechaEntregaEstimada) : null
              );

              const topMateriales = fases
                .flatMap((f) =>
                  (f.materiales ?? []).map((mf) => {
                    const pct = pctMaterialPorUnidad(u.id, unidadIds, mf.distribucionesUnidad);
                    const cant = cantidadMaterialPorUnidad(mf.cantidadRequerida, pct);
                    const stock = mf.material.stockTotal;
                    const pctInv = pctInventarioPorUnidad(cant, stock);
                    return {
                      nombre: mf.material.nombre,
                      unidad: mf.material.unidad,
                      pctInventario: pctInv,
                      cantidad: cant,
                      stock,
                    };
                  })
                )
                .filter((m) => m.cantidad > 0)
                .sort((a, b) => b.pctInventario - a.pctInventario)
                .slice(0, 6);

              const esPrimeraUnidad = unidadIds[0] === u.id;
              const serviciosRaw = esPrimeraUnidad
                ? fases.flatMap((f) => (f.servicios ?? []))
                : [];
              const serviciosPorId = new Map<
                string,
                { nombre: string; cantidad: number; unidad: string; costo: number }
              >();
              for (const sf of serviciosRaw) {
                const id = (sf.servicio as { id?: string }).id ?? sf.servicio.nombre;
                const costo = sf.cantidadRequerida * sf.servicio.costoUnitario;
                const existing = serviciosPorId.get(id);
                if (existing) {
                  existing.cantidad += sf.cantidadRequerida;
                  existing.costo += costo;
                } else {
                  serviciosPorId.set(id, {
                    nombre: sf.servicio.nombre,
                    cantidad: sf.cantidadRequerida,
                    unidad: sf.servicio.unidad,
                    costo,
                  });
                }
              }
              const serviciosUnidad = Array.from(serviciosPorId.values());
              const planillaUnidad = esPrimeraUnidad
                ? fases.flatMap((f) =>
                    (f.planillasAsignadas ?? []).map((pa) => ({
                      nombre: pa.planilla.nombre,
                      monto: pa.monto,
                    }))
                  )
                : [];

              const colorPresu =
                semaPresu === "verde"
                  ? SEMA_VERDE
                  : semaPresu === "amarillo"
                    ? SEMA_AMARILLO
                    : SEMA_ROJO;

              return (
                <Card
                  key={u.id}
                  sx={{
                    border: unidadActivaIdx === idx ? "2px solid var(--accent)" : "1px solid var(--border2)",
                    background: "var(--bg3)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "var(--accent)", boxShadow: 2 },
                  }}
                  onClick={() => setUnidadActivaIdx(idx)}
                >
                  <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                    <div className="mb-3 flex items-center justify-between">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {u.etiqueta}
                      </Typography>
                      <SemaforoDot s={sema} />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--text3)" }}>
                          <span>Avance</span>
                          <span className="font-mono">{pctAvance}%</span>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          value={pctAvance}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "var(--bg2)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              bgcolor: "var(--accent)",
                            },
                          }}
                        />
                      </div>

                      {presupuestoUnidad != null && presupuestoUnidad > 0 && (
                        <div>
                          <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--text3)" }}>
                            <span>Presupuesto</span>
                            <span className="font-mono">
                              {pctPresupuesto.toFixed(0)}% (Q{Math.round(costoTotal).toLocaleString()})
                            </span>
                          </div>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(120, pctPresupuesto)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "var(--bg2)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                bgcolor: colorPresu,
                              },
                            }}
                          />
                        </div>
                      )}

                      {topMateriales.length > 0 && (
                        <div>
                          <Typography variant="caption" sx={{ color: "var(--text3)", display: "block", mb: 0.5 }}>
                            Asignado vs stock por material
                          </Typography>
                          <div className="space-y-2">
                            {topMateriales.map((m) => (
                              <div key={m.nombre} className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className="truncate text-xs"
                                    style={{ color: "var(--text2)", flex: 1, minWidth: 0 }}
                                  >
                                    {m.nombre}
                                  </span>
                                  <span className="text-xs font-mono shrink-0" style={{ color: "var(--text)" }}>
                                    {m.cantidad} / {m.stock} {m.unidad}
                                  </span>
                                </div>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, m.stock > 0 ? (m.cantidad / m.stock) * 100 : 0)}
                                  sx={{
                                    height: 5,
                                    borderRadius: 2,
                                    bgcolor: "var(--bg2)",
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 2,
                                      bgcolor: m.cantidad > m.stock ? SEMA_ROJO : "var(--accent)",
                                    },
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {serviciosUnidad.length > 0 && (
                        <div>
                          <Typography variant="caption" sx={{ color: "var(--text3)", display: "block", mb: 0.5 }}>
                            Costos varios
                          </Typography>
                          <div className="space-y-1">
                            {serviciosUnidad.map((s, i) => (
                              <div key={`${s.nombre}-${i}`} className="flex items-center justify-between gap-1 text-xs">
                                <span className="truncate" style={{ color: "var(--text2)", flex: 1, minWidth: 0 }}>
                                  {s.nombre}
                                </span>
                                <span className="font-mono shrink-0" style={{ color: "var(--text)" }}>
                                  {s.cantidad} {s.unidad} · Q{Math.round(s.costo).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {planillaUnidad.length > 0 && (
                        <div>
                          <Typography variant="caption" sx={{ color: "var(--text3)", display: "block", mb: 0.5 }}>
                            Planilla
                          </Typography>
                          <div className="space-y-1">
                            {planillaUnidad.map((p, i) => (
                              <div key={`${p.nombre}-${i}`} className="flex items-center justify-between gap-1 text-xs">
                                <span className="truncate" style={{ color: "var(--text2)", flex: 1, minWidth: 0 }}>
                                  {p.nombre}
                                </span>
                                <span className="font-mono shrink-0" style={{ color: "var(--text)" }}>
                                  Q{Math.round(p.monto).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {fechaEstimada && diasRestantes != null && (
                        <div className="rounded border pt-2" style={{ borderColor: "var(--border2)" }}>
                          <Typography variant="caption" sx={{ color: "var(--text3)" }}>
                            Predicción entrega
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: "var(--text)" }}>
                            {fechaEstimada.toLocaleDateString("es-GT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--text3)" }}>
                            {diasRestantes} días restantes
                          </Typography>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {proyectoId && (
        <PanelDerechoVisor
          proyectoId={proyectoId}
          fases={fases as Parameters<typeof PanelDerechoVisor>[0]["fases"]}
          unidades={unidades}
          presupuestoTotal={presupuestoTotal}
          presupuestoObraDirecta={presupuestoObraDirecta}
          costoComprometido={costoComprometido}
          numUnidadesMax={numUnidadesMax}
          unidadActivaIdx={unidadActivaIdx}
          faseActivaIdx={faseActivaIdx}
          onUnidadChange={setUnidadActivaIdx}
          puedeBorrarUnidades={puedeBorrarUnidades}
          onFaseActivaChange={onFaseActivaChange}
        />
      )}
    </div>
  );
}
