"use client";

import { useState, useEffect } from "react";

type FaseCatalog = { id: string; nombre: string; orden: number };
type FaseExistente = {
  id: string;
  nombre: string;
  orden: number;
  tareas?: {
    id: string;
    nombre: string;
    cantidadM2: number;
    cantidadM3: number;
    fechaInicio?: string | Date | null;
    fechaFin?: string | Date | null;
  }[];
};

type TareaInput = {
  id?: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadM2: number;
  cantidadM3: number;
};

type UnidadEdicion = { id: string; etiqueta: string; fechaEntregaEstimada?: string | null };

export function WizardCrearBloque({
  proyectoId,
  fasesExistentes,
  onClose,
  onSuccess,
  unidad: unidadEditar,
}: {
  proyectoId: string;
  fasesExistentes: FaseExistente[];
  onClose: () => void;
  onSuccess: () => void;
  unidad?: UnidadEdicion | null;
}) {
  const modoEdicion = !!unidadEditar;
  const [step, setStep] = useState(modoEdicion ? 2 : 1);
  const [catalogo, setCatalogo] = useState<FaseCatalog[]>([]);
  const [fasesSeleccionadas, setFasesSeleccionadas] = useState<{ id?: string; nombre: string; catalogoId?: string }[]>([]);
  const [fasesCreadas, setFasesCreadas] = useState<{ id: string; nombre: string }[]>([]);
  const [nombreCustom, setNombreCustom] = useState("");
  const [tareasPorFase, setTareasPorFase] = useState<Record<string, TareaInput[]>>(() => {
    if (!modoEdicion || !fasesExistentes.length) return {};
    const out: Record<string, TareaInput[]> = {};
    for (const f of fasesExistentes) {
      const tareas = f.tareas ?? [];
      out[f.id] = tareas.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        fechaInicio: t.fechaInicio ? String(t.fechaInicio).slice(0, 10) : "",
        fechaFin: t.fechaFin ? String(t.fechaFin).slice(0, 10) : "",
        cantidadM2: t.cantidadM2 ?? 0,
        cantidadM3: t.cantidadM3 ?? 0,
      }));
    }
    return out;
  });
  const [etiqueta, setEtiqueta] = useState(modoEdicion && unidadEditar ? unidadEditar.etiqueta : "");
  const [fechaEntrega, setFechaEntrega] = useState(
    modoEdicion && unidadEditar?.fechaEntregaEstimada
      ? String(unidadEditar.fechaEntregaEstimada).slice(0, 10)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/fases-catalogo")
      .then((r) => r.json())
      .then((data) => setCatalogo(Array.isArray(data) ? data : []))
      .catch(() => setCatalogo([]));
  }, []);

  const fasesParaTareas =
    step === 2
      ? [
          ...fasesExistentes.map((f) => ({ id: f.id, nombre: f.nombre })),
          ...fasesCreadas,
        ]
      : [];

  const addFaseFromCatalog = (c: FaseCatalog) => {
    if (fasesSeleccionadas.some((f) => f.catalogoId === c.id)) return;
    setFasesSeleccionadas((prev) => [...prev, { nombre: c.nombre, catalogoId: c.id }]);
  };

  const addFaseCustom = () => {
    if (!nombreCustom.trim()) return;
    setFasesSeleccionadas((prev) => [...prev, { nombre: nombreCustom.trim() }]);
    setNombreCustom("");
  };

  const removeFase = (idx: number) => {
    setFasesSeleccionadas((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTarea = (faseKey: string) => {
    setTareasPorFase((prev) => ({
      ...prev,
      [faseKey]: [...(prev[faseKey] ?? []), { nombre: "", fechaInicio: "", fechaFin: "", cantidadM2: 0, cantidadM3: 0 }],
    }));
  };

  const tareaToPayload = (t: TareaInput) => ({
    nombre: t.nombre.trim(),
    fechaInicio: t.fechaInicio || undefined,
    fechaFin: t.fechaFin || undefined,
    cantidadM2: t.cantidadM2 || 0,
    cantidadM3: t.cantidadM3 || 0,
  });

  const updateTarea = (faseKey: string, idx: number, field: keyof TareaInput, value: string | number) => {
    setTareasPorFase((prev) => {
      const arr = [...(prev[faseKey] ?? [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [faseKey]: arr };
    });
  };

  const removeTarea = (faseKey: string, idx: number) => {
    setTareasPorFase((prev) => ({
      ...prev,
      [faseKey]: (prev[faseKey] ?? []).filter((_, i) => i !== idx),
    }));
  };

  const ejecutar = async () => {
    setError("");
    setLoading(true);
    try {
      if (step === 1) {
        if (fasesSeleccionadas.length > 0) {
          const creadas: { id: string; nombre: string }[] = [];
          for (const f of fasesSeleccionadas) {
            const res = await fetch("/api/fases", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                proyectoId,
                nombre: f.nombre,
                catalogoFaseId: f.catalogoId || undefined,
              }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error ?? "Error al crear fase");
            }
            const creada = await res.json();
            creadas.push({ id: creada.id, nombre: creada.nombre });
          }
          setFasesCreadas(creadas);
        }
        setStep(2);
        setLoading(false);
        return;
      }

      if (step === 2) {
        const todasFases = [
          ...fasesExistentes.map((f) => ({ id: f.id, nombre: f.nombre })),
          ...fasesCreadas,
        ];
        for (const fase of todasFases) {
          const tareas = tareasPorFase[fase.id] ?? [];
          for (const t of tareas) {
            if (!t.nombre.trim()) continue;
            if (t.id) {
              const res = await fetch(`/api/tareas/${t.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tareaToPayload(t)),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Error al actualizar tarea");
              }
            } else {
              const res = await fetch("/api/tareas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  faseId: fase.id,
                  ...tareaToPayload(t),
                }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Error al crear tarea");
              }
            }
          }
        }

        if (modoEdicion && unidadEditar) {
          const resUnidad = await fetch(`/api/unidades/${unidadEditar.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              etiqueta: etiqueta.trim() || unidadEditar.etiqueta,
              fechaEntregaEstimada: fechaEntrega || null,
            }),
          });
          if (!resUnidad.ok) {
            const data = await resUnidad.json().catch(() => ({}));
            throw new Error(data.error ?? "Error al actualizar Bloque");
          }
        } else {
          const resUnidad = await fetch("/api/unidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              proyectoId,
              etiqueta: etiqueta.trim() || undefined,
            }),
          });
          if (!resUnidad.ok) {
            const data = await resUnidad.json().catch(() => ({}));
            throw new Error(data.error ?? "Error al crear Bloque");
          }
        }

        onSuccess();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const puedeAvanzarStep1 =
    fasesExistentes.length > 0 || fasesSeleccionadas.length > 0;
  const fasesParaUsar =
    step === 2
      ? [
          ...fasesExistentes.map((f) => ({ id: f.id, nombre: f.nombre })),
          ...fasesCreadas,
        ]
      : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--modal-overlay)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border p-6"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            {modoEdicion ? "Editar Bloque (unidad)" : "Crear Bloque (unidad)"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-2 transition hover:opacity-80"
            style={{ color: "var(--text3)" }}
          >
            ×
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <div
            className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold ${
              step === 1 ? "opacity-100" : "opacity-50"
            }`}
            style={{
              background: step === 1 ? "var(--accent)" : "var(--bg3)",
              color: step === 1 ? "#000" : "var(--text2)",
            }}
          >
            Paso 1: Fases
          </div>
          <div
            className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold ${
              step === 2 ? "opacity-100" : "opacity-50"
            }`}
            style={{
              background: step === 2 ? "var(--accent)" : "var(--bg3)",
              color: step === 2 ? "#000" : "var(--text2)",
            }}
          >
            Paso 2: Tareas
          </div>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border p-3 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", borderColor: "var(--red)", color: "var(--red)" }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Selecciona las fases del proyecto desde el catálogo o agrega custom.
            </p>
            <div className="flex flex-wrap gap-2">
              {catalogo.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => addFaseFromCatalog(c)}
                  disabled={fasesSeleccionadas.some((f) => f.catalogoId === c.id)}
                  className="rounded-lg border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: "var(--border)",
                    background: fasesSeleccionadas.some((f) => f.catalogoId === c.id)
                      ? "var(--bg3)"
                      : "var(--bg2)",
                    color: "var(--text)",
                  }}
                >
                  + {c.nombre}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={nombreCustom}
                onChange={(e) => setNombreCustom(e.target.value)}
                placeholder="Fase personalizada"
                className="flex-1 rounded border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg3)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                type="button"
                onClick={addFaseCustom}
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Agregar
              </button>
            </div>
            {(fasesSeleccionadas.length > 0 || fasesExistentes.length > 0) && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--text3)" }}>
                  Fases a usar
                </span>
                <ul className="space-y-1">
                  {fasesExistentes.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                      <span className="rounded bg-green/20 px-1.5 text-xs" style={{ color: "var(--green)" }}>existente</span>
                      {f.nombre}
                    </li>
                  ))}
                  {fasesSeleccionadas.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                      <button
                        type="button"
                        onClick={() => removeFase(i)}
                        className="text-xs hover:underline"
                        style={{ color: "var(--red)" }}
                      >
                        quitar
                      </button>
                      {f.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Asigna tareas a cada fase: nombre, fechas, m² y m³.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text2)" }}>
                  Etiqueta del Bloque (ej. Casa 1, Apt 2A)
                </label>
                <input
                  value={etiqueta}
                  onChange={(e) => setEtiqueta(e.target.value)}
                  placeholder="Bloque 1"
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
              {modoEdicion && (
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text2)" }}>
                    Fecha entrega estimada
                  </label>
                  <input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                    style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              )}
            </div>
            {fasesParaUsar.map((fase) => {
              const fid = (fase as { id?: string }).id ?? fase.nombre;
              const tareas = tareasPorFase[fid] ?? [];
              return (
                <div
                  key={fid}
                  className="rounded-xl border p-4"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {fase.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => addTarea(fid)}
                      className="rounded px-2 py-1 text-xs font-semibold"
                      style={{ background: "var(--accent)", color: "#000" }}
                    >
                      + Tarea
                    </button>
                  </div>
                  {tareas.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text3)" }}>
                      Sin tareas. Agrega al menos una.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tareas.map((t, ti) => (
                        <div
                          key={ti}
                          className="flex flex-nowrap items-end gap-2 rounded border p-2"
                          style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
                        >
                          <div className="min-w-0 flex-1">
                            <label className="mb-0.5 block text-[9px] font-medium uppercase" style={{ color: "var(--text3)" }}>Tarea</label>
                            <input
                              placeholder="Nombre"
                              value={t.nombre}
                              onChange={(e) => updateTarea(fid, ti, "nombre", e.target.value)}
                              className="w-full min-w-0 rounded border px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          </div>
                          <div className="w-24 shrink-0">
                            <label className="mb-0.5 block text-[9px] font-medium uppercase" style={{ color: "var(--text3)" }}>Inicio</label>
                            <input
                              type="date"
                              value={t.fechaInicio}
                              onChange={(e) => updateTarea(fid, ti, "fechaInicio", e.target.value)}
                              className="w-full rounded border px-2 py-1.5 text-xs"
                              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          </div>
                          <div className="w-24 shrink-0">
                            <label className="mb-0.5 block text-[9px] font-medium uppercase" style={{ color: "var(--text3)" }}>Fin</label>
                            <input
                              type="date"
                              value={t.fechaFin}
                              onChange={(e) => updateTarea(fid, ti, "fechaFin", e.target.value)}
                              className="w-full rounded border px-2 py-1.5 text-xs"
                              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          </div>
                          <div className="w-14 shrink-0">
                            <label className="mb-0.5 block text-[9px] font-medium uppercase" style={{ color: "var(--text3)" }}>m²</label>
                            <input
                              type="number"
                              placeholder="0"
                              min={0}
                              step={0.01}
                              value={t.cantidadM2 || ""}
                              onChange={(e) => updateTarea(fid, ti, "cantidadM2", parseFloat(e.target.value) || 0)}
                              className="w-full rounded border px-2 py-1.5 text-xs tabular-nums"
                              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          </div>
                          <div className="w-14 shrink-0">
                            <label className="mb-0.5 block text-[9px] font-medium uppercase" style={{ color: "var(--text3)" }}>m³</label>
                            <input
                              type="number"
                              placeholder="0"
                              min={0}
                              step={0.01}
                              value={t.cantidadM3 || ""}
                              onChange={(e) => updateTarea(fid, ti, "cantidadM3", parseFloat(e.target.value) || 0)}
                              className="w-full rounded border px-2 py-1.5 text-xs tabular-nums"
                              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTarea(fid, ti)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border text-sm font-bold transition hover:opacity-80"
                            style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(239,68,68,0.08)" }}
                            aria-label="Quitar tarea"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text2)" }}
              >
                Cancelar
              </button>
              <button
                onClick={ejecutar}
                disabled={!puedeAvanzarStep1 || loading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "..." : "Siguiente → Paso 2"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text2)" }}
              >
                ← Atrás
              </button>
              <button
                onClick={ejecutar}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "..." : modoEdicion ? "Guardar cambios" : "Crear Bloque"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
