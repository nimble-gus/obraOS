"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PARTES_3D, PARTE_LABELS, parsePartes3D } from "./lib/partes3d";

type MaterialFase = {
  id: string;
  cantidadRequerida: number;
  pctEjecutado: number;
  material: { id: string; nombre: string; unidad: string; costoUnitario: number; stockTotal: number };
  distribucionesUnidad?: { unidadId: string; porcentaje: number }[];
};

type TareaPanel = { id: string; nombre: string; orden: number; completadas: { unidadId: string }[] };

type ServicioFase = {
  id: string;
  cantidadRequerida: number;
  servicio: { id: string; nombre: string; unidad: string; costoUnitario: number };
};

type PlanillaAsignada = {
  id: string;
  monto: number;
  planilla: { nombre: string };
};

type FasePanel = {
  id: string;
  nombre: string;
  status: string;
  pctAvance: number;
  fechaInicio?: string | Date | null;
  fechaFin?: string | Date | null;
  orden?: number;
  partes3D: unknown;
  materiales?: MaterialFase[];
  servicios?: ServicioFase[];
  planillasAsignadas?: PlanillaAsignada[];
  tareas?: TareaPanel[];
};

type Material = {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stockTotal: number;
  costoUnitario: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACTIVE: "En curso",
  DONE: "Completado",
};

type UnidadPanel = { id: string; numero: number; etiqueta: string };

type AvanceFase = { pctAvance: number; status: string; fechaInicio: string | null; fechaFin: string | null };

function pctAvanceDesdeTareas(fase: FasePanel, unidadId: string | undefined): number | null {
  const tareas = fase.tareas;
  if (!tareas?.length || !unidadId) return null;
  const completadas = tareas.filter((t) => t.completadas.some((c) => c.unidadId === unidadId)).length;
  return Math.round((completadas / tareas.length) * 100);
}

export function PanelDerechoVisor({
  proyectoId,
  fases: fasesIniciales,
  unidades = [],
  numUnidadesMax = 0,
  unidadActivaIdx = 0,
  faseActivaIdx,
  onUnidadChange,
  onFaseActivaChange,
  presupuestoTotal = null,
  presupuestoObraDirecta = null,
  costoComprometido = 0,
  puedeBorrarUnidades = false,
}: {
  proyectoId: string;
  fases: FasePanel[];
  unidades?: UnidadPanel[];
  numUnidadesMax?: number;
  unidadActivaIdx?: number;
  faseActivaIdx: number;
  onUnidadChange?: (idx: number) => void;
  onFaseActivaChange: (idx: number) => void;
  presupuestoTotal?: number | null;
  presupuestoObraDirecta?: number | null;
  costoComprometido?: number;
  puedeBorrarUnidades?: boolean;
}) {
  const router = useRouter();
  const [fases, setFases] = useState<FasePanel[]>(fasesIniciales);
  const [avances, setAvances] = useState<Record<string, AvanceFase>>({});
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [showNuevaFase, setShowNuevaFase] = useState(false);
  const [showNuevaTarea, setShowNuevaTarea] = useState(false);
  const [nombreNuevaTarea, setNombreNuevaTarea] = useState("");
  const [showAgregarMaterial, setShowAgregarMaterial] = useState(false);
  const [showAgregarServicio, setShowAgregarServicio] = useState(false);
  const [servicios, setServicios] = useState<{ id: string; nombre: string; unidad: string; costoUnitario: number }[]>([]);
  const [addingUnidad, setAddingUnidad] = useState(false);
  const [nombreNuevaFase, setNombreNuevaFase] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [distribucionMf, setDistribucionMf] = useState<MaterialFase | null>(null);

  useEffect(() => {
    setFases(fasesIniciales);
  }, [fasesIniciales]);

  const unidadActiva = unidades[unidadActivaIdx ?? 0];
  const hayUnidades = unidades.length > 0;

  useEffect(() => {
    if (hayUnidades && unidadActiva) {
      fetch(`/api/unidades/${unidadActiva.id}/avances`)
        .then((r) => (r.ok ? r.json() : {}))
        .then(setAvances)
        .catch(() => setAvances({}));
    } else {
      setAvances({});
    }
  }, [hayUnidades, unidadActiva?.id]);

  useEffect(() => {
    fetch("/api/materiales")
      .then((r) => r.ok ? r.json() : [])
      .then(setMateriales)
      .catch(() => setMateriales([]));
  }, [showAgregarMaterial]);

  useEffect(() => {
    fetch("/api/servicios")
      .then((r) => r.ok ? r.json() : [])
      .then(setServicios)
      .catch(() => setServicios([]));
  }, [showAgregarServicio]);

  const refresh = () => router.refresh();

  const agregarServicio = async (servicioId: string, cantidad: number) => {
    const fase = fases[faseActivaIdx];
    if (!fase) return;
    setLoading("add-serv");
    try {
      const res = await fetch(`/api/fases/${fase.id}/servicios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId, cantidadRequerida: cantidad }),
      });
      if (res.ok) {
        setShowAgregarServicio(false);
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al agregar servicio");
      }
    } finally {
      setLoading(null);
    }
  };

  const quitarServicio = async (sfId: string) => {
    if (!confirm("¿Quitar este servicio de la fase?")) return;
    const fase = fases[faseActivaIdx];
    if (!fase) return;
    setLoading(sfId);
    try {
      const res = await fetch(`/api/fases/${fase.id}/servicios/${sfId}`, { method: "DELETE" });
      if (res.ok) refresh();
    } finally {
      setLoading(null);
    }
  };

  const quitarPlanillaAsignada = async (asignacionId: string) => {
    if (!confirm("¿Quitar esta planilla de la fase?")) return;
    try {
      const res = await fetch(`/api/planillas/asignaciones/${asignacionId}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch {
      alert("Error");
    }
  };

  const eliminarUnidad = async (unidadId: string, idx: number) => {
    if (!confirm("¿Eliminar esta unidad? Se perderá su avance.")) return;
    if (unidadActivaIdx === idx && unidades.length > 1) {
      onUnidadChange?.(idx > 0 ? idx - 1 : 0);
    }
    try {
      const res = await fetch(`/api/unidades/${unidadId}`, { method: "DELETE" });
      if (res.ok) {
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al eliminar unidad");
      }
    } catch {
      alert("Error al eliminar unidad");
    }
  };

  const agregarUnidad = async () => {
    setAddingUnidad(true);
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId }),
      });
      if (res.ok) refresh();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al agregar unidad");
      }
    } finally {
      setAddingUnidad(false);
    }
  };

  const crearFase = async () => {
    if (!nombreNuevaFase.trim()) return;
    setLoading("crear-fase");
    try {
      const res = await fetch("/api/fases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId,
          nombre: nombreNuevaFase.trim(),
          partes3D: ["foundation"],
        }),
      });
      if (res.ok) {
        setNombreNuevaFase("");
        setShowNuevaFase(false);
        refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Error al crear fase");
      }
    } finally {
      setLoading(null);
    }
  };

  const actualizarFase = async (faseId: string, data: Partial<FasePanel>) => {
    setLoading(faseId);
    try {
      if (data.partes3D !== undefined) {
        const res = await fetch(`/api/fases/${faseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partes3D: data.partes3D }),
        });
        if (res.ok) refresh();
        else {
          const err = await res.json().catch(() => ({}));
          alert(err.error ?? "Error");
        }
      }
      if (data.pctAvance !== undefined || data.status !== undefined || data.fechaInicio !== undefined || data.fechaFin !== undefined) {
        if (hayUnidades && unidadActiva) {
          const res = await fetch(`/api/unidades/${unidadActiva.id}/avances`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              faseId,
              pctAvance: data.pctAvance,
              status: data.status,
              fechaInicio: data.fechaInicio,
              fechaFin: data.fechaFin,
            }),
          });
          if (res.ok) {
            const a = await res.json();
            setAvances((prev) => ({ ...prev, [faseId]: { pctAvance: a.pctAvance, status: a.status, fechaInicio: a.fechaInicio, fechaFin: a.fechaFin } }));
            refresh();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error ?? "Error");
          }
        } else {
          const res = await fetch(`/api/fases/${faseId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pctAvance: data.pctAvance,
              status: data.status,
              fechaInicio: data.fechaInicio,
              fechaFin: data.fechaFin,
            }),
          });
          if (res.ok) refresh();
          else {
            const err = await res.json().catch(() => ({}));
            alert(err.error ?? "Error");
          }
        }
      }
    } finally {
      setLoading(null);
    }
  };

  const eliminarFase = async (faseId: string) => {
    const fase = fases.find((f) => f.id === faseId);
    const tieneMateriales = fase && (fase.materiales?.length ?? 0) > 0;
    const msg = tieneMateriales
      ? "La fase tiene materiales. ¿Eliminar y devolver al inventario?"
      : "¿Eliminar esta fase?";
    if (!confirm(msg)) return;
    setLoading(faseId);
    try {
      const url = tieneMateriales ? `/api/fases/${faseId}?force=1` : `/api/fases/${faseId}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (faseActivaIdx >= fases.length - 1) onFaseActivaChange(Math.max(0, fases.length - 2));
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al eliminar");
      }
    } finally {
      setLoading(null);
    }
  };

  const agregarMaterial = async (materialId: string, cantidad: number) => {
    const fase = fases[faseActivaIdx];
    if (!fase) return;
    setLoading("add-mat");
    try {
      const res = await fetch(`/api/fases/${fase.id}/materiales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, cantidadRequerida: cantidad }),
      });
      if (res.ok) {
        setShowAgregarMaterial(false);
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al agregar material");
      }
    } finally {
      setLoading(null);
    }
  };

  const quitarMaterial = async (mfId: string) => {
    if (!confirm("¿Quitar este material de la fase?")) return;
    const fase = fases[faseActivaIdx];
    if (!fase) return;
    setLoading(mfId);
    try {
      const res = await fetch(`/api/fases/${fase.id}/materiales/${mfId}`, { method: "DELETE" });
      if (res.ok) refresh();
    } finally {
      setLoading(null);
    }
  };

  const guardarDistribucion = async (mfId: string, distribucion: { unidadId: string; porcentaje: number }[]) => {
    setLoading("dist-" + mfId);
    try {
      const res = await fetch(`/api/materiales-fase/${mfId}/distribucion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distribucion }),
      });
      if (res.ok) {
        setDistribucionMf(null);
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al guardar distribución");
      }
    } finally {
      setLoading(null);
    }
  };

  const refetchAvances = () => {
    if (unidadActiva) {
      fetch(`/api/unidades/${unidadActiva.id}/avances`)
        .then((r) => (r.ok ? r.json() : {}))
        .then(setAvances)
        .catch(() => setAvances({}));
    }
  };

  const toggleTarea = async (tareaId: string) => {
    if (!unidadActiva) return;
    setLoading(tareaId);
    try {
      const res = await fetch(`/api/tareas/${tareaId}/completar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unidadId: unidadActiva.id }),
      });
      if (res.ok) {
        refetchAvances();
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error");
      }
    } finally {
      setLoading(null);
    }
  };

  const crearTarea = async () => {
    const fase = fases[faseActivaIdx];
    if (!fase || !nombreNuevaTarea.trim()) return;
    setLoading("crear-tarea");
    try {
      const res = await fetch(`/api/fases/${fase.id}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreNuevaTarea.trim() }),
      });
      if (res.ok) {
        setNombreNuevaTarea("");
        setShowNuevaTarea(false);
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al crear tarea");
      }
    } finally {
      setLoading(null);
    }
  };

  const eliminarTarea = async (tareaId: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setLoading(tareaId);
    try {
      const res = await fetch(`/api/tareas/${tareaId}`, { method: "DELETE" });
      if (res.ok) refresh();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error");
      }
    } finally {
      setLoading(null);
    }
  };

  const faseBase = fases[faseActivaIdx];
  const avanceUnidad = faseBase && hayUnidades && unidadActiva ? avances[faseBase.id] : null;
  const pctFromTasks = faseBase && hayUnidades && unidadActiva ? pctAvanceDesdeTareas(faseBase, unidadActiva.id) : null;
  const fase: (FasePanel & { pctAvance: number; status: string; fechaInicio?: string | Date | null; fechaFin?: string | Date | null }) | undefined = faseBase
    ? {
        ...faseBase,
        pctAvance: pctFromTasks ?? avanceUnidad?.pctAvance ?? faseBase.pctAvance,
        status: avanceUnidad?.status ?? faseBase.status,
        fechaInicio: avanceUnidad?.fechaInicio ? new Date(avanceUnidad.fechaInicio) : faseBase.fechaInicio,
        fechaFin: avanceUnidad?.fechaFin ? new Date(avanceUnidad.fechaFin) : faseBase.fechaFin,
      }
    : undefined;
  const partesActuales = fase ? parsePartes3D(fase.partes3D) : [];

  return (
    <div
      className="flex w-[420px] min-w-[380px] shrink-0 flex-col overflow-hidden border-l"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Presupuesto */}
        {(presupuestoObraDirecta ?? presupuestoTotal) != null && (presupuestoObraDirecta ?? presupuestoTotal ?? 0) > 0 && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border2)" }}>
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Presupuesto
            </span>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text2)" }}>Obra directa:</span>
                <span className="font-mono">Q{Math.round(presupuestoObraDirecta ?? presupuestoTotal ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text2)" }}>Avance de presupuesto:</span>
                <span className="font-mono">Q{Math.round(costoComprometido).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2" style={{ borderColor: "var(--border2)" }}>
                <span style={{ color: "var(--text2)" }}>Restante:</span>
                <span
                  className="font-mono font-semibold"
                  style={{
                    color:
                      (presupuestoObraDirecta ?? presupuestoTotal ?? 0) - costoComprometido < 0
                        ? "var(--red)"
                        : "var(--green)",
                  }}
                >
                  Q{Math.round(Math.max(0, (presupuestoObraDirecta ?? presupuestoTotal ?? 0) - costoComprometido)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Unidades */}
        {numUnidadesMax > 0 && (
          <div>
            <span className="mb-2 block font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Unidades
            </span>
            <div className="flex flex-wrap gap-1">
              {unidades.map((u, i) => (
                <div key={u.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => onUnidadChange?.(i)}
                    className="rounded px-2 py-1.5 text-xs font-medium"
                    style={{
                      background: unidadActivaIdx === i ? "var(--accent)" : "var(--bg3)",
                      color: unidadActivaIdx === i ? "#000" : "var(--text2)",
                    }}
                  >
                    {u.etiqueta}
                  </button>
                  {puedeBorrarUnidades && (
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarUnidad(u.id, i); }}
                      className="rounded p-1 text-[10px] hover:opacity-80"
                      style={{ color: "var(--red)" }}
                      title="Eliminar unidad"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {unidades.length < numUnidadesMax && (
                <button
                  onClick={agregarUnidad}
                  disabled={addingUnidad}
                  className="rounded border border-dashed px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
                >
                  + Unidad
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sección Fases */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Fases
            </span>
            <button
              onClick={() => setShowNuevaFase(true)}
              className="text-[11px] font-semibold"
              style={{ color: "var(--accent)" }}
            >
              + Nueva
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {fases.map((f, i) => {
              const pctTasks = hayUnidades && unidadActiva ? pctAvanceDesdeTareas(f, unidadActiva.id) : null;
              const a = hayUnidades && unidadActiva ? avances[f.id] : null;
              const pct = pctTasks ?? a?.pctAvance ?? f.pctAvance;
              const st = a?.status ?? f.status;
              return (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border p-2"
                style={{
                  borderColor: faseActivaIdx === i ? "var(--accent)" : "var(--border2)",
                  background: faseActivaIdx === i ? "var(--accent-muted)" : "var(--bg3)",
                }}
              >
                <button
                  onClick={() => onFaseActivaChange(i)}
                  className="min-w-0 flex-1 rounded py-1 text-left text-xs font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {f.nombre} ({pct}%)
                </button>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
                  style={{
                    background: st === "DONE" ? "var(--green)" : st === "ACTIVE" ? "var(--accent)" : "var(--bg3)",
                    color: st === "DONE" || st === "ACTIVE" ? "#000" : "var(--text3)",
                  }}
                >
                  {STATUS_LABELS[st] ?? st}
                </span>
                {loading === f.id ? (
                  <span className="text-[10px]" style={{ color: "var(--text3)" }}>…</span>
                ) : (
                  <>
                    <button
                      onClick={() => eliminarFase(f.id)}
                      className="text-[10px] hover:opacity-80"
                      style={{ color: "var(--red)" }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            );
            })}
          </div>

          {showNuevaFase && (
            <div className="mt-2 flex gap-2 rounded-lg border p-2" style={{ borderColor: "var(--border2)" }}>
              <input
                value={nombreNuevaFase}
                onChange={(e) => setNombreNuevaFase(e.target.value)}
                placeholder="Nombre de fase"
                className="flex-1 rounded border px-2 py-1 text-xs outline-none"
                style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                onKeyDown={(e) => e.key === "Enter" && crearFase()}
              />
              <button
                onClick={crearFase}
                disabled={loading === "crear-fase"}
                className="rounded px-2 py-1 text-xs font-semibold text-black"
                style={{ background: "var(--accent)" }}
              >
                Crear
              </button>
              <button
                onClick={() => { setShowNuevaFase(false); setNombreNuevaFase(""); }}
                className="rounded px-2 py-1 text-xs"
                style={{ color: "var(--text3)" }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Detalle de Fase */}
        {fase && (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border2)" }}>
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Detalle
            </span>
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-[10px]" style={{ color: "var(--text3)" }}>Estado</label>
                <select
                  value={fase.status}
                  onChange={(e) => actualizarFase(fase.id, { status: e.target.value })}
                  className="mt-0.5 w-full rounded border px-2 py-1 text-xs"
                  style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="ACTIVE">En curso</option>
                  <option value="DONE">Completado</option>
                </select>
              </div>
              {(fase.tareas?.length ?? 0) > 0 ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-[10px]" style={{ color: "var(--text3)" }}>
                      Tareas (avance: {fase.pctAvance}%)
                    </label>
                    <button
                      onClick={() => setShowNuevaTarea(true)}
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      + Nueva
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(fase.tareas ?? []).map((t) => {
                      const completada = hayUnidades && unidadActiva && t.completadas.some((c) => c.unidadId === unidadActiva.id);
                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 rounded border px-2 py-1.5"
                          style={{ borderColor: "var(--border2)", background: completada ? "rgba(34,197,94,0.12)" : "var(--bg3)" }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleTarea(t.id)}
                            disabled={!!loading}
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                            style={{
                              borderColor: completada ? "var(--green)" : "var(--border2)",
                              background: completada ? "var(--green)" : "transparent",
                              color: completada ? "#000" : "transparent",
                            }}
                          >
                            {completada ? (
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : null}
                          </button>
                          <span className="min-w-0 flex-1 truncate text-xs">{t.nombre}</span>
                          <button
                            onClick={() => eliminarTarea(t.id)}
                            disabled={!!loading}
                            className="shrink-0 text-[10px] hover:opacity-80"
                            style={{ color: "var(--red)" }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {showNuevaTarea && (
                    <div className="mt-2 flex gap-2 rounded-lg border p-2" style={{ borderColor: "var(--border2)" }}>
                      <input
                        value={nombreNuevaTarea}
                        onChange={(e) => setNombreNuevaTarea(e.target.value)}
                        placeholder="Nombre de tarea"
                        className="flex-1 rounded border px-2 py-1 text-xs outline-none"
                        style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                        onKeyDown={(e) => e.key === "Enter" && crearTarea()}
                      />
                      <button
                        onClick={crearTarea}
                        disabled={loading === "crear-tarea"}
                        className="rounded px-2 py-1 text-xs font-semibold text-black"
                        style={{ background: "var(--accent)" }}
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => { setShowNuevaTarea(false); setNombreNuevaTarea(""); }}
                        className="rounded px-2 py-1 text-xs"
                        style={{ color: "var(--text3)" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-[10px]" style={{ color: "var(--text3)" }}>Avance %</label>
                  <p className="mt-1 text-xs" style={{ color: "var(--text2)" }}>
                    {fase.pctAvance}% — Agrega tareas para control por tareas
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setShowNuevaTarea(true)}
                      className="rounded border px-2 py-1 text-xs font-semibold"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      + Primera tarea
                    </button>
                  </div>
                  {showNuevaTarea && (
                    <div className="mt-2 flex gap-2 rounded-lg border p-2" style={{ borderColor: "var(--border2)" }}>
                      <input
                        value={nombreNuevaTarea}
                        onChange={(e) => setNombreNuevaTarea(e.target.value)}
                        placeholder="Nombre de tarea"
                        className="flex-1 rounded border px-2 py-1 text-xs outline-none"
                        style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                        onKeyDown={(e) => e.key === "Enter" && crearTarea()}
                      />
                      <button
                        onClick={crearTarea}
                        disabled={loading === "crear-tarea"}
                        className="rounded px-2 py-1 text-xs font-semibold text-black"
                        style={{ background: "var(--accent)" }}
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => { setShowNuevaTarea(false); setNombreNuevaTarea(""); }}
                        className="rounded px-2 py-1 text-xs"
                        style={{ color: "var(--text3)" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px]" style={{ color: "var(--text3)" }}>Inicio</label>
                  <input
                    type="date"
                    value={fase.fechaInicio ? (typeof fase.fechaInicio === "string" ? fase.fechaInicio.slice(0, 10) : new Date(fase.fechaInicio).toISOString().slice(0, 10)) : ""}
                    onChange={(e) => actualizarFase(fase.id, { fechaInicio: e.target.value || null })}
                    className="mt-0.5 w-full rounded border px-2 py-1 text-xs"
                    style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px]" style={{ color: "var(--text3)" }}>Fin</label>
                  <input
                    type="date"
                    value={fase.fechaFin ? (typeof fase.fechaFin === "string" ? fase.fechaFin.slice(0, 10) : new Date(fase.fechaFin).toISOString().slice(0, 10)) : ""}
                    onChange={(e) => actualizarFase(fase.id, { fechaFin: e.target.value || null })}
                    className="mt-0.5 w-full rounded border px-2 py-1 text-xs"
                    style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px]" style={{ color: "var(--text3)" }}>Partes 3D visibles</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {PARTES_3D.map((p) => {
                    const active = partesActuales.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          const next = active
                            ? partesActuales.filter((x) => x !== p)
                            : [...partesActuales, p];
                          actualizarFase(fase.id, { partes3D: next });
                        }}
                        className="rounded px-2 py-0.5 text-[10px]"
                        style={{
                          background: active ? "var(--accent)" : "var(--bg3)",
                          color: active ? "#000" : "var(--text3)",
                        }}
                      >
                        {PARTE_LABELS[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materiales */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Materiales
            </span>
            {fase && (
              <button
                onClick={() => setShowAgregarMaterial(true)}
                className="text-[11px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                + Agregar
              </button>
            )}
          </div>
          {fase && (
            <div className="space-y-2">
              {(fase.materiales ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs" style={{ color: "var(--text3)" }}>
                  Sin materiales asignados
                </p>
              ) : (
                (fase.materiales ?? []).map((mf) => {
                  const costo = mf.cantidadRequerida * mf.material.costoUnitario;
                  const distribucionActual = mf.distribucionesUnidad;
                  const pctResumen = unidades.length > 1 && distribucionActual?.length
                    ? distribucionActual.map((d) => {
                        const u = unidades.find((x) => x.id === d.unidadId);
                        return u ? `${u.etiqueta}: ${d.porcentaje}%` : "";
                      }).filter(Boolean).join(", ")
                    : unidades.length > 1 && unidades[0]
                      ? `${unidades[0].etiqueta}: 100%` : null;
                  return (
                    <div
                      key={mf.id}
                      className="flex flex-col gap-1 rounded-lg border p-2"
                      style={{ borderColor: "var(--border2)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{mf.material.nombre}</span>
                        <div className="flex items-center gap-0.5">
                          {unidades.length > 1 && (
                            <button
                              onClick={() => setDistribucionMf(mf)}
                              disabled={!!loading}
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium hover:opacity-80"
                              style={{
                                background: distribucionActual?.length ? "var(--accent-muted)" : "var(--bg3)",
                                color: distribucionActual?.length ? "var(--accent)" : "var(--text3)",
                              }}
                              title={pctResumen ?? "Asignar % por unidad"}
                            >
                              Distribuir
                            </button>
                          )}
                          <button
                            onClick={() => quitarMaterial(mf.id)}
                            disabled={!!loading}
                            className="text-[10px] hover:opacity-80"
                            style={{ color: "var(--red)" }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px]" style={{ color: "var(--text3)" }}>
                        <span>{mf.cantidadRequerida} {mf.material.unidad}</span>
                        <span className="font-mono">Q{Math.round(costo).toLocaleString()}</span>
                      </div>
                      {pctResumen && (
                        <div className="text-[9px]" style={{ color: "var(--text3)" }}>{pctResumen}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Servicios (Costos varios) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Costos varios
            </span>
            {fase && (
              <button
                onClick={() => setShowAgregarServicio(true)}
                className="text-[11px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                + Agregar
              </button>
            )}
          </div>
          {fase && (
            <div className="space-y-2">
              {(fase.servicios ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs" style={{ color: "var(--text3)" }}>
                  Sin servicios asignados
                </p>
              ) : (
                (fase.servicios ?? []).map((sf) => {
                  const costo = sf.cantidadRequerida * sf.servicio.costoUnitario;
                  return (
                    <div
                      key={sf.id}
                      className="flex flex-col gap-1 rounded-lg border p-2"
                      style={{ borderColor: "var(--border2)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{sf.servicio.nombre}</span>
                        <button
                          onClick={() => quitarServicio(sf.id)}
                          disabled={!!loading}
                          className="text-[10px] hover:opacity-80"
                          style={{ color: "var(--red)" }}
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex justify-between text-[10px]" style={{ color: "var(--text3)" }}>
                        <span>{sf.cantidadRequerida} {sf.servicio.unidad}</span>
                        <span className="font-mono">Q{Math.round(costo).toLocaleString()}</span>
                      </div>
                      {unidades.length > 1 && unidades[0] && (
                        <div className="text-[9px]" style={{ color: "var(--text3)" }}>
                          {unidades[0].etiqueta}: 100%
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Planilla asignada - todas las del proyecto (no solo fase activa) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Planilla
            </span>
            <a
              href="/platform/planilla"
              className="text-[11px] font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Gestionar
            </a>
          </div>
          {(() => {
            const todasPlanillas = (fases ?? []).flatMap((f) =>
              (f.planillasAsignadas ?? []).map((pa) => ({ ...pa, faseNombre: f.nombre }))
            );
            return todasPlanillas.length === 0 ? (
              <p className="py-4 text-center text-xs" style={{ color: "var(--text3)" }}>
                Sin planillas asignadas. Crea y asigna desde el módulo Planilla.
              </p>
            ) : (
              <div className="space-y-2">
                {todasPlanillas.map((pa) => (
                  <div
                    key={pa.id}
                    className="flex flex-col gap-1 rounded-lg border p-2"
                    style={{ borderColor: "var(--border2)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{pa.planilla.nombre}</span>
                      <button
                        onClick={() => quitarPlanillaAsignada(pa.id)}
                        disabled={!!loading}
                        className="text-[10px] hover:opacity-80"
                        style={{ color: "var(--red)" }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[10px]" style={{ color: "var(--text3)" }}>
                      <span>{pa.faseNombre}</span>
                      <span className="font-mono">Q{Math.round(pa.monto).toLocaleString()}</span>
                    </div>
                    {unidades.length > 1 && unidades[0] && (
                      <div className="text-[9px]" style={{ color: "var(--text3)" }}>
                        {unidades[0].etiqueta}: 100%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal Agregar Material */}
      {showAgregarMaterial && fase && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowAgregarMaterial(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border p-4"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-bold">Agregar material</h3>
            <AgregarMaterialForm
              materiales={materiales}
              materialesEnFase={(fase.materiales ?? []).map((mf) => mf.material.id)}
              onAdd={agregarMaterial}
              onCancel={() => setShowAgregarMaterial(false)}
              loading={loading === "add-mat"}
            />
          </div>
        </div>
      )}

      {/* Modal Agregar Servicio */}
      {showAgregarServicio && fase && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowAgregarServicio(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border p-4"
            style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-bold">Agregar costo (servicio)</h3>
            <AgregarServicioForm
              servicios={servicios}
              serviciosEnFase={(fase.servicios ?? []).map((sf) => sf.servicio.id)}
              onAdd={agregarServicio}
              onCancel={() => setShowAgregarServicio(false)}
              loading={loading === "add-serv"}
            />
          </div>
        </div>
      )}

      {/* Modal Distribución por unidad */}
      {distribucionMf && unidades.length > 1 && (
        <ModalDistribucionMaterial
          material={distribucionMf}
          unidades={unidades}
          onGuardar={(dist) => guardarDistribucion(distribucionMf.id, dist)}
          onCancelar={() => setDistribucionMf(null)}
          loading={!!loading}
        />
      )}
    </div>
  );
}

function ModalDistribucionMaterial({
  material,
  unidades,
  onGuardar,
  onCancelar,
  loading,
}: {
  material: MaterialFase;
  unidades: UnidadPanel[];
  onGuardar: (dist: { unidadId: string; porcentaje: number }[]) => void;
  onCancelar: () => void;
  loading: boolean;
}) {
  const igual = Math.floor(100 / unidades.length);
  const resto = 100 - igual * unidades.length;
  const inicial = unidades.map((u, i) => ({
    unidadId: u.id,
    porcentaje: i === 0 ? igual + resto : igual,
  }));
  const existente = material.distribucionesUnidad?.length
    ? unidades.map((u) => {
        const d = material.distribucionesUnidad!.find((x) => x.unidadId === u.id);
        return { unidadId: u.id, porcentaje: d?.porcentaje ?? 0 };
      })
    : inicial;
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(existente.map((d) => [d.unidadId, d.porcentaje]))
  );
  const total = Object.values(vals).reduce((s, n) => s + (Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0), 0);
  const distribucion = unidades.map((u) => ({
    unidadId: u.id,
    porcentaje: Math.max(0, Math.min(100, Math.round(vals[u.id] ?? 0))),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Math.abs(total - 100) <= 0.5) {
      onGuardar(distribucion);
    } else {
      alert(`Los porcentajes deben sumar 100 (actual: ${total})`);
    }
  };

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-4"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 font-bold">Distribuir por unidad</h3>
        <p className="mb-3 text-xs" style={{ color: "var(--text3)" }}>
          {material.material.nombre} — {material.cantidadRequerida} {material.material.unidad}. Los porcentajes deben sumar 100.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {unidades.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <label className="min-w-[60px] text-xs" style={{ color: "var(--text2)" }}>
                {u.etiqueta}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={vals[u.id] ?? 0}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setVals((prev) => ({ ...prev, [u.id]: v }));
                }}
                className="w-20 rounded border px-2 py-1 text-sm"
                style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
              />
              <span className="text-xs" style={{ color: "var(--text3)" }}>%</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs" style={{ color: total === 100 ? "var(--green)" : "var(--red)" }}>
            <span>Total: {total}%</span>
            {total !== 100 && <span>Debe sumar 100</span>}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || Math.abs(total - 100) > 0.5}
              className="rounded px-3 py-1.5 text-sm font-semibold text-black"
              style={{ background: "var(--accent)" }}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgregarMaterialForm({
  materiales,
  materialesEnFase,
  onAdd,
  onCancel,
  loading,
}: {
  materiales: Material[];
  materialesEnFase: string[];
  onAdd: (materialId: string, cantidad: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [materialId, setMaterialId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const disponibles = materiales.filter((m) => !materialesEnFase.includes(m.id));
  const materialSeleccionado = materiales.find((m) => m.id === materialId);
  const stockMax = materialSeleccionado?.stockTotal ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (materialId && cantidad > 0) onAdd(materialId, cantidad);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs" style={{ color: "var(--text3)" }}>Material</label>
        <select
          value={materialId}
          onChange={(e) => {
            const id = e.target.value;
            setMaterialId(id);
            const m = materiales.find((x) => x.id === id);
            if (m && cantidad > m.stockTotal) setCantidad(Math.max(1, m.stockTotal));
          }}
          required
          className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        >
          <option value="">— Seleccionar —</option>
          {disponibles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} (stock: {m.stockTotal} {m.unidad})
            </option>
          ))}
          {disponibles.length === 0 && (
            <option value="" disabled>No hay materiales disponibles</option>
          )}
        </select>
      </div>
      <div>
        <label className="block text-xs" style={{ color: "var(--text3)" }}>
          Cantidad {materialSeleccionado && `(máx. ${stockMax} ${materialSeleccionado.unidad})`}
        </label>
        <input
          type="number"
          min="1"
          max={stockMax || undefined}
          value={cantidad}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 1;
            setCantidad(Math.max(1, stockMax > 0 ? Math.min(stockMax, v) : v));
          }}
          className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !materialId}
          className="rounded px-3 py-1.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent)" }}
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-3 py-1.5 text-sm"
          style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AgregarServicioForm({
  servicios,
  serviciosEnFase,
  onAdd,
  onCancel,
  loading,
}: {
  servicios: { id: string; nombre: string; unidad: string; costoUnitario: number }[];
  serviciosEnFase: string[];
  onAdd: (servicioId: string, cantidad: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [servicioId, setServicioId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const disponibles = servicios.filter((s) => !serviciosEnFase.includes(s.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (servicioId && cantidad > 0) onAdd(servicioId, cantidad);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs" style={{ color: "var(--text3)" }}>Servicio</label>
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          required
          className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        >
          <option value="">— Seleccionar —</option>
          {disponibles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} (Q{s.costoUnitario}/{s.unidad})
            </option>
          ))}
          {disponibles.length === 0 && (
            <option value="" disabled>No hay servicios disponibles. Agrega en Costos varios.</option>
          )}
        </select>
      </div>
      <div>
        <label className="block text-xs" style={{ color: "var(--text3)" }}>Cantidad</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
          className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
          style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !servicioId}
          className="rounded px-3 py-1.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent)" }}
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-3 py-1.5 text-sm"
          style={{ borderColor: "var(--border2)", color: "var(--text2)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
