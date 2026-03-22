"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Desembolso = {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string | null;
  unidad?: { id: string; etiqueta: string; numero: number } | null;
};

type UnidadLite = { id: string; etiqueta: string; numero: number };

type Props = {
  proyectoId: string;
  desembolsos: Desembolso[];
  totalDesembolsado: number;
  totalEjecutado: number;
  unidades: UnidadLite[];
  puedeEditar: boolean;
};

export function FondosPanel({
  proyectoId,
  desembolsos,
  totalDesembolsado,
  totalEjecutado,
  unidades,
  puedeEditar,
}: Props) {
  const router = useRouter();
  const [monto, setMonto] = useState<number | "">("");
  const [unidadId, setUnidadId] = useState<string | "proyecto">("proyecto");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fondosDisponibles = totalDesembolsado - totalEjecutado;
  const pctEjecutadoSobreFondos =
    totalDesembolsado > 0
      ? Math.round((totalEjecutado / totalDesembolsado) * 100)
      : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEditar || !monto || monto <= 0) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        monto,
        descripcion: descripcion || null,
        unidadId: unidadId === "proyecto" ? null : unidadId,
      };
      const res = await fetch(`/api/proyectos/${proyectoId}/desembolsos`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...payload, desembolsoId: editingId } : payload,
        ),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al registrar desembolso");
      }
      setMonto("");
      setDescripcion("");
      setUnidadId("proyecto");
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar desembolso");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="mb-6 rounded-xl border p-5"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            Fondos vs ejecución
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>
            Controla lo desembolsado al proyecto y compáralo contra la ejecución real.
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <ResumenCard
          titulo="Fondos desembolsados"
          valor={totalDesembolsado}
          detalle="Acumulado"
        />
        <ResumenCard
          titulo="Ejecución real"
          valor={totalEjecutado}
          detalle={totalDesembolsado > 0 ? `≈ ${pctEjecutadoSobreFondos}% de fondos` : "Sin fondos aún"}
        />
        <ResumenCard
          titulo="Fondos disponibles"
          valor={fondosDisponibles}
          detalle={fondosDisponibles >= 0 ? "Fondos libres" : "Ejecución mayor a fondos"}
          resaltado={fondosDisponibles < 0 ? "negativo" : fondosDisponibles > 0 ? "positivo" : "neutro"}
        />
      </div>

      {puedeEditar && (
        <form onSubmit={handleAdd} className="mb-4 grid gap-4 md:grid-cols-[1.2fr_1fr_2fr_auto] items-end">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
              Monto desembolsado (Q)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={monto === "" ? "" : monto}
              onChange={(e) => setMonto(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
              Asignado a
            </label>
            <select
              value={unidadId}
              onChange={(e) => setUnidadId(e.target.value as string)}
              className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <option value="proyecto">Proyecto completo</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.etiqueta || `Unidad ${u.numero}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text3)" }}>
              Descripción
            </label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Desembolso Casa 1"
              className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm"
              style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !monto}
            className="rounded-lg px-6 py-2.5 text-sm font-bold text-black disabled:opacity-60 w-full md:w-auto justify-self-end shadow-lg transition hover:opacity-90 active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            {saving ? "Guardando..." : "Agregar"}
          </button>
        </form>
      )}

      {error && (
        <div
          className="mb-3 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(239,68,68,0.06)" }}
        >
          {error}
        </div>
      )}

      {desembolsos.length > 0 ? (
        <div className="max-h-40 overflow-y-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <table className="min-w-full text-xs">
            <thead>
              <tr style={{ background: "var(--bg3)", color: "var(--text3)" }}>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
                <th className="px-3 py-2 text-left font-medium">Monto</th>
                <th className="px-3 py-2 text-left font-medium">Destino</th>
                <th className="px-3 py-2 text-left font-medium">Descripción</th>
                {puedeEditar && (
                  <th className="px-3 py-2 text-right font-medium">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {desembolsos.map((d) => (
                <tr key={d.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-1.5" style={{ color: "var(--text3)" }}>
                    {d.fecha}
                  </td>
                  <td className="px-3 py-1.5 tabular-nums" style={{ color: "var(--text)" }}>
                    {formatMoneda(d.monto)}
                  </td>
                  <td className="px-3 py-1.5" style={{ color: "var(--text3)" }}>
                    {d.unidad ? d.unidad.etiqueta || `Unidad ${d.unidad.numero}` : "Proyecto"}
                  </td>
                  <td className="px-3 py-1.5" style={{ color: "var(--text3)" }}>
                    {d.descripcion || "—"}
                  </td>
                  {puedeEditar && (
                    <td className="px-3 py-1.5 text-right" style={{ color: "var(--text3)" }}>
                      <button
                        type="button"
                        className="mr-2 text-[11px] hover:underline"
                        onClick={() => {
                          setEditingId(d.id);
                          setMonto(d.monto);
                          setDescripcion(d.descripcion ?? "");
                          setUnidadId(d.unidad?.id ?? "proyecto");
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-[11px] text-red-500 hover:underline"
                        onClick={async () => {
                          if (!confirm("¿Eliminar este desembolso?")) return;
                          try {
                            setError(null);
                            const res = await fetch(
                              `/api/proyectos/${proyectoId}/desembolsos?desembolsoId=${encodeURIComponent(d.id)}`,
                              { method: "DELETE" },
                            );
                            if (!res.ok) {
                              const body = await res.json().catch(() => ({}));
                              throw new Error(body.error ?? "Error al eliminar desembolso");
                            }
                            if (editingId === d.id) {
                              setEditingId(null);
                              setMonto("");
                              setDescripcion("");
                              setUnidadId("proyecto");
                            }
                            router.refresh();
                          } catch (e) {
                            setError(
                              e instanceof Error ? e.message : "Error al eliminar desembolso",
                            );
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--text3)" }}>
          Aún no hay desembolsos registrados para este proyecto.
        </p>
      )}
    </section>
  );
}

function ResumenCard({
  titulo,
  valor,
  detalle,
  resaltado,
}: {
  titulo: string;
  valor: number;
  detalle?: string;
  resaltado?: "positivo" | "negativo" | "neutro";
}) {
  let color = "var(--text)";
  if (resaltado === "positivo") color = "var(--green)";
  if (resaltado === "negativo") color = "var(--red)";

  return (
    <div
      className="rounded-xl border p-3.5"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text3)" }}>
        {titulo}
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums" style={{ color }}>
        {formatMoneda(valor)}
      </div>
      {detalle && (
        <div className="mt-0.5 text-[11px]" style={{ color: "var(--text3)" }}>
          {detalle}
        </div>
      )}
    </div>
  );
}

function formatMoneda(valor: number): string {
  if (!valor) return "Q0";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 0,
  }).format(valor);
}

