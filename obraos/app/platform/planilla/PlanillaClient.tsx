"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Proyecto = { id: string; nombre: string };
type PlanillaRegistro = {
  id: string;
  nombrePersona: string;
  tarifaDia: number;
  diasTrabajados: number;
  horasExtras: number;
  tarifaHoraExtra: number | null;
  total: number;
};
type PlanillaAsignacion = {
  id: string;
  faseId: string;
  fase: { id: string; nombre: string };
  monto: number;
};
type Planilla = {
  id: string;
  nombre: string;
  periodo: string | null;
  fechaPago: string | null;
  estado: string;
  registros: PlanillaRegistro[];
  asignaciones: PlanillaAsignacion[];
};

export function PlanillaClient({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter();
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id ?? "");
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [fechaInicioNueva, setFechaInicioNueva] = useState("");
  const [fechaFinNueva, setFechaFinNueva] = useState("");
  const [faseId, setFaseId] = useState("");
  const [fases, setFases] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (!proyectoId) return;
    setLoading(true);
    fetch(`/api/planillas?proyectoId=${proyectoId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setPlanillas)
      .finally(() => setLoading(false));
  }, [proyectoId]);

  useEffect(() => {
    if (!proyectoId) return;
    fetch(`/api/proyectos/${proyectoId}/fases`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFases)
      .catch(() => setFases([]));
  }, [proyectoId]);

  const crearPlanilla = async () => {
    if (!nombreNueva.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/planillas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId,
          nombre: nombreNueva.trim(),
          fechaInicio: fechaInicioNueva || null,
          fechaFin: fechaFinNueva || null,
        }),
      });
      if (res.ok) {
        setShowNueva(false);
        setNombreNueva("");
        setFechaInicioNueva("");
        setFechaFinNueva("");
        router.refresh();
        if (proyectoId)
          fetch(`/api/planillas?proyectoId=${proyectoId}`)
            .then((r) => (r.ok ? r.json() : []))
            .then(setPlanillas);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error al crear planilla");
      }
    } finally {
      setLoading(false);
    }
  };

  if (proyectos.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed p-12 text-center"
        style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
      >
        No hay proyectos. Crea uno primero.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] font-medium uppercase" style={{ color: "var(--text3)" }}>
            Proyecto
          </label>
          <select
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            className="mt-1 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--border2)",
              color: "var(--text)",
            }}
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowNueva(true)}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent)" }}
        >
          + Nueva planilla
        </button>
      </div>

      {showNueva && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
        >
          <h3 className="mb-3 font-bold">Nueva planilla</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Nombre</label>
              <input
                value={nombreNueva}
                onChange={(e) => setNombreNueva(e.target.value)}
                placeholder="Ej. Soldadores Semana 12"
                className="mt-1 w-64 rounded border px-2 py-1.5 text-sm"
                style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Período</label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={fechaInicioNueva}
                  onChange={(e) => setFechaInicioNueva(e.target.value)}
                  className="rounded border px-2 py-1.5 text-sm"
                  style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                />
                <span style={{ color: "var(--text3)" }}>a</span>
                <input
                  type="date"
                  value={fechaFinNueva}
                  onChange={(e) => setFechaFinNueva(e.target.value)}
                  min={fechaInicioNueva || undefined}
                  className="rounded border px-2 py-1.5 text-sm"
                  style={{ background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" }}
                />
                {fechaInicioNueva && fechaFinNueva && (
                  <span className="rounded px-2 py-1 text-xs font-medium" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                    {Math.max(0, Math.ceil((new Date(fechaFinNueva).getTime() - new Date(fechaInicioNueva).getTime()) / (1000 * 60 * 60 * 24)) + 1)} días
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={crearPlanilla}
                disabled={loading}
                className="rounded px-4 py-2 text-sm font-semibold text-black"
                style={{ background: "var(--accent)" }}
              >
                Crear
              </button>
              <button
                onClick={() => { setShowNueva(false); setNombreNueva(""); setFechaInicioNueva(""); setFechaFinNueva(""); }}
                className="rounded border px-4 py-2 text-sm"
                style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && planillas.length === 0 ? (
        <p style={{ color: "var(--text3)" }}>Cargando…</p>
      ) : (
        <div className="space-y-4">
          {planillas.map((p) => {
            const total = p.registros.reduce((s, r) => s + r.total, 0);
            return (
              <PlanillaCard
                key={p.id}
                planilla={p}
                total={total}
                fases={fases}
                proyectoId={proyectoId}
                onRefresh={() => {
                  if (proyectoId)
                    fetch(`/api/planillas?proyectoId=${proyectoId}`)
                      .then((r) => (r.ok ? r.json() : []))
                      .then(setPlanillas);
                  router.refresh();
                }}
              />
            );
          })}
        </div>
      )}

      {!loading && planillas.length === 0 && !showNueva && (
        <div
          className="rounded-xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          No hay planillas para este proyecto. Crea una nueva.
        </div>
      )}
    </div>
  );
}

function PlanillaCard({
  planilla,
  total,
  fases,
  proyectoId,
  onRefresh,
}: {
  planilla: Planilla;
  total: number;
  fases: { id: string; nombre: string }[];
  proyectoId: string;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [showAgregar, setShowAgregar] = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  const [faseId, setFaseId] = useState("");
  const [monto, setMonto] = useState(total);
  const [loading, setLoading] = useState(false);

  const agregarRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombrePersona = fd.get("nombrePersona") as string;
    const tarifaDia = parseFloat(fd.get("tarifaDia") as string) || 0;
    const diasTrabajados = parseInt(fd.get("diasTrabajados") as string) || 0;
    const horasExtras = parseInt(fd.get("horasExtras") as string) || 0;
    const tarifaHoraExtraRaw = fd.get("tarifaHoraExtra") as string;
    const tarifaHoraExtra = tarifaHoraExtraRaw ? parseFloat(tarifaHoraExtraRaw) : null;

    if (!nombrePersona?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/planillas/${planilla.id}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombrePersona: nombrePersona.trim(),
          tarifaDia,
          diasTrabajados,
          horasExtras,
          tarifaHoraExtra,
        }),
      });
      if (res.ok) {
        setShowAgregar(false);
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const asignarFase = async () => {
    if (!faseId || monto <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/planillas/${planilla.id}/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faseId, monto }),
      });
      if (res.ok) {
        setShowAsignar(false);
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const quitarAsignacion = async (asignacionId: string) => {
    if (!confirm("¿Quitar esta asignación de la fase?")) return;
    const res = await fetch(`/api/planillas/asignaciones/${asignacionId}`, {
      method: "DELETE",
    });
    if (res.ok) onRefresh();
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold">{planilla.nombre}</h3>
          {planilla.periodo && (
            <span className="text-xs" style={{ color: "var(--text3)" }}>{planilla.periodo}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold">Q{Math.round(total).toLocaleString()}</span>
          <button
            onClick={() => setShowAgregar(true)}
            className="rounded border px-2 py-1 text-xs"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            + Persona
          </button>
          <button
            onClick={() => { setShowAsignar(true); setMonto(total); setFaseId(fases[0]?.id ?? ""); }}
            disabled={planilla.registros.length === 0}
            className="rounded px-2 py-1 text-xs font-semibold text-black"
            style={{ background: "var(--accent)" }}
          >
            Registrar en fase
          </button>
        </div>
      </div>

      {planilla.registros.length > 0 && (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                <th className="py-2 text-left" style={{ color: "var(--text3)" }}>Persona</th>
                <th className="py-2 text-left" style={{ color: "var(--text3)" }}>Tarifa/día</th>
                <th className="py-2 text-left" style={{ color: "var(--text3)" }}>Días</th>
                <th className="py-2 text-left" style={{ color: "var(--text3)" }}>H.extras</th>
                <th className="py-2 text-right" style={{ color: "var(--text3)" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {planilla.registros.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border2)" }}>
                  <td className="py-2">{r.nombrePersona}</td>
                  <td className="py-2">Q{r.tarifaDia}</td>
                  <td className="py-2">{r.diasTrabajados}</td>
                  <td className="py-2">{r.horasExtras}</td>
                  <td className="py-2 text-right font-mono">Q{Math.round(r.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {planilla.asignaciones.length > 0 && (
        <div className="rounded border p-2" style={{ borderColor: "var(--border2)", background: "var(--bg3)" }}>
          <span className="text-[10px] font-medium uppercase" style={{ color: "var(--text3)" }}>Asignado a fases:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {planilla.asignaciones.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
                style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
              >
                {a.fase.nombre}: Q{Math.round(a.monto).toLocaleString()}
                <button
                  onClick={() => quitarAsignacion(a.id)}
                  className="ml-0.5 hover:opacity-70"
                  style={{ color: "var(--red)" }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {showAgregar && (
        <form onSubmit={agregarRegistro} className="mt-3 flex flex-wrap gap-3 rounded border p-3" style={{ borderColor: "var(--border2)" }}>
          <input name="nombrePersona" placeholder="Nombre" required className="w-36 rounded border px-2 py-1 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }} />
          <input name="tarifaDia" type="number" step="0.01" placeholder="Q/día" required className="w-20 rounded border px-2 py-1 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }} />
          <input name="diasTrabajados" type="number" min="0" placeholder="Días" required className="w-16 rounded border px-2 py-1 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }} />
          <input name="horasExtras" type="number" min="0" placeholder="H.extras" defaultValue={0} className="w-20 rounded border px-2 py-1 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }} />
          <input name="tarifaHoraExtra" type="number" step="0.01" placeholder="Q/h extra (opc)" className="w-24 rounded border px-2 py-1 text-sm" style={{ background: "var(--bg3)", borderColor: "var(--border2)" }} />
          <button type="submit" disabled={loading} className="rounded px-3 py-1 text-sm font-semibold text-black" style={{ background: "var(--accent)" }}>Agregar</button>
          <button type="button" onClick={() => setShowAgregar(false)} className="rounded px-3 py-1 text-sm" style={{ color: "var(--text3)" }}>Cancelar</button>
        </form>
      )}

      {showAsignar && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded border p-3" style={{ borderColor: "var(--border2)" }}>
          <div>
            <label className="block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Fase</label>
            <select
              value={faseId}
              onChange={(e) => setFaseId(e.target.value)}
              className="mt-1 rounded border px-2 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border2)" }}
            >
              {fases.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Monto (Q)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              className="mt-1 w-28 rounded border px-2 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border2)" }}
            />
          </div>
          <button onClick={asignarFase} disabled={loading} className="rounded px-4 py-2 text-sm font-semibold text-black" style={{ background: "var(--accent)" }}>Asignar</button>
          <button onClick={() => setShowAsignar(false)} className="rounded px-4 py-2 text-sm" style={{ color: "var(--text3)" }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
