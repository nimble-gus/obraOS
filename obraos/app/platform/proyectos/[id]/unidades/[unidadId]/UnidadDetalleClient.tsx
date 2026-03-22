"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MaterialAsignado = {
  id: string;
  cantidad: number;
  monto: number;
  lote?: { catalogoMaterial: { nombre: string; unidad: string } };
  catalogoMaterial?: { nombre: string; unidad: string };
};
type PlanillaRegistroAsignado = {
  id: string;
  cantidad: number;
  monto: number;
  planillaRegistro: {
    nombre: string;
    unidad: string;
    tarifa: number;
    planilla: { nombre: string };
  };
};
type PlanillaBloqueAsignado = {
  id: string;
  cantidad: number;
  monto: number;
  unidadTipo: string;
  planilla: { nombre: string };
};
type ServicioAsignado = {
  id: string;
  cantidad: number;
  monto: number;
  servicio: { nombre: string; unidad: string };
};

type Tarea = {
  id: string;
  nombre: string;
  cantidadM2: number;
  cantidadM3: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  completada: boolean;
  materialesAsignados?: MaterialAsignado[];
  planillasRegistroAsignadas?: PlanillaRegistroAsignado[];
  planillasBloqueAsignadas?: PlanillaBloqueAsignado[];
  serviciosAsignados?: ServicioAsignado[];
};

type Fase = {
  id: string;
  nombre: string;
  orden: number;
  status: string;
  pctAvance: number;
  tareas: Tarea[];
};

type Unidad = {
  id: string;
  etiqueta: string;
  numero: number;
  pctAvanceGlobal: number;
  fechaEntregaEstimada: string | null;
};

type MaterialConStock = { id: string; nombre: string; unidad: string; costoUnitario: number; stockTotal: number };
type PlanillaConRegistros = {
  id: string;
  nombre: string;
  registros: { id: string; nombre: string; unidad: string; tarifa: number }[];
};
type Servicio = { id: string; nombre: string; unidad: string; costoUnitario: number };

function FaseIcon({ nombre }: { nombre: string }) {
  const key = nombre.toLowerCase();
  const c = "h-5 w-5 shrink-0";
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (key.includes("movimiento") || key.includes("tierra")) {
    return (
      <svg className={c} viewBox="0 0 24 24" {...p}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }
  if (key.includes("cimentación") || key.includes("cimentacion")) {
    return (
      <svg className={c} viewBox="0 0 24 24" {...p}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (key.includes("muro") || key.includes("levantamiento")) {
    return (
      <svg className={c} viewBox="0 0 24 24" {...p}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 22V12h6v10" />
      </svg>
    );
  }
  if (key.includes("acabado")) {
    return (
      <svg className={c} viewBox="0 0 24 24" {...p}>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
      </svg>
    );
  }
  return (
    <svg className={c} viewBox="0 0 24 24" {...p}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function PanelMateriales({
  materiales,
  asignados,
  onAgregar,
  onEliminar,
}: {
  materiales: MaterialConStock[];
  asignados: MaterialAsignado[];
  onAgregar: (catalogoMaterialId: string, cantidad: number) => void;
  onEliminar: (id: string) => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(cantidad);
    if (!materialId || isNaN(q) || q <= 0) return;
    setLoading(true);
    onAgregar(materialId, q);
    setCantidad("");
    setMaterialId("");
    setLoading(false);
  };

  const getNombre = (a: MaterialAsignado) => a.catalogoMaterial?.nombre ?? a.lote?.catalogoMaterial.nombre ?? "—";
  const getUnidad = (a: MaterialAsignado) => a.catalogoMaterial?.unidad ?? a.lote?.catalogoMaterial.unidad ?? "";

  return (
    <div className="space-y-3">
      {materiales.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text3)" }}>
          No hay materiales con stock en{" "}
          <a href="/platform/materiales" className="underline" style={{ color: "var(--accent)" }}>Materiales</a>.
          Agrega stock allí (botón + Stock).
        </p>
      ) : (
      <form onSubmit={handle} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Material</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">Seleccionar…</option>
            {materiales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} · {m.stockTotal} {m.unidad} disponibles @ Q{m.costoUnitario}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Cant.</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="0"
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
        <button type="submit" disabled={loading || !materialId || !cantidad} className="rounded px-3 py-1.5 text-xs font-medium" style={{ background: "var(--accent)", color: "#000" }}>
          Agregar
        </button>
      </form>
      )}
      {asignados.length > 0 && (
        <div className="space-y-1 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-[10px] uppercase" style={{ color: "var(--text3)" }}>Asignados a esta tarea</span>
          {asignados.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--text2)" }}>
              <span className="flex-1">{getNombre(a)} · {a.cantidad} {getUnidad(a)}</span>
              <span className="font-mono">Q{a.monto.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => onEliminar(a.id)}
                className="rounded p-0.5 transition hover:opacity-80"
                style={{ color: "var(--red)" }}
                title="Eliminar"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const UNIDAD_LABEL: Record<string, string> = { DIA: "día", M2: "m²", M3: "m³" };

function PanelPlanilla({
  planillas,
  tarea,
  asignadosBloque,
  asignadosRegistro,
  onAgregarBloque,
  onEliminarBloque,
  onEliminarRegistro,
}: {
  planillas: PlanillaConRegistros[];
  tarea: { cantidadM2: number; cantidadM3: number };
  asignadosBloque: PlanillaBloqueAsignado[];
  asignadosRegistro: PlanillaRegistroAsignado[];
  onAgregarBloque: (planillaId: string, unidad: string, cantidad: number) => void;
  onEliminarBloque: (id: string) => void;
  onEliminarRegistro: (id: string) => void;
}) {
  const [bloqueId, setBloqueId] = useState("");
  const [unidad, setUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");

  const bloqueSeleccionado = planillas.find((p) => p.id === bloqueId);
  const tieneM2 = tarea.cantidadM2 > 0;
  const tieneM3 = tarea.cantidadM3 > 0;

  const unidadesOpciones = [
    ...(tieneM2 ? [{ value: "M2", label: `m² (máx. ${tarea.cantidadM2})` }] : []),
    ...(tieneM3 ? [{ value: "M3", label: `m³ (máx. ${tarea.cantidadM3})` }] : []),
    { value: "DIA", label: "día" },
  ];

  const cantidadMax = unidad === "M2" ? tarea.cantidadM2 : unidad === "M3" ? tarea.cantidadM3 : undefined;
  const cantidadNum = parseFloat(cantidad);
  const cantidadValida = cantidadMax != null ? !isNaN(cantidadNum) && cantidadNum > 0 && cantidadNum <= cantidadMax : !isNaN(cantidadNum) && cantidadNum > 0;

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloqueId || !unidad || !cantidadValida) return;
    const q = parseFloat(cantidad);
    if (cantidadMax != null && q > cantidadMax) return;
    onAgregarBloque(bloqueId, unidad, q);
    setCantidad("");
  };

  return (
    <div className="space-y-3">
      {planillas.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text3)" }}>
          No hay bloques de planilla. Crea uno en{" "}
          <a href="/platform/planilla" className="underline" style={{ color: "var(--accent)" }}>Planilla</a> (selecciona el proyecto y agrega registros).
        </p>
      ) : unidadesOpciones.length === 0 && !tieneM2 && !tieneM3 ? (
        <p className="text-xs" style={{ color: "var(--text3)" }}>
          Esta tarea no tiene m² ni m³ definidos. Edita la tarea y asigna cantidad en m² o m³ para poder asignar planilla.
        </p>
      ) : (
      <form onSubmit={handle} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px]">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Bloque</label>
          <select
            value={bloqueId}
            onChange={(e) => { setBloqueId(e.target.value); setUnidad(""); setCantidad(""); }}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">Seleccionar bloque…</option>
            {planillas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.registros.length > 0 && `(${p.registros.length})`}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Unidad</label>
          <select
            value={unidad}
            onChange={(e) => { setUnidad(e.target.value); setCantidad(""); }}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">Unidad…</option>
            {unidadesOpciones.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Cant.</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={cantidadMax}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder={cantidadMax != null ? String(cantidadMax) : "0"}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
        <button type="submit" disabled={!bloqueId || !unidad || !cantidadValida} className="rounded px-3 py-1.5 text-xs font-medium" style={{ background: "var(--accent)", color: "#000" }}>
          Agregar
        </button>
      </form>
      )}
      <p className="text-[10px]" style={{ color: "var(--text3)" }}>
        Se suma la tarifa de todos los registros del bloque en la unidad elegida y se multiplica por la cantidad.
      </p>
      {(asignadosBloque.length > 0 || asignadosRegistro.length > 0) && (
        <div className="space-y-1 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-[10px] uppercase" style={{ color: "var(--text3)" }}>Asignados a esta tarea</span>
          {asignadosBloque.map((a) => (
            <div key={`b-${a.id}`} className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--text2)" }}>
              <span className="flex-1">{a.planilla.nombre} · {a.cantidad} {UNIDAD_LABEL[a.unidadTipo] ?? a.unidadTipo}</span>
              <span className="font-mono">Q{a.monto.toFixed(2)}</span>
              <button type="button" onClick={() => onEliminarBloque(a.id)} className="rounded p-0.5 transition hover:opacity-80" style={{ color: "var(--red)" }} title="Eliminar">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {asignadosRegistro.map((a) => (
            <div key={`r-${a.id}`} className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--text2)" }}>
              <span className="flex-1">{a.planillaRegistro.nombre} · {a.cantidad} {UNIDAD_LABEL[a.planillaRegistro.unidad] ?? a.planillaRegistro.unidad}</span>
              <span className="font-mono">Q{a.monto.toFixed(2)}</span>
              <button type="button" onClick={() => onEliminarRegistro(a.id)} className="rounded p-0.5 transition hover:opacity-80" style={{ color: "var(--red)" }} title="Eliminar">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelServicios({
  servicios,
  asignados,
  onAgregar,
  onEliminar,
}: {
  servicios: Servicio[];
  asignados: ServicioAsignado[];
  onAgregar: (servicioId: string, cantidad: number) => void;
  onEliminar: (id: string) => void;
}) {
  const [servicioId, setServicioId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(cantidad);
    if (!servicioId || isNaN(q) || q <= 0) return;
    onAgregar(servicioId, q);
    setCantidad("");
    setServicioId("");
  };
  return (
    <div className="space-y-3">
      {servicios.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text3)" }}>
          No hay servicios (costos varios) en el catálogo. Regístralos en{" "}
          <a href="/platform/servicios" className="underline" style={{ color: "var(--accent)" }}>Costos varios</a> o en Admin.
        </p>
      ) : (
      <form onSubmit={handle} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Servicio</label>
          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="">Seleccionar…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} · Q{s.costoUnitario}/{s.unidad}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Cant.</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="0"
            className="w-full rounded border px-2 py-1.5 text-sm"
            style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
        <button type="submit" disabled={!servicioId || !cantidad} className="rounded px-3 py-1.5 text-xs font-medium" style={{ background: "var(--accent)", color: "#000" }}>
          Agregar
        </button>
      </form>
      )}
      {asignados.length > 0 && (
        <div className="space-y-1 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          {asignados.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 text-xs" style={{ color: "var(--text2)" }}>
              <span className="flex-1">{a.servicio.nombre} · {a.cantidad} {a.servicio.unidad}</span>
              <span className="font-mono">Q{a.monto.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => onEliminar(a.id)}
                className="rounded p-0.5 transition hover:opacity-80"
                style={{ color: "var(--red)" }}
                title="Eliminar"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarraBloques({ pct, completa }: { pct: number; completa?: boolean }) {
  const segmentos = 10;
  const llenos = Math.round((pct / 100) * segmentos);
  const color = completa ? "var(--green)" : "var(--accent)";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: segmentos }).map((_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-sm transition-colors"
          style={{
            background: i < llenos ? color : "var(--bg3)",
          }}
        />
      ))}
    </div>
  );
}

export function UnidadDetalleClient({
  proyectoId,
  unidad,
  fases,
  materialesConStock,
  planillasConRegistros,
  servicios,
}: {
  proyectoId: string;
  unidad: Unidad;
  fases: Fase[];
  materialesConStock: MaterialConStock[];
  planillasConRegistros: PlanillaConRegistros[];
  servicios: Servicio[];
}) {
  const router = useRouter();
  const [faseSeleccionada, setFaseSeleccionada] = useState<string | null>(fases[0]?.id ?? null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<string | null>(null);
  const [editandoTarea, setEditandoTarea] = useState<string | null>(null);
  const [rubroActivo, setRubroActivo] = useState<"materiales" | "planilla" | "servicios">("materiales");

  const toggleTarea = async (tareaId: string) => {
    const res = await fetch(`/api/tareas/${tareaId}/completar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unidadId: unidad.id }),
    });
    if (res.ok) router.refresh();
    else alert("Error al marcar tarea");
  };

  const actualizarTarea = async (
    tareaId: string,
    datos: { nombre?: string; fechaInicio?: string; fechaFin?: string; cantidadM2?: number; cantidadM3?: number }
  ) => {
    const res = await fetch(`/api/tareas/${tareaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (res.ok) {
      setEditandoTarea(null);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al actualizar");
    }
  };

  const actualizarFechaEntrega = async (fecha: string) => {
    const res = await fetch(`/api/unidades/${unidad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechaEntregaEstimada: fecha || null,
      }),
    });
    if (res.ok) router.refresh();
    else alert("Error al actualizar fecha");
  };

  const faseCompleta = (f: Fase) =>
    f.tareas.length > 0 && f.tareas.every((t) => t.completada);
  const colorBarra =
    unidad.pctAvanceGlobal >= 100
      ? "var(--green)"
      : unidad.pctAvanceGlobal >= 50
        ? "var(--accent)"
        : "var(--blue)";
  const faseActiva = fases.find((f) => f.id === faseSeleccionada);
  const tareaActiva = faseActiva?.tareas.find((t) => t.id === tareaSeleccionada);

  const eliminarRecurso = async (tipo: "material" | "planilla" | "servicio", asignacionId: string) => {
    const base = tipo === "material" ? "/api/materiales-asignados" : tipo === "planilla" ? "/api/planilla-registro-asignado-tarea" : "/api/servicio-asignado-tarea";
    const res = await fetch(`${base}/${asignacionId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al eliminar");
    }
  };

  const eliminarPlanillaBloque = async (asignacionId: string) => {
    const res = await fetch(`/api/planilla-asignada-tarea/${asignacionId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al eliminar");
    }
  };

  const agregarRecurso = async (tipo: "material" | "planilla" | "servicio", payload: Record<string, unknown>) => {
    if (!tareaSeleccionada) return;
    const res = await fetch(`/api/tareas/${tareaSeleccionada}/recursos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, unidadId: unidad.id, ...payload }),
    });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al asignar recurso");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            {unidad.etiqueta}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            Bloque {unidad.numero} · Fecha entrega:{" "}
            <input
              type="date"
              defaultValue={unidad.fechaEntregaEstimada ?? ""}
              onBlur={(e) => actualizarFechaEntrega(e.target.value)}
              className="inline rounded border px-2 py-1 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </p>
        </div>
      </div>

      {/* Avance global */}
      <div
        className="rounded-lg border p-3"
        style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text3)" }}>
            Avance de construcción
          </span>
          <span className="font-mono font-bold" style={{ color: colorBarra }}>
            {unidad.pctAvanceGlobal}%
          </span>
        </div>
        <BarraBloques pct={unidad.pctAvanceGlobal} completa={unidad.pctAvanceGlobal >= 100} />
      </div>

      {/* Layout 3 columnas: Fases | Tareas | Gestión de Recursos */}
      <div className="grid min-h-[400px] gap-4 lg:grid-cols-3">
        {/* Mitad izquierda: lista de fases */}
        <div
          className="flex flex-col overflow-auto rounded-lg"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
        >
          <div className="border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
              Fases
            </h2>
          </div>
          <div className="flex-1 space-y-2 overflow-auto p-3">
            {fases.map((fase) => {
              const completa = faseCompleta(fase);
              const seleccionada = faseSeleccionada === fase.id;
              const primeraTarea = fase.tareas[0];
              return (
                <button
                  key={fase.id}
                  type="button"
                  onClick={() => setFaseSeleccionada(fase.id)}
                  className="w-full rounded-lg border px-4 py-3 text-left transition"
                  style={{
                    background: seleccionada ? "var(--accent)" : completa ? "rgba(34,197,94,0.06)" : "var(--bg)",
                    borderColor: seleccionada ? "var(--accent)" : completa ? "rgba(34,197,94,0.3)" : "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: seleccionada ? "#000" : "var(--text2)" }}>
                      <FaseIcon nombre={fase.nombre} />
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: seleccionada ? "#000" : "var(--text)" }}
                    >
                      {fase.nombre}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <BarraBloques pct={fase.pctAvance} completa={completa} />
                    <span
                      className="ml-2 font-mono text-xs font-bold"
                      style={{ color: seleccionada ? "#000" : completa ? "var(--green)" : "var(--text2)" }}
                    >
                      {fase.pctAvance}%
                    </span>
                  </div>
                  {primeraTarea && (
                    <div className="mt-1.5 flex items-center justify-between text-xs" style={{ color: seleccionada ? "rgba(0,0,0,0.65)" : "var(--text3)" }}>
                      <span>{primeraTarea.nombre}</span>
                      <span>
                        {primeraTarea.cantidadM2 > 0 && `${primeraTarea.cantidadM2} m²`}
                        {primeraTarea.cantidadM2 > 0 && primeraTarea.cantidadM3 > 0 && " · "}
                        {primeraTarea.cantidadM3 > 0 && `${primeraTarea.cantidadM3} m³`}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mitad derecha: tareas de la fase seleccionada */}
        <div
          className="flex flex-col overflow-auto rounded-lg"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
        >
          <div className="border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
              {faseActiva ? `Tareas: ${faseActiva.nombre}` : "Selecciona una fase"}
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {!faseActiva ? (
              <p className="text-center text-sm" style={{ color: "var(--text3)" }}>
                Haz clic en una fase para ver sus tareas
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {faseActiva.tareas.map((t) => {
                  const seleccionada = tareaSeleccionada === t.id;
                  return (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      setTareaSeleccionada(seleccionada ? null : t.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!(e.target as HTMLElement).closest("button")) setTareaSeleccionada(seleccionada ? null : t.id);
                      }
                    }}
                    className="flex cursor-pointer flex-col rounded-lg border p-3 transition"
                    style={{
                      background: seleccionada ? "var(--accent)" : t.completada ? "rgba(34,197,94,0.06)" : "var(--bg)",
                      borderColor: seleccionada ? "var(--accent)" : t.completada ? "rgba(34,197,94,0.4)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTarea(t.id)}
                        className={`flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition ${
                          t.completada ? "justify-end" : "justify-start"
                        }`}
                        style={{
                          borderColor: t.completada ? "var(--green)" : "var(--border)",
                          background: t.completada ? "var(--green)" : "var(--bg3)",
                          padding: "2px",
                        }}
                      >
                        <span className="block h-4 w-4 shrink-0 rounded-full bg-white shadow" />
                      </button>
                      <span
                        className={`flex-1 truncate font-medium ${t.completada ? "line-through opacity-70" : ""}`}
                        style={{ color: seleccionada ? "#000" : "var(--text)" }}
                        title={t.nombre}
                      >
                        {t.nombre}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditandoTarea(editandoTarea === t.id ? null : t.id)}
                        className="shrink-0 text-xs font-medium"
                        style={{ color: "var(--accent)" }}
                      >
                        {editandoTarea === t.id ? "Cerrar" : "Editar"}
                      </button>
                    </div>
                    <div className="mt-2 text-xs" style={{ color: seleccionada ? "rgba(0,0,0,0.7)" : "var(--text3)" }}>
                      {t.cantidadM2 > 0 && `${t.cantidadM2} m²`}
                      {t.cantidadM2 > 0 && t.cantidadM3 > 0 && " · "}
                      {t.cantidadM3 > 0 && `${t.cantidadM3} m³`}
                    </div>
                    {editandoTarea === t.id ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                        <input
                          defaultValue={t.nombre}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              actualizarTarea(t.id, { nombre: (e.target as HTMLInputElement).value });
                            }
                            if (e.key === "Escape") setEditandoTarea(null);
                          }}
                          onBlur={(e) => {
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v && v !== t.nombre) actualizarTarea(t.id, { nombre: v });
                            else setEditandoTarea(null);
                          }}
                          className="min-w-[120px] rounded border px-2 py-1 text-sm"
                          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                          autoFocus
                        />
                        <input
                          type="date"
                          defaultValue={t.fechaInicio ?? ""}
                          onBlur={(e) =>
                            actualizarTarea(t.id, {
                              fechaInicio: e.target.value || undefined,
                            })
                          }
                          className="rounded border px-2 py-1 text-xs"
                          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                        />
                        <input
                          type="date"
                          defaultValue={t.fechaFin ?? ""}
                          onBlur={(e) =>
                            actualizarTarea(t.id, {
                              fechaFin: e.target.value || undefined,
                            })
                          }
                          className="rounded border px-2 py-1 text-xs"
                          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                        />
                        <input
                          type="number"
                          defaultValue={t.cantidadM2 || ""}
                          placeholder="m²"
                          className="w-16 rounded border px-2 py-1 text-xs"
                          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                          onBlur={(e) =>
                            actualizarTarea(t.id, {
                              cantidadM2: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <input
                          type="number"
                          defaultValue={t.cantidadM3 || ""}
                          placeholder="m³"
                          className="w-16 rounded border px-2 py-1 text-xs"
                          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                          onBlur={(e) =>
                            actualizarTarea(t.id, {
                              cantidadM3: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setEditandoTarea(null)}
                          className="text-xs"
                          style={{ color: "var(--text3)" }}
                        >
                          Listo
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tercera columna: Gestión de Recursos */}
        <div
          className="flex flex-col overflow-auto rounded-lg"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
        >
          <div className="border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
              Gestión de Recursos
            </h2>
            {tareaActiva && (
              <p className="mt-1 text-xs" style={{ color: "var(--text2)" }}>
                Tarea: {tareaActiva.nombre}
              </p>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {!tareaSeleccionada ? (
              <p className="text-sm" style={{ color: "var(--text3)" }}>
                Haz clic en una tarea del panel central para asignar recursos por rubro: materiales, planilla y otros gastos.
              </p>
            ) : (
              <>
                <div className="mb-3 flex gap-1 rounded-lg p-0.5" style={{ background: "var(--bg3)" }}>
                  {(["materiales", "planilla", "servicios"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRubroActivo(r)}
                      className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition"
                      style={{
                        background: rubroActivo === r ? "var(--bg)" : "transparent",
                        color: rubroActivo === r ? "var(--text)" : "var(--text3)",
                      }}
                    >
                      {r === "materiales" ? "Materiales" : r === "planilla" ? "Planilla" : "Otros gastos"}
                    </button>
                  ))}
                </div>

                {rubroActivo === "materiales" && (
                  <PanelMateriales
                    materiales={materialesConStock}
                    asignados={tareaActiva?.materialesAsignados ?? []}
                    onAgregar={(catalogoMaterialId, cantidad) => agregarRecurso("material", { catalogoMaterialId, cantidad })}
                    onEliminar={(id) => eliminarRecurso("material", id)}
                  />
                )}
                {rubroActivo === "planilla" && tareaActiva && (
                  <PanelPlanilla
                    planillas={planillasConRegistros}
                    tarea={{ cantidadM2: tareaActiva.cantidadM2, cantidadM3: tareaActiva.cantidadM3 }}
                    asignadosBloque={tareaActiva?.planillasBloqueAsignadas ?? []}
                    asignadosRegistro={tareaActiva?.planillasRegistroAsignadas ?? []}
                    onAgregarBloque={(planillaId, unidad, cantidad) => agregarRecurso("planilla", { planillaId, unidad, cantidad })}
                    onEliminarBloque={eliminarPlanillaBloque}
                    onEliminarRegistro={(id) => eliminarRecurso("planilla", id)}
                  />
                )}
                {rubroActivo === "servicios" && (
                  <PanelServicios
                    servicios={servicios}
                    asignados={tareaActiva?.serviciosAsignados ?? []}
                    onAgregar={(servicioId, cantidad) => agregarRecurso("servicio", { servicioId, cantidad })}
                    onEliminar={(id) => eliminarRecurso("servicio", id)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
