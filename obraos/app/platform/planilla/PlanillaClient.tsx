"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PlanillaRegistro = {
  id: string;
  nombre: string;
  unidad: string;
  tarifa: number;
  createdAt: string;
};

type Planilla = {
  id: string;
  nombre: string;
  periodo: string | null;
  registros: PlanillaRegistro[];
};

const UNIDAD_LABEL: Record<string, string> = { DIA: "día", M2: "m²", M3: "m³" };

export function PlanillaClient({
  proyectoId,
  proyectoNombre,
  proyectos,
}: {
  proyectoId: string;
  proyectoNombre: string;
  proyectos: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [registroForm, setRegistroForm] = useState<{
    planillaId: string;
    nombre: string;
    unidad: "DIA" | "M2" | "M3";
    tarifa: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/planillas?proyectoId=${proyectoId}`);
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setPlanillas(data);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [proyectoId]);

  const crearBloque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || creando) return;
    setCreando(true);
    const res = await fetch("/api/planillas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proyectoId, nombre: nuevoNombre.trim() }),
    });
    setCreando(false);
    if (res.ok) {
      setNuevoNombre("");
      router.refresh();
      const data = await res.json();
      setPlanillas((prev) => [{ ...data, registros: data.registros ?? [] }, ...prev]);
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al crear bloque");
    }
  };

  const agregarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroForm || !registroForm.nombre.trim()) return;
    const tarifa = parseFloat(registroForm.tarifa);
    if (isNaN(tarifa) || tarifa < 0) {
      alert("Tarifa debe ser un número >= 0");
      return;
    }
    const res = await fetch(`/api/planillas/${registroForm.planillaId}/registros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: registroForm.nombre.trim(),
        unidad: registroForm.unidad,
        tarifa,
      }),
    });
    if (res.ok) {
      setRegistroForm(null);
      router.refresh();
      const nuevo = await res.json();
      setPlanillas((prev) =>
        prev.map((p) =>
          p.id === registroForm.planillaId
            ? { ...p, registros: [...p.registros, nuevo] }
            : p
        )
      );
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al agregar registro");
    }
  };

  const eliminarRegistro = async (planillaId: string, registroId: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const res = await fetch(`/api/planillas/${planillaId}/registros/${registroId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
      setPlanillas((prev) =>
        prev.map((p) =>
          p.id === planillaId
            ? { ...p, registros: p.registros.filter((r) => r.id !== registroId) }
            : p
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de proyecto */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <label className="mb-2 block text-xs font-medium uppercase" style={{ color: "var(--text3)" }}>
          Proyecto
        </label>
        <select
          value={proyectoId}
          onChange={(e) => router.push(`/platform/planilla?proyecto=${e.target.value}`)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
          style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Crear bloque de planilla */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-3 font-bold">Crear bloque de planilla</h2>
        <p className="mb-3 text-sm" style={{ color: "var(--text3)" }}>
          Un bloque agrupa varios registros (por ejemplo: &quot;Planilla Marzo 2025&quot;). Luego agregas registros con nombre, unidad y tarifa.
        </p>
        <form onSubmit={crearBloque} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>
              Nombre del bloque
            </label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Planilla Marzo 2025"
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <button
            type="submit"
            disabled={!nuevoNombre.trim() || creando}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-black"
            style={{ background: "var(--accent)" }}
          >
            {creando ? "Creando…" : "+ Crear bloque"}
          </button>
        </form>
      </div>

      {/* Lista de bloques */}
      {loading ? (
        <p style={{ color: "var(--text3)" }}>Cargando…</p>
      ) : planillas.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
        >
          <p>No hay bloques de planilla en este proyecto.</p>
          <p className="mt-1 text-sm">Crea uno arriba para empezar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {planillas.map((planilla) => (
            <div
              key={planilla.id}
              className="overflow-hidden rounded-xl border"
              style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <h3 className="font-bold">{planilla.nombre}</h3>
                <button
                  type="button"
                  onClick={() =>
                    setRegistroForm(
                      registroForm?.planillaId === planilla.id
                        ? null
                        : { planillaId: planilla.id, nombre: "", unidad: "DIA", tarifa: "" }
                    )
                  }
                  className="rounded px-3 py-1.5 text-xs font-medium"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  {registroForm?.planillaId === planilla.id ? "Cancelar" : "+ Agregar registro"}
                </button>
              </div>

              {registroForm?.planillaId === planilla.id && (
                <form
                  onSubmit={agregarRegistro}
                  className="border-b p-4"
                  style={{ borderColor: "var(--border)", background: "var(--bg)" }}
                >
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Nombre</label>
                      <input
                        type="text"
                        value={registroForm.nombre}
                        onChange={(e) => setRegistroForm((f) => f && { ...f, nombre: e.target.value })}
                        placeholder="Ej: Obrero general"
                        className="w-full rounded border px-2 py-1.5 text-sm"
                        style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Unidad</label>
                      <select
                        value={registroForm.unidad}
                        onChange={(e) =>
                          setRegistroForm((f) => f && { ...f, unidad: e.target.value as "DIA" | "M2" | "M3" })
                        }
                        className="w-full rounded border px-2 py-1.5 text-sm"
                        style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <option value="DIA">día</option>
                        <option value="M2">m²</option>
                        <option value="M3">m³</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] uppercase" style={{ color: "var(--text3)" }}>Tarifa (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={registroForm.tarifa}
                        onChange={(e) => setRegistroForm((f) => f && { ...f, tarifa: e.target.value })}
                        placeholder="0"
                        className="w-full rounded border px-2 py-1.5 text-sm"
                        style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={!registroForm.nombre.trim() || !registroForm.tarifa}
                        className="rounded px-3 py-1.5 text-xs font-medium"
                        style={{ background: "var(--accent)", color: "#000" }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "var(--bg3)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                        Nombre
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                        Unidad
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                        Tarifa
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text3)" }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planilla.registros.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center" style={{ color: "var(--text3)" }}>
                          Sin registros. Haz clic en &quot;+ Agregar registro&quot; para agregar uno.
                        </td>
                      </tr>
                    ) : (
                      planilla.registros.map((r) => (
                        <tr
                          key={r.id}
                          className="transition hover:bg-black/5"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td className="px-4 py-3 font-medium">{r.nombre}</td>
                          <td className="px-4 py-3" style={{ color: "var(--text2)" }}>
                            {UNIDAD_LABEL[r.unidad] ?? r.unidad}
                          </td>
                          <td className="px-4 py-3 font-mono" style={{ color: "var(--accent)" }}>
                            Q{r.tarifa.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => eliminarRegistro(planilla.id, r.id)}
                              className="rounded p-0.5 text-xs transition hover:opacity-80"
                              style={{ color: "var(--red)" }}
                              title="Eliminar"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
